
"""
参数实例服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.param_instance import ParamInstance
from services.base_service import BaseService
import time
from datetime import datetime

class ParamInstanceService(BaseService[ParamInstance]):
    """参数实例服务类"""

    def __init__(self):
        super().__init__(ParamInstance)

    def create_param_instance(self, db: Session, param_data: Dict[str, Any]) -> ParamInstance:
        """创建新参数实例"""
        # 生成参数实例ID
        if 'instance_id' not in param_data:
            param_data['instance_id'] = int(time.time() * 1000)

        return self.create(db, param_data)

    def update_param_instance(self, db: Session, instance_id: int, param_data: Dict[str, Any]) -> Optional[ParamInstance]:
        """更新参数实例信息"""
        param_instance = self.get(db, instance_id)
        if not param_instance:
            return None

        return self.update(db, param_instance, param_data)

    def get_param_instances_by_api(self, db: Session, api_id: str, skip: int = 0, limit: int = 100) -> List[ParamInstance]:
        """根据API ID获取参数实例列表"""
        return self.get_multi(db, skip=skip, limit=limit, api_id=api_id)

    def search_param_instances(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[ParamInstance]:
        """搜索参数实例"""
        query = db.query(ParamInstance).filter(
            ParamInstance.instance_name.like(f'%{keyword}%') |
            ParamInstance.description.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def copy_param_instance(self, db: Session, instance_id: int, new_name: str) -> Optional[ParamInstance]:
        """复制参数实例"""
        param_instance = self.get(db, instance_id)
        if not param_instance:
            return None

        # 创建副本
        copy_data = {
            'instance_name': new_name,
            'description': param_instance.description,
            'api_id': param_instance.api_id,
            'instance_json': param_instance.instance_json,
            'exec_count': 0,
            'status': 'active',
            'expect_result': param_instance.expect_result,
            'remark': param_instance.remark,
            'creator': param_instance.creator
        }

        return self.create_param_instance(db, copy_data)

    def increment_exec_count(self, db: Session, instance_id: int) -> Optional[ParamInstance]:
        """增加执行次数"""
        param_instance = self.get(db, instance_id)
        if not param_instance:
            return None

        if param_instance.exec_count is None:
            param_instance.exec_count = 1
        else:
            param_instance.exec_count += 1

        db.add(param_instance)
        db.commit()
        db.refresh(param_instance)
        return param_instance

    def update_test_result(self, db: Session, instance_id: int, actual_result: str, status: str, executor: str) -> Optional[ParamInstance]:
        """更新测试结果"""
        param_instance = self.get(db, instance_id)
        if not param_instance:
            return None

        param_instance.status = status
        param_instance.creator = executor  # 使用creator字段存储执行人
        # 注意：ParamInstance模型没有exec_time字段，所以这里不更新执行时间

        db.add(param_instance)
        db.commit()
        db.refresh(param_instance)
        return param_instance

# 创建全局参数实例服务实例
param_instance_service = ParamInstanceService()
