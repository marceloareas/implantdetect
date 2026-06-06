from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_async_db
from core.security import get_current_user, JWTPayload
from implantdetect_shared.models.dtos.result_dto import Result
from services.label_service import LabelService

router = APIRouter()


@router.get("", response_model=Result)
async def get_labels(
    db: AsyncSession = Depends(get_async_db),
    user: JWTPayload = Depends(get_current_user),
):
    label_service = LabelService(db)
    labels = await label_service.get_all_labels()
    return Result.ok(
        data={"labels": [{"id": label.id, "name": label.name} for label in labels]}
    )
