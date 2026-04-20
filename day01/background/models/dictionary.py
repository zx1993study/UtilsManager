
"""
字典信息模型
"""
from sqlalchemy import Column, BigInteger, String, DateTime
from models import Base
from datetime import datetime

class Dictionary(Base):
    """字典信息表"""
    __tablename__ = 'dictionary_info'

    dict_id = Column(BigInteger, primary_key=True, comment='字典id')
    dict_name = Column(String(255), comment='字典名称')
    key_value = Column(String(255), comment='键值')
    value = Column(String(255), comment='值')
    type = Column(String(255), comment='类型')
    status = Column(String(255), comment='状态')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.dict_id),
            'dictName': self.dict_name,
            'keyValue': self.key_value,
            'value': self.value,
            'type': self.type,
            'status': self.status,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
