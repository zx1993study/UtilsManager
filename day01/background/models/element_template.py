
"""
元素模板模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class ElementTemplate(Base):
    """元素模板表"""
    __tablename__ = 'element_template'

    element_template_id = Column(BigInteger, primary_key=True, comment='元素模板id')
    element_name = Column(String(255), comment='元素名称')
    page_id = Column(String(255), comment='页面id')
    locator = Column(String(255), comment='定位器')
    element = Column(Text, comment='元素')
    type = Column(String(255), comment='类型')
    status = Column(String(255), comment='状态')
    action = Column(Text, comment='操作')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_page_id', 'page_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.element_template_id),
            'elementName': self.element_name,
            'pageId': self.page_id,
            'locator': self.locator,
            'element': self.element,
            'type': self.type,
            'status': self.status,
            'action': self.action,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
