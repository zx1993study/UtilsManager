
"""
页面结果模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class PageResult(Base):
    """页面结果表"""
    __tablename__ = 'page_result'

    page_result_id = Column(BigInteger, primary_key=True, comment='页面结果id')
    page_instance_id = Column(String(255), comment='页面实例id')
    return_info = Column(Text, comment='返回信息')
    code = Column(String(255), comment='code')
    result_status = Column(String(255), comment='结果状态')
    remark = Column(String(255), comment='备注')
    screenshot_path = Column(String(255), comment='截图路径')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_page_instance_id', 'page_instance_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.page_result_id),
            'pageInstanceId': self.page_instance_id,
            'returnInfo': self.return_info,
            'code': self.code,
            'resultStatus': self.result_status,
            'remark': self.remark,
            'screenshotPath': self.screenshot_path,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
