
"""
流程服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.flow import Flow
from models.flow_step import FlowStep
from services.base_service import BaseService
import time

class FlowService(BaseService[Flow]):
    """流程服务类"""

    def __init__(self):
        super().__init__(Flow)

    def create_flow(self, db: Session, flow_data: Dict[str, Any]) -> Flow:
        """创建新流程"""
        # 生成流程ID
        if 'flow_id' not in flow_data:
            flow_data['flow_id'] = int(time.time() * 1000)

        # 设置默认状态
        if 'status' not in flow_data:
            flow_data['status'] = 'pending'

        return self.create(db, flow_data)

    def update_flow(self, db: Session, flow_id: int, flow_data: Dict[str, Any]) -> Optional[Flow]:
        """更新流程信息"""
        flow = self.get(db, flow_id)
        if not flow:
            return None

        return self.update(db, flow, flow_data)

    def get_flows_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Flow]:
        """根据状态获取流程列表"""
        return self.get_multi(db, skip=skip, limit=limit, status=status)

    def toggle_status(self, db: Session, flow_id: int) -> Optional[Flow]:
        """切换流程状态"""
        flow = self.get(db, flow_id)
        if not flow:
            return None

        status_map = {
            'pending': 'running',
            'running': 'completed',
            'completed': 'pending'
        }
        flow.status = status_map.get(flow.status, 'pending')
        db.commit()
        db.refresh(flow)
        return flow

    def search_flows(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Flow]:
        """搜索流程"""
        query = db.query(Flow).filter(
            Flow.flow_name.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def get_flow_steps(self, db: Session, flow_id: int) -> List[FlowStep]:
        """获取流程步骤"""
        return db.query(FlowStep).filter(
            FlowStep.api_id == str(flow_id)
        ).all()

    def add_flow_step(self, db: Session, step_data: Dict[str, Any]) -> FlowStep:
        """添加流程步骤"""
        # 生成步骤ID
        if 'flow_step_id' not in step_data:
            step_data['flow_step_id'] = int(time.time() * 1000)

        step = FlowStep(**step_data)
        db.add(step)
        db.commit()
        db.refresh(step)
        return step

    def update_flow_step(self, db: Session, step_id: int, step_data: Dict[str, Any]) -> Optional[FlowStep]:
        """更新流程步骤"""
        step = db.query(FlowStep).filter(FlowStep.flow_step_id == step_id).first()
        if not step:
            return None

        for field, value in step_data.items():
            if hasattr(step, field):
                setattr(step, field, value)

        db.commit()
        db.refresh(step)
        return step

    def delete_flow_step(self, db: Session, step_id: int) -> bool:
        """删除流程步骤"""
        step = db.query(FlowStep).filter(FlowStep.flow_step_id == step_id).first()
        if not step:
            return False

        db.delete(step)
        db.commit()
        return True

# 创建全局流程服务实例
flow_service = FlowService()
