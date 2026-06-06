import bcrypt
from jose import jwt
from typing import Optional, TypedDict
from jose.exceptions import JWTError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta, timezone

from core.logging import get_logger
from core.configuration import settings

logger = get_logger(__name__)

# bcrypt opera apenas sobre os primeiros 72 bytes da senha. O passlib (usado
# anteriormente) truncava silenciosamente; replicamos isso aqui para manter os
# hashes existentes válidos e evitar o ValueError do bcrypt >= 5.0.
_BCRYPT_MAX_BYTES = 72


def _truncate_password(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")


class JWTPayload(TypedDict):
    sub: str
    exp: int
    role: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_access_token(token: str) -> Optional[JWTPayload]:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(_truncate_password(password), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            _truncate_password(plain_password), hashed_password.encode("utf-8")
        )
    except ValueError:
        # Hash malformado/inválido — trata como falha de autenticação.
        return False


def get_current_user(token: str = Depends(oauth2_scheme)) -> JWTPayload:
    payload = verify_access_token(token)
    if not payload:
        logger.warning("Tentativa de acesso com token inválido ou expirado.")
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    return payload
