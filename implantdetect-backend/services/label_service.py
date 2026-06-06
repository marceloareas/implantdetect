from sqlalchemy.ext.asyncio import AsyncSession

from core.logging import get_logger
from implantdetect_shared.daos.label_dao import LabelDao
from implantdetect_shared.entities.label import Label

logger = get_logger(__name__)


class LabelService:
    def __init__(self, db: AsyncSession):
        self.label_dao = LabelDao(db)

    async def get_all_labels(self) -> list[Label]:
        return await self.label_dao.get_all_labels()
