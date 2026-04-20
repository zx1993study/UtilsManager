
"""
流程信息模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime
from models import Base
from datetime import datetime

class Flow(Base):
    """流程信息表"""
    __tablename__ = 'flow_info'

    flow_id = Column(BigInteger, primary_key=True, comment='流程id')
    flow_name = Column(String(255), comment='流程名称')
    description = Column(Text, comment='描述')
    expect_result = Column(Text, comment='预期结果')
    actual_result = Column(Text, comment='实际结果')
    status = Column(String(255), comment='状态')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.flow_id),
            'name': self.flow_name,
            'description': self.description,
            'expectedResult': self.expect_result,
            'actualResult': self.actual_result,
            'status': self.status,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
