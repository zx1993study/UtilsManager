
"""
页面管理模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class Page(Base):
    """页面管理表"""
    __tablename__ = 'page_info'

    page_id = Column(BigInteger, primary_key=True, comment='页面id')
    page_name = Column(String(255), comment='页面名称')
    description = Column(Text, comment='描述')
    url = Column(String(255), comment='URL')
    token_id = Column(String(255), comment='tokenId')
    function = Column(Text, comment='功能')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_token_id', 'token_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.page_id),
            'name': self.page_name,
            'description': self.description,
            'url': self.url,
            'tokenId': self.token_id,
            'function': self.function,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
