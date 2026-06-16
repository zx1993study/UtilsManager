from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer
from pydantic.alias_generators import to_camel


class PageInstanceBase(BaseModel):
    """页面实例基础 Schema。"""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    page_id: Optional[int] = Field(None, description="页面id")
    operation_json: Optional[str] = Field(None, description="操作JSON")
    instance_name: Optional[str] = Field(None, description="页面实例名称")
    screen_photo_file: Optional[str] = Field(None, description="页面实例截图文件路径")
    description: Optional[str] = Field(None, description="描述")
    expect_result: Optional[str] = Field(None, description="预期结果")
    exec_count: Optional[int] = Field(0, description="执行次数")
    status: Optional[int] = Field(None, description="状态")
    remark: Optional[str] = Field(None, description="备注")


class PageInstanceCreate(PageInstanceBase):
    """页面实例创建 Schema。"""
    pass


class PageInstanceUpdate(PageInstanceBase):
    """页面实例更新 Schema。"""
    page_instance_id: int = Field(..., description="主键")


class PageInstanceIds(BaseModel):
    ids: list[int] = Field(..., description="页面实例ID列表")


class PageInstanceInfo(PageInstanceBase):
    """页面实例响应 Schema。"""
    page_instance_id: Optional[int] = Field(None, description="主键")
    creator: Optional[str] = Field(None, description="创建人")
    create_time: Optional[datetime] = Field(None, description="创建时间")
    update_time: Optional[datetime] = Field(None, description="更新时间")

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        if dt is None:
            return None
        return dt.strftime("%Y-%m-%d %H:%M:%S")
