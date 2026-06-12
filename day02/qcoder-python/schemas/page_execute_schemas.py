"""
页面执行Schema
"""
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class PageExecuteRequest(BaseModel):
    """页面脚本执行请求"""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    file_path: str = Field(..., description="脚本文件路径")
    instance_ids: List[int] = Field(default_factory=list, description="页面实例ID列表")


class PageExecuteFileUpdate(BaseModel):
    """页面脚本文件更新请求"""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    file_path: str = Field(..., description="脚本文件路径")
    content: str = Field(..., description="脚本文件内容")


class PageTokenSaveRequest(BaseModel):
    """执行页面实例并保存浏览器 token JSON 请求"""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    page_instance_id: int = Field(..., description="页面实例ID")
    token_file_name: Optional[str] = Field(None, description="token JSON文件名")
