"""
日志配置
"""
import logging
import os
import sys
from logging.handlers import RotatingFileHandler

from core.config import settings


def get_log_file_path() -> str:
    os.makedirs(settings.LOG_DIR, exist_ok=True)
    return os.path.abspath(os.path.join(settings.LOG_DIR, settings.LOG_FILE_NAME))


def _build_formatter() -> logging.Formatter:
    return logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def _has_handler(
    target_logger: logging.Logger,
    handler_type: type,
    target_path: str | None = None,
) -> bool:
    for handler in target_logger.handlers:
        if isinstance(handler, handler_type):
            if target_path is None:
                return True
            if getattr(handler, "baseFilename", None) == target_path:
                return True
    return False


def _add_file_handler(
    target_logger: logging.Logger,
    formatter: logging.Formatter,
    level: int,
) -> None:
    log_path = get_log_file_path()
    if _has_handler(target_logger, RotatingFileHandler, log_path):
        return

    file_handler = RotatingFileHandler(
        log_path,
        maxBytes=settings.LOG_MAX_BYTES,
        backupCount=settings.LOG_BACKUP_COUNT,
        encoding="utf-8",
    )
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    target_logger.addHandler(file_handler)


def configure_runtime_logging() -> str:
    """让应用日志和 uvicorn 控制台日志同时写入文件。"""
    level = logging.DEBUG if settings.DEBUG else logging.INFO
    formatter = _build_formatter()

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    _add_file_handler(root_logger, formatter, level)

    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        target_logger = logging.getLogger(logger_name)
        target_logger.setLevel(level)
        _add_file_handler(target_logger, formatter, level)

    return get_log_file_path()


def get_logger(name: str = "zx_api") -> logging.Logger:
    """获取 logger 实例。"""
    target_logger = logging.getLogger(name)
    level = logging.DEBUG if settings.DEBUG else logging.INFO
    formatter = _build_formatter()

    target_logger.setLevel(level)
    target_logger.propagate = False
    if not _has_handler(target_logger, logging.StreamHandler):
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_handler.setFormatter(formatter)
        target_logger.addHandler(console_handler)

    _add_file_handler(target_logger, formatter, level)
    configure_runtime_logging()
    return target_logger


logger = get_logger()
