"""
日期转换工具
"""
from datetime import datetime
from typing import Optional, Dict, Any


def format_datetime(dt: Optional[datetime], fmt: str = '%Y-%m-%d %H:%M:%S') -> Optional[str]:
    """格式化日期时间"""
    if dt is None:
        return None
    return dt.strftime(fmt)


def parse_datetime(date_str: str, fmt: str = '%Y-%m-%d %H:%M:%S') -> Optional[datetime]:
    """解析日期时间字符串"""
    try:
        return datetime.strptime(date_str, fmt)
    except (ValueError, TypeError):
        return None


def get_current_datetime() -> datetime:
    """获取当前日期时间"""
    return datetime.now()


"""
数据解析工具
"""


def parse_data(data: dict) -> dict:
    """解析数据"""
    return data


"""
审计字段自动处理工具
用于自动设置创建时间和更新时间
"""


def set_create_time(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    为插入操作自动设置创建时间
    
    Args:
        data: 待插入的数据字典
        
    Returns:
        包含create_time的数据字典
    """
    if 'create_time' not in data or data['create_time'] is None:
        data['create_time'] = datetime.now()
    return data


def set_update_time(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    为更新操作自动设置更新时间
    
    Args:
        data: 待更新的数据字典
        
    Returns:
        包含update_time的数据字典
    """
    data['update_time'] = datetime.now()
    return data


def set_audit_fields_for_create(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    为插入操作自动设置所有审计字段（创建时间、更新时间）
    
    Args:
        data: 待插入的数据字典
        
    Returns:
        包含审计字段的数据字典
    """
    now = datetime.now()
    if 'create_time' not in data or data['create_time'] is None:
        data['create_time'] = now
    if 'update_time' not in data or data['update_time'] is None:
        data['update_time'] = now
    return data


def set_audit_fields_for_update(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    为更新操作自动设置所有审计字段（更新时间）
    
    Args:
        data: 待更新的数据字典
        
    Returns:
        包含审计字段的数据字典
    """
    data['update_time'] = datetime.now()
    return data
