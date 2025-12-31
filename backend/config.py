"""
Configuration management for the gamified LLM platform backend.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Firebase Configuration
    firebase_credentials_path: str = "./firebase-credentials.json"
    firebase_project_id: str = "your-project-id"
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True
    
    # LLM Configuration
    llm_api_key: Optional[str] = None
    llm_model: str = "gpt-4"
    
    # Game Configuration
    default_computation_budget: int = 1000
    max_agent_depth: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
