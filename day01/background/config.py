
"""
应用配置文件
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """基础配置"""

    # 应用配置
    APP_NAME = "自动化测试平台"
    APP_VERSION = "1.0.0"
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

    # 数据库配置
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'zx_test')

    # JWT配置
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # 日志配置
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_DIR = os.path.join(os.path.dirname(__file__), 'logs')

    # 文件上传配置
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    # Playwright配置
    PLAYWRIGHT_HEADLESS = os.getenv('PLAYWRIGHT_HEADLESS', 'True').lower() == 'true'
    PLAYWRIGHT_TIMEOUT = int(os.getenv('PLAYWRIGHT_TIMEOUT', 30000))

    # Excel导出配置
    EXPORT_DIR = os.path.join(os.path.dirname(__file__), 'exports')

    @staticmethod
    def get_db_uri():
        """获取数据库连接URI"""
        return f"mysql+pymysql://{Config.DB_USER}:{Config.DB_PASSWORD}@{Config.DB_HOST}:{Config.DB_PORT}/{Config.DB_NAME}?charset=utf8mb4"

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DB_NAME = 'zx_test'

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
