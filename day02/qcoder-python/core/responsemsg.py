"""
统一响应消息
"""
from typing import Any, Optional


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
    error: Optional[str] = None
) -> dict:
    """错误响应"""
    return {
        "msg": msg,
        "success": False,
        "data": data,
        "error": error
    }
