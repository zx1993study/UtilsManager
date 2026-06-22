from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class _CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class PageTokenSaveRequest(_CamelModel):
    page_instance_id: int = Field(..., description="page testcase id")
    token_file_name: Optional[str] = Field(None, description="token json file name")


class PageInspectRequest(_CamelModel):
    page_id: int = Field(..., description="page id")
    page_url: Optional[str] = Field(None, description="override page url")
    replace: bool = Field(default=True, description="replace existing templates")
    headless: bool = Field(default=True, description="run browser in headless mode")
    request_id: Optional[str] = Field(None, description="frontend request id")


class PageTemplateExecuteRequest(_CamelModel):
    page_id: int = Field(..., description="page id")
    instance_ids: List[int] = Field(default_factory=list, description="page testcase ids")
    token_id: Optional[int] = Field(None, description="selected token id")
    request_id: Optional[str] = Field(None, description="frontend request id")
