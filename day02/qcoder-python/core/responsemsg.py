"""统一响应消息。"""
import sys
import traceback
from typing import Any, Optional


def _log_active_exception(msg: str, data: Any = None, error: Optional[str] = None) -> None:
    exc_type, exc, tb = sys.exc_info()
    if exc_type is None or exc is None:
        return

    try:
        from core.logger import logger

        response_error = error
        if response_error is None and isinstance(data, dict):
            response_error = data.get("error")

        logger.error(f"业务捕获异常 - 响应消息: {msg}")
        if response_error:
            logger.error(f"返回错误信息: {response_error}")
        logger.error(f"错误类型: {exc_type.__name__}")
        logger.error(f"错误信息: {exc}")
        logger.error(
            "堆栈跟踪:\n%s",
            "".join(traceback.format_exception(exc_type, exc, tb)),
        )
    except Exception:
        pass


def success_response(
    msg: str = "操作成功",
    data: Any = None,
) -> dict:
    """成功响应"""
    return {
        "msg": msg,
        "success": True,
        "data": data
    }


def error_response(
    msg: str = "操作失败",
    data: Any = None,
    error: Optional[str] = None,
    log_exception: bool = True,
) -> dict:
    """错误响应"""
    if log_exception:
        _log_active_exception(msg=msg, data=data, error=error)
    return {
        "msg": msg,
        "success": False,
        "data": data,
        "error": error
    }
