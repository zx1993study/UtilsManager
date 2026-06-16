from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class IdsPayload(CamelModel):
    ids: list[int] = Field(default_factory=list)


class AppInfoBase(CamelModel):
    app_name: Optional[str] = None
    project_id: Optional[int] = None
    platform: Optional[str] = "Android"
    app_package: Optional[str] = None
    app_activity: Optional[str] = None
    bundle_id: Optional[str] = None
    device_name: Optional[str] = None
    platform_version: Optional[str] = None
    appium_server: Optional[str] = "http://127.0.0.1:4723"
    desired_caps: Optional[str] = None
    file_name: Optional[str] = None
    real_file_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[int] = 1
    remark: Optional[str] = None


class AppInfoCreate(AppInfoBase):
    app_name: str


class AppInfoUpdate(AppInfoBase):
    app_id: int


class AppInfoOut(AppInfoBase):
    app_id: Optional[int] = None
    creator: Optional[str] = None
    create_time: Optional[datetime] = None
    update_time: Optional[datetime] = None

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else None


class AppTemplateBase(CamelModel):
    template_name: Optional[str] = None
    app_id: Optional[int] = None
    locator_type: Optional[str] = "id"
    locator_value: Optional[str] = None
    element_type: Optional[str] = "input"
    action_type: Optional[str] = "click"
    input_key: Optional[str] = None
    default_value: Optional[str] = None
    sort_order: Optional[int] = 1
    status: Optional[int] = 1
    remark: Optional[str] = None


class AppTemplateCreate(AppTemplateBase):
    template_name: str
    app_id: int
    locator_type: str
    locator_value: str
    action_type: str


class AppTemplateUpdate(AppTemplateBase):
    template_id: int


class AppTemplateOut(AppTemplateBase):
    template_id: Optional[int] = None
    creator: Optional[str] = None
    create_time: Optional[datetime] = None
    update_time: Optional[datetime] = None

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else None


class AppInstanceBase(CamelModel):
    app_id: Optional[int] = None
    instance_name: Optional[str] = None
    operation_json: Optional[str] = None
    expect_result: Optional[str] = None
    screen_photo_file: Optional[str] = None
    exec_count: Optional[int] = 0
    description: Optional[str] = None
    status: Optional[int] = 1
    remark: Optional[str] = None


class AppInstanceCreate(AppInstanceBase):
    app_id: int
    instance_name: str


class AppInstanceUpdate(AppInstanceBase):
    app_instance_id: int


class AppInstanceOut(AppInstanceBase):
    app_instance_id: Optional[int] = None
    creator: Optional[str] = None
    create_time: Optional[datetime] = None
    update_time: Optional[datetime] = None

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else None


class AppResultOut(CamelModel):
    app_result_id: Optional[int] = None
    app_instance_id: Optional[int] = None
    result_status: Optional[int] = None
    code: Optional[str] = None
    response_info: Optional[str] = None
    screenshot_path: Optional[str] = None
    remark: Optional[str] = None
    creator: Optional[str] = None
    create_time: Optional[datetime] = None
    update_time: Optional[datetime] = None

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        return dt.strftime("%Y-%m-%d %H:%M:%S") if dt else None


class AppExecuteRequest(CamelModel):
    app_id: int
    instance_ids: list[int]
