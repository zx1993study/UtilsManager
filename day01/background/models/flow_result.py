
"""
流程结果模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class FlowResult(Base):
    """流程结果表"""
    __tablename__ = 'flow_result'

    flow_result_id = Column(BigInteger, primary_key=True, comment='流程结果id')
    flow_id = Column(String(255), comment='流程id')
    result_id = Column(String(255), comment='结果id')
    expect_result = Column(Text, comment='预期结果')
    status = Column(String(255), comment='状态')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_flow_id', 'flow_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.flow_result_id),
            'flowId': self.flow_id,
            'resultId': self.result_id,
            'expectResult': self.expect_result,
            'status': self.status,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
