"""
JSON解析工具
"""
import json
from typing import Any, Optional


def parse_json(json_str: str) -> Optional[Any]:
    """解析JSON字符串"""
    try:
        return json.loads(json_str)
    except (json.JSONDecodeError, TypeError):
        return None


def to_json(obj: Any, indent: int = 2) -> str:
    """转换为JSON字符串"""
    try:
        return json.dumps(obj, ensure_ascii=False, indent=indent)
    except (TypeError, ValueError):
        return ""
