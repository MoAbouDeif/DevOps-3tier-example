import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev")
    DEBUG = os.getenv("DEBUG", "False") == "True"
    
    # PostgreSQL Configuration
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_USER = os.getenv("POSTGRES_USER", "calc_user")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "securepassword")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "calc_db")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    
    # CORS Configuration
    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    ]