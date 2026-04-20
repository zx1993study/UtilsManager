
"""
日志配置模块
"""
import os
import logging
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger
from config import Config

class LoggerSetup:
    """日志设置类"""

    @staticmethod
    def setup_logger(name='autotest'):
        """设置日志记录器"""
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, Config.LOG_LEVEL))

        # 确保日志目录存在
        os.makedirs(Config.LOG_DIR, exist_ok=True)

        # 创建格式化器
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
        )

        # JSON格式化器（用于生产环境）
        json_formatter = jsonlogger.JsonFormatter(
            '%(asctime)s %(levelname)s %(module)s %(message)s'
        )

        # 文件处理器（普通格式）
        file_handler = RotatingFileHandler(
            os.path.join(Config.LOG_DIR, 'autotest.log'),
            maxBytes=10485760,  # 10MB
            backupCount=10
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.INFO)

        # 错误日志文件处理器
        error_handler = RotatingFileHandler(
            os.path.join(Config.LOG_DIR, 'error.log'),
            maxBytes=10485760,  # 10MB
            backupCount=10
        )
        error_handler.setFormatter(formatter)
        error_handler.setLevel(logging.ERROR)

        # JSON日志文件处理器
        json_handler = RotatingFileHandler(
            os.path.join(Config.LOG_DIR, 'autotest.json'),
            maxBytes=10485760,  # 10MB
            backupCount=10
        )
        json_handler.setFormatter(json_formatter)
        json_handler.setLevel(logging.INFO)

        # 控制台处理器
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.DEBUG)

        # 添加处理器
        logger.addHandler(file_handler)
        logger.addHandler(error_handler)
        logger.addHandler(json_handler)
        logger.addHandler(console_handler)

        return logger

# 创建全局日志记录器
logger = LoggerSetup.setup_logger()
