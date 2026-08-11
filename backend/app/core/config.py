from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    google_api_key: str = ""
    groq_api_key: str
    gemini_api_key: str = ""
    youtube_api_key: str = ""
    secret_key: str
    environment: str = "development"

    google_oauth_client_id: str = ""
    google_oauth_client_secret: str = ""
    linkedin_oauth_client_id: str = ""
    linkedin_oauth_client_secret: str = ""
    backend_base_url: str = "http://127.0.0.1:8000"
    frontend_base_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
