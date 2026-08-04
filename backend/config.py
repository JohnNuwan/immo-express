"""EVA NODUS - Immo-Express Backend Configuration"""
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    APP_NAME: str = "Immo-Express API · EVA NODUS"
    DATABASE_URL: str = "sqlite:///./immo_express.db"
    SECRET_KEY: str = "eva-nodus-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24h

    class Config:
        env_file = ".env"

settings = Settings()