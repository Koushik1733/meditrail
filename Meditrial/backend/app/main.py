from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.db.models.base import Base
from app.db.models import patient as _patient_models
from app.db.session import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MediTrail API",
    description="Medical records and secure sharing app",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json"
)

origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

# CORS Middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core router
app.include_router(api_v1_router.api_router, prefix="/api/v1")


@app.on_event("startup")
async def initialize_database():
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        if connection.dialect.name == "sqlite":
            columns = await connection.exec_driver_sql("PRAGMA table_info(api_patient_profiles)")
            if "password_hash" not in {row[1] for row in columns.fetchall()}:
                await connection.exec_driver_sql("ALTER TABLE api_patient_profiles ADD COLUMN password_hash VARCHAR(160)")
        elif connection.dialect.name == "postgresql":
            await connection.exec_driver_sql("ALTER TABLE api_patient_profiles ADD COLUMN IF NOT EXISTS password_hash VARCHAR(160)")

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

