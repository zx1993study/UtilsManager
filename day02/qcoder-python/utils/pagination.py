"""
分页工具类
"""
from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, Field

T = TypeVar('T')


class PageResponse(BaseModel, Generic[T]):
    """分页响应模型"""
    total: int = Field(..., description="总记录数")
    page_num: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页大小")
    pages: int = Field(..., description="总页数")
    items: List[T] = Field(default_factory=list, description="数据列表")


def calculate_pages(total: int, page_size: int) -> int:
    """计算总页数"""
    if page_size <= 0:
        return 0
    return (total + page_size - 1) // page_size


def create_page_response(
    items: List[T],
    total: int,
    page_num: int,
    page_size: int
) -> dict:
    """创建分页响应"""
    pages = calculate_pages(total, page_size)
    
    return {
        "total": total,
        "pageNum": page_num,
        "pageSize": page_size,
        "pages": pages,
        "items": items
    }
