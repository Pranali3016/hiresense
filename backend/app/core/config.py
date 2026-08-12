from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    google_api_key: str = ""
    groq_api_key: str = ""
    gemini_api_key: str = ""
    youtube_api_key: str = ""
    secret_key: str = "hiresense_super_secret_production_key_2026"
    environment: str = "production"

    # Google OAuth settings (Supports both naming conventions)
    google_oauth_client_id: str = ""
    google_client_id: str = ""
    google_oauth_client_secret: str = ""
    google_client_secret: str = ""

    # LinkedIn OAuth settings
    linkedin_oauth_client_id: str = ""
    linkedin_oauth_client_secret: str = ""

    backend_base_url: str = "https://hiresense-backend-53pg.onrender.com"
    frontend_base_url: str = "https://hiresense-seven.vercel.app"

    @property
    def effective_google_client_id(self) -> str:
        return self.google_oauth_client_id or self.google_client_id or ""

    @property
    def effective_google_client_secret(self) -> str:
        return self.google_oauth_client_secret or self.google_client_secret or ""

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
