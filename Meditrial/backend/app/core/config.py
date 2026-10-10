from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./meditrail.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    DEMO_MODE: bool = True
    CORS_ORIGINS: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()
