"""
项目配置管理
"""
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

"""加载 .env，使 os.getenv 也能读取到 .env 中的配置（如 PLAYWRIGHT_* 路径）"""
load_dotenv()


class Settings(BaseSettings):
    """应用配置"""

    """应用配置"""
    APP_NAME: str = "ZX API Test Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    """数据库配置"""
    DATABASE_URL: str= os.getenv("DATABASE_URL")

    """JWT配置"""
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    """CORS配置"""
    ALLOWED_ORIGINS: list = ["*"]

    """Playwright 页面自动化配置"""
    PLAYWRIGHT_CODE_PATH: str = os.getenv("PLAYWRIGHT_CODE_PATH", "./playwright_codes")
    PLAYWRIGHT_SCREENSHOT_PATH: str = os.getenv("PLAYWRIGHT_SCREENSHOT_PATH", "./playwright_screenshots")
    PLAYWRIGHT_TOKEN_PATH: str = os.getenv(
        "PLAYWRIGHT_TOKEN_PATH",
        os.path.join(os.getenv("TEMP", os.getcwd()), "qcoder_playwright_tokens"),
    )
    APPIUM_CODE_PATH: str = os.getenv("APPIUM_CODE_PATH", "./appium_codes")
    APPIUM_SCREENSHOT_PATH: str = os.getenv("APPIUM_SCREENSHOT_PATH", "./appium_screenshots")

    """Backend runtime log config"""
    LOG_DIR: str = os.getenv("LOG_DIR", "./logs")
    LOG_FILE_NAME: str = os.getenv("LOG_FILE_NAME", "backend.log")
    LOG_RETENTION_DAYS: int = int(os.getenv("LOG_RETENTION_DAYS", "7"))
    LOG_CLEAN_INTERVAL_SECONDS: int = int(os.getenv("LOG_CLEAN_INTERVAL_SECONDS", "3600"))
    LOG_MAX_BYTES: int = int(os.getenv("LOG_MAX_BYTES", str(20 * 1024 * 1024)))
    LOG_BACKUP_COUNT: int = int(os.getenv("LOG_BACKUP_COUNT", "10"))

    class Config:
        env_file = ".env"
        case_sensitive = True


"""创建全局配置实例"""
settings = Settings()
