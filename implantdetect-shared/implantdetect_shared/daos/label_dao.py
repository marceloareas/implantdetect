from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from implantdetect_shared.entities.label import Label

# Cache em memória — labels são imutáveis (seeded no startup, nunca alteradas)
_label_cache_by_id: dict[int, str] = {}
_label_cache_by_name: dict[str, int] = {}

# Implantes efetivamente testados pelo modelo — apenas estes são exibidos na
# página de upload. As demais labels do seed permanecem no banco para uso futuro.
_tested_label_names: set[str] = {
    "SCW 3710",
    "SCW 3711",
    "SCW 3713",
    "SCW 3785",
    "ILCM 3810",
    "Titamax Ti Cortical (4,1) 3,75 x 11,0mm",
    "Titamax Ti Ex (4,1) 3,75 x 13,0mm",
    "Master Easy - Grip Porous RD 3,75 x 8,5mm",
}


class LabelDao:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_label_by_id(self, label_id: int) -> Label | None:
        if label_id in _label_cache_by_id:
            label = Label()
            label.id = label_id
            label.name = _label_cache_by_id[label_id]
            return label
        result = await self.db.execute(select(Label).filter(Label.id == label_id))
        fetched: Label | None = result.scalars().first()
        if fetched:
            _label_cache_by_id[fetched.id] = str(fetched.name)
        return fetched

    async def get_label_by_name(self, name: str) -> Label | None:
        result = await self.db.execute(select(Label).filter(Label.name == name))
        label = result.scalars().first()
        if label:
            _label_cache_by_id[label.id] = str(label.name)
        return label

    async def get_all_labels(self) -> list[Label]:
        """Retorna as labels testadas/disponíveis, ordenadas por nome."""
        result = await self.db.execute(
            select(Label)
            .where(Label.name.in_(_tested_label_names))
            .order_by(Label.name)
        )
        labels = list(result.scalars().all())
        for label in labels:
            _label_cache_by_id[label.id] = str(label.name)
        return labels

    async def get_labels_by_ids(self, ids: set[int]) -> list[Label]:
        """Busca múltiplas labels em uma única query — elimina N+1."""
        if not ids:
            return []

        # Checar quais já estão no cache
        cached: list[Label] = []
        missing: set[int] = set()
        for lid in ids:
            if lid in _label_cache_by_id:
                label = Label()
                label.id = lid
                label.name = _label_cache_by_id[lid]
                cached.append(label)
            else:
                missing.add(lid)

        if not missing:
            return cached

        result = await self.db.execute(select(Label).filter(Label.id.in_(missing)))
        fetched = list(result.scalars().all())
        for label in fetched:
            _label_cache_by_id[label.id] = str(label.name)

        return cached + fetched
