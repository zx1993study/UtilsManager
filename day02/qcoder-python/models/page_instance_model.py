from sqlalchemy import BigInteger, Column, DateTime, Integer, SmallInteger, String, Text
from sqlalchemy.dialects.mysql import LONGTEXT

from core.db import Base


class PageInstance(Base):
    __tablename__ = "page_instance"

    page_instance_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    page_id = Column(BigInteger, comment="page id")
    token_id = Column(BigInteger, comment="token id")
    operation_json = Column(Text().with_variant(LONGTEXT(), "mysql"), comment="operation json")
    instance_name = Column(String(50), comment="instance name")
    screen_photo_file = Column(String(100), comment="screenshot file")
    description = Column(Text, comment="description")
    expect_result = Column(Text, comment="expect result")
    exec_count = Column(Integer, default=0, comment="execute count")
    status = Column(SmallInteger, comment="status")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<PageInstance(page_instance_id={self.page_instance_id})>"
