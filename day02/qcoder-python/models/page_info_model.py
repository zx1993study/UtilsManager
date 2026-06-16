from sqlalchemy import BigInteger, Column, DateTime, SmallInteger, String, Text

from core.db import Base


class PageInfo(Base):
    __tablename__ = "page_info"

    page_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    page_name = Column(String(50), comment="page name")
    description = Column(Text, comment="description")
    project_id = Column(BigInteger, comment="project id")
    page_url = Column(String(500), comment="url")
    token_id = Column(BigInteger, comment="token id")
    file_name = Column(String(50), comment="file name")
    real_file_name = Column(String(100), comment="real file name")
    function = Column(Text, comment="function")
    status = Column(SmallInteger, comment="status")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<PageInfo(page_id={self.page_id})>"
