"""
项目配置管理
"""
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# 加载 .env，使 os.getenv 也能读取到 .env 中的配置（如 PLAYWRIGHT_* 路径）
load_dotenv()


class Settings(BaseSettings):
    """应用配置"""

    # 应用配置
    APP_NAME: str = "ZX API Test Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # 数据库配置
    DATABASE_URL: str= os.getenv("DATABASE_URL")

    # JWT配置
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS配置
    ALLOWED_ORIGINS: list = ["*"]

    # Playwright 页面自动化配置
    PLAYWRIGHT_CODE_PATH: str = os.getenv("PLAYWRIGHT_CODE_PATH", "./playwright_codes")
    PLAYWRIGHT_SCREENSHOT_PATH: str = os.getenv("PLAYWRIGHT_SCREENSHOT_PATH", "./playwright_screenshots")
    PLAYWRIGHT_TOKEN_PATH: str = os.getenv("PLAYWRIGHT_TOKEN_PATH", "./playwright_tokens")

    class Config:
        env_file = ".env"
        case_sensitive = True


# 创建全局配置实例
settings = Settings()
