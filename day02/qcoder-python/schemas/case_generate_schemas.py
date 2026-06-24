"""自动生成测试用例 Schema。"""
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CaseGenerateRequest(BaseModel):
    """自动生成用例请求。"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    target_id: int = Field(..., description="API ID 或页面 ID")
    operation_type: Optional[int] = Field(None, description="手动覆盖操作类型")
    exception_ids: Optional[list[int]] = Field(None, description="异常类型 ID 列表")
    template_ids: Optional[list[int]] = Field(None, description="API模板 ID 或元素模板 ID 列表")
    include_common: bool = Field(True, description="是否包含通用异常类型")
    overwrite: bool = Field(False, description="是否覆盖同名用例")
    items: Optional[list["GeneratedCasePreview"]] = Field(None, description="预览编辑后的用例列表")


class GeneratedCasePreview(BaseModel):
    """自动生成用例预览。"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    case_name: str
    target_id: int
    template_id: int
    template_name: str
    exception_id: int
    exception_name: str
    operation_type: int
    operation_type_name: str
    payload: Any
    exists: bool = False


class CaseGenerateResponse(BaseModel):
    """自动生成用例响应。"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    target_id: int
    operation_type: int
    operation_type_name: str
    total: int
    exists_count: int
    items: list[GeneratedCasePreview]
