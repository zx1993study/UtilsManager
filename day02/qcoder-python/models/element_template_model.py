from sqlalchemy import BigInteger, Column, DateTime, SmallInteger, String, Text

from core.db import Base


class ElementTemplate(Base):
    __tablename__ = "element_template"

    element_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    element_name = Column(String(50), comment="element name")
    page_id = Column(BigInteger, comment="page id")
    locator_type = Column(SmallInteger, comment="locator type")
    element_value = Column(Text, comment="element value")
    default_value = Column(Text, comment="default value")
    parent_element = Column(Text, comment="parent element")
    element_type = Column(SmallInteger, comment="element type")
    status = Column(SmallInteger, comment="status")
    operation = Column(SmallInteger, comment="operation")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<ElementTemplate(element_id={self.element_id})>"
