"""API testcase instance schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer
from pydantic.alias_generators import to_camel

from models.api_instance_model import ApiInstance


class ApiInstanceBase(BaseModel):
    """Base schema for API testcase instances."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    instance_name: Optional[str] = Field(None, description="instance name")
    description: Optional[str] = Field(None, description="description")
    api_id: Optional[int] = Field(None, description="api id")
    token_id: Optional[int] = Field(None, description="tokenId")
    instance_json: Optional[str] = Field(None, description="instance JSON")
    exec_count: Optional[int] = Field(None, description="execute count")
    status: Optional[int] = Field(None, description="status")
    expect_result: Optional[str] = Field(None, description="expect result")
    remark: Optional[str] = Field(None, description="remark")


class ApiInstanceList(ApiInstanceBase):
    """List query schema."""

    page_num: int = Field(1, description="page number")
    page_size: int = Field(10, description="page size")

    def filter_params(self):
        filter_params = []
        if self.instance_name is not None:
            filter_params.append(ApiInstance.instance_name.contains(self.instance_name))
        if self.description is not None:
            filter_params.append(ApiInstance.description.contains(self.description))
        if self.api_id is not None:
            filter_params.append(ApiInstance.api_id == self.api_id)
        return filter_params


class ApiInstanceCreate(ApiInstanceBase):
    """Create schema."""

    pass


class ApiInstanceUpdate(ApiInstanceBase):
    """Update schema."""

    instance_id: int = Field(..., description="primary key")


class ApiInstanceInfo(ApiInstanceBase):
    """Response schema."""

    instance_id: Optional[int] = Field(None, description="primary key")
    creator: Optional[str] = Field(None, description="creator")
    create_time: Optional[datetime] = Field(None, description="create time")
    update_time: Optional[datetime] = Field(None, description="update time")
    project_id: Optional[int] = Field(None, description="project id")
    project_name: Optional[str] = Field(None, description="project name")
    project_address: Optional[str] = Field(None, description="project address")
    api_name: Optional[str] = Field(None, description="api name")
    method_url: Optional[str] = Field(None, description="api URL")
    token_name: Optional[str] = Field(None, description="token name")

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        if dt is None:
            return None
        return dt.strftime("%Y-%m-%d %H:%M:%S")
