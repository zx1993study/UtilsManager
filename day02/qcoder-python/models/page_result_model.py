from sqlalchemy import BigInteger, Column, DateTime, SmallInteger, String, Text

from core.db import Base


class PageResult(Base):
    __tablename__ = "page_result"

    page_result_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="page result id")
    page_instance_id = Column(BigInteger, comment="page instance id")
    response_info = Column(Text, comment="response info")
    code = Column(String(50), comment="code")
    result_status = Column(SmallInteger, comment="result status")
    remark = Column(Text, comment="remark")
    screenshot_path = Column(Text, comment="screenshot path")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<PageResult(page_result_id={self.page_result_id})>"
