from sqlalchemy import text, select
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine

from core.logging import get_logger
from core.configuration import settings
from implantdetect_shared.entities import Base, Label

logger = get_logger(__name__)

async_engine = create_async_engine(
    settings.DATABASE_URL, echo=settings.SQL_ECHO, future=True
)

async_session_factory = async_sessionmaker(bind=async_engine, expire_on_commit=False)


async def get_async_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except HTTPException:
            await session.rollback()
            raise
        except Exception as e:
            await session.rollback()
            logger.error(f"Database error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro interno do banco de dados.",
            )
        finally:
            await session.close()


async def create_tables():
    """Cria tabelas apenas em ambientes não-produção (dev/testes).
    Em produção, o schema é gerenciado pelo Alembic.
    """

    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Tabelas criadas/verificadas com sucesso.")
        await _seed_labels_if_empty()
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {str(e)}", exc_info=True)


async def _seed_labels_if_empty():
    async with async_session_factory() as session:
        result = await session.execute(select(Label).limit(1))
        if result.scalars().first() is None:
            await _seed_labels(session)
            await session.commit()
            logger.info("Labels inseridas com sucesso.")


async def _seed_labels(session):
    labels = [
        "CMSW 3813",
        "CMSW 4510",
        "ILCM 3510",
        "ILCM 3511",
        "ILCM 3513",
        "ILCM 3810",
        "ILCM 3811",
        "ILCM 3813",
        "ILCM 3885",
        "ILCM 4510",
        "ILCM 4511",
        "ILCM 4585",
        "ILHE 3510",
        "ILHE 3511",
        "ILHE 3711",
        "ILHE 3785",
        "ILHE 4010",
        "ILHE 4011",
        "ILHE 4510",
        "ILHE 4511",
        "ILHE 4585",
        "Master AR - Torq Porous NP 3,75 x 13,0mm",
        "Master Connect AR 3,75 x 11,5mm",
        "Master Connect AR 5,0 x 10,0mm",
        "Master Easy - Grip Actives RD 3,75 x 10,0mm",
        "Master Easy - Grip Actives RD 3,75 x 11,5mm",
        "Master Easy - Grip Porous RD 3,75 x 10,0mm",
        "Master Easy - Grip Porous RD 3,75 x 11,5mm",
        "Master Easy - Grip Porous RD 3,75 x 13,0mm",
        "Master Easy - Grip Porous RD 3,75 x 8,5mm",
        "SA 313",
        "SA 411",
        "SCO 3510",
        "SCW 3211",
        "SCW 3707",
        "SCW 3710",
        "SCW 3711",
        "SCW 3713",
        "SCW 3785",
        "SW 3811",
        "SW 3885",
        "SW 4513",
        "SW 5085",
        "SWCM 3513",
        "SWCM 4513",
        "SWCM 5010",
        "SWHE 3710",
        "Titamax Ti Cortical (4,1) 3,75 x 11,0mm",
        "Titamax Ti Ex (4,1) 3,75 x 13,0mm",
    ]
    session.add_all([Label(name=name) for name in labels])


async def database_health_check():
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
            return "available"
    except Exception as e:
        logger.error(f"Erro ao conectar ao banco: {str(e)}", exc_info=True)
        return "unavailable"
