
"""
页面实例模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class PageInstance(Base):
    """页面实例表"""
    __tablename__ = 'page_instance'

    page_instance_id = Column(BigInteger, primary_key=True, comment='页面实例id')
    page_id = Column(String(255), comment='页面id')
    action_json = Column(Text, comment='操作JSON')
    page_instance_name = Column(String(255), comment='页面实例名称')
    description = Column(Text, comment='描述')
    expect_result = Column(Text, comment='预期结果')
    status = Column(String(255), comment='状态')
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
            'id': str(self.page_instance_id),
            'pageId': self.page_id,
            'actionJson': self.action_json,
            'pageInstanceName': self.page_instance_name,
            'description': self.description,
            'expectResult': self.expect_result,
            'status': self.status,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
