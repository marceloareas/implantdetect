import os
import re
import uvicorn
from pathlib import Path

from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse, FileResponse
from fastapi import Depends, FastAPI, Request, HTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from core.logging import get_logger
from core.configuration import settings
from implantdetect_shared.models.dtos.result_dto import Result
from controllers import (
    user_controller,
    image_controller,
    process_controller,
    admin_controller,
    label_controller,
)
from core.database import create_tables, database_health_check, async_session_factory
from implantdetect_shared.daos.process_dao import ProcessDao
from implantdetect_shared.enums.process_status import ProcessStatus
from services.queue_service import queue_service
from fastapi.middleware.cors import CORSMiddleware
from core.database import get_async_db
from core.limiter import limiter
from core.security import get_current_user, JWTPayload
from implantdetect_shared.daos.image_dao import ImageDAO
from sqlalchemy.ext.asyncio import AsyncSession

logger = get_logger(__name__)

os.makedirs(settings.IMAGE_REPOSITORY, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    logger.info("Banco de dados inicializado")
    async with async_session_factory() as session:
        dao = ProcessDao(session)
        stale = [ProcessStatus.PENDING, ProcessStatus.RUNNING]
        count = await dao.fail_stale_processes(ProcessStatus.FAILED, stale)
        await session.commit()
        if count:
            logger.warning(
                f"{count} processo(s) travado(s) marcado(s) como FAILED na inicialização."
            )
    await queue_service.connect()
    yield
    await queue_service.disconnect()
    logger.info("Aplicativo encerrando, liberando recursos")


docs_enabled = settings.ENVIRONMENT != "production"

app = FastAPI(
    title="ImplantDetect API",
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(user_controller.router, prefix="/users", tags=["users"])
app.include_router(image_controller.router, prefix="/images", tags=["images"])
app.include_router(process_controller.router, prefix="/processing", tags=["processing"])
app.include_router(admin_controller.router, prefix="/admin", tags=["admin"])
app.include_router(label_controller.router, prefix="/labels", tags=["labels"])


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content=Result.error(
            message="Muitas tentativas. Tente novamente em instantes."
        ),
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code, content=Result.error(message=exc.detail)
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Exceção não tratada em {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500, content=Result.error(message="Erro interno do servidor.")
    )


@app.get("/health", tags=["health"])
async def health_check():
    try:
        db_status = await database_health_check()
    except Exception as e:
        logger.error(f"Erro no healthcheck do banco: {e}")
        db_status = "unavailable"
    return {"status": "ok", "database": db_status}


@app.get("/uploads/{filename:path}", tags=["uploads"])
async def get_protected_image(
    filename: str,
    db: AsyncSession = Depends(get_async_db),
    user: JWTPayload = Depends(get_current_user),
):
    # Validar formato: <sha256hex>.<ext> — previne path traversal
    if not re.fullmatch(r"[a-f0-9]{64}\.[a-zA-Z]{3,4}", filename):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    base = Path(settings.IMAGE_REPOSITORY).resolve()
    file_path = (base / filename).resolve()

    if not file_path.is_relative_to(base):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    # Verificar ownership: usuário deve ter ao menos uma imagem com esse hash
    user_id = int(user["sub"])
    file_hash = Path(filename).stem
    image_dao = ImageDAO(db, settings.IMAGE_REPOSITORY)
    is_admin = user.get("role") == "admin"
    if not is_admin and not await image_dao.user_has_access_to_hash(file_hash, user_id):
        raise HTTPException(status_code=403, detail="Acesso negado.")

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    return FileResponse(file_path)


if __name__ == "__main__":
    logger.info("Inicializando o backend do ImplantDetect...")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
