from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer
from pydantic.alias_generators import to_camel

from models.element_template_model import ElementTemplate


class ElementTemplateBase(BaseModel):
    """元素模板基础 Schema。"""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    element_name: Optional[str] = Field(None, description="元素名称")
    page_id: Optional[int] = Field(None, description="页面ID")
    locator_type: Optional[int] = Field(None, description="定位器类型")
    element_value: Optional[str] = Field(None, description="元素定位值")
    default_value: Optional[str] = Field(None, description="默认值")
    parent_element: Optional[str] = Field(None, description="父元素")
    element_type: Optional[int] = Field(None, description="元素类型")
    status: Optional[int] = Field(None, description="状态")
    operation: Optional[int] = Field(None, description="操作")
    remark: Optional[str] = Field(None, description="备注")


class ElementTemplateCreate(ElementTemplateBase):
    """元素模板创建 Schema。"""
    pass


class ElementTemplateUpdate(ElementTemplateBase):
    """元素模板更新 Schema。"""
    element_id: Optional[int] = Field(None, description="主键")


class ElementTemplateList(ElementTemplateBase):
    """元素模板列表查询 Schema。"""
    page_num: int = Field(default=1, description="页码")
    page_size: int = Field(default=10, description="每页大小")

    def filter_params(self):
        filters = []
        if self.page_id is not None:
            filters.append(ElementTemplate.page_id == self.page_id)
        if self.element_name:
            filters.append(ElementTemplate.element_name.contains(self.element_name))
        if self.locator_type is not None:
            filters.append(ElementTemplate.locator_type == self.locator_type)
        if self.element_type is not None:
            filters.append(ElementTemplate.element_type == self.element_type)
        if self.operation is not None:
            filters.append(ElementTemplate.operation == self.operation)
        if self.status is not None:
            filters.append(ElementTemplate.status == self.status)
        return filters


class ElementTemplateIds(BaseModel):
    ids: list[int] = Field(..., description="元素模板ID列表")


class ElementTemplateInfo(ElementTemplateBase):
    """元素模板响应 Schema。"""
    element_id: Optional[int] = Field(None, description="主键")
    creator: Optional[str] = Field(None, description="创建人")
    create_time: Optional[datetime] = Field(None, description="创建时间")
    update_time: Optional[datetime] = Field(None, description="更新时间")

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        if dt is None:
            return None
        return dt.strftime("%Y-%m-%d %H:%M:%S")
