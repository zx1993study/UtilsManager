from sqlalchemy import BigInteger, Column, DateTime, SmallInteger, String, Text

from core.db import Base


class ProjectInfo(Base):
    __tablename__ = "project_info"

    project_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    project_name = Column(String(50), comment="project name")
    project_address = Column(String(50), comment="project address")
    project_swagger = Column(String(50), comment="project swagger")
    project_env = Column(String(50), comment="project env")
    version = Column(String(50), comment="version")
    remark = Column(Text, comment="remark")
    status = Column(SmallInteger, comment="status")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<ProjectInfo(project_id={self.project_id})>"
