
"""
API实例服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.api_instance import ApiInstance
from services.base_service import BaseService
import time
from datetime import datetime

class ApiInstanceService(BaseService[ApiInstance]):
    """API实例服务类"""

    def __init__(self):
        super().__init__(ApiInstance)

    def create_api_instance(self, db: Session, param_data: Dict[str, Any]) -> ApiInstance:
        """创建新API实例"""
        # 生成API实例ID
        if 'instance_id' not in param_data:
            param_data['instance_id'] = int(time.time() * 1000)

        return self.create(db, param_data)

    def update_api_instance(self, db: Session, instance_id: int, param_data: Dict[str, Any]) -> Optional[ApiInstance]:
        """更新API实例信息"""
        api_instance = self.get(db, instance_id)
        if not api_instance:
            return None

        return self.update(db, api_instance, param_data)

    def get_api_instances_by_api(self, db: Session, api_id: str, skip: int = 0, limit: int = 100) -> List[ApiInstance]:
        """根据API ID获取API实例列表"""
        return self.get_multi(db, skip=skip, limit=limit, api_id=api_id)

    def search_api_instances(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[ApiInstance]:
        """搜索API实例"""
        query = db.query(ApiInstance).filter(
            ApiInstance.instance_name.like(f'%{keyword}%') |
            ApiInstance.description.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def copy_api_instance(self, db: Session, instance_id: int, new_name: str) -> Optional[ApiInstance]:
        """复制API实例"""
        api_instance = self.get(db, instance_id)
        if not api_instance:
            return None

        # 创建副本
        copy_data = {
            'instance_name': new_name,
            'description': api_instance.description,
            'api_id': api_instance.api_id,
            'instance_json': api_instance.instance_json,
            'exec_count': 0,
            'status': 'active',
            'expect_result': api_instance.expect_result,
            'remark': api_instance.remark,
            'creator': api_instance.creator
        }

        return self.create_api_instance(db, copy_data)

    def increment_exec_count(self, db: Session, instance_id: int) -> Optional[ApiInstance]:
        """增加执行次数"""
        api_instance = self.get(db, instance_id)
        if not api_instance:
            return None

        if api_instance.exec_count is None:
            api_instance.exec_count = 1
        else:
            api_instance.exec_count += 1

        db.add(api_instance)
        db.commit()
        db.refresh(api_instance)
        return api_instance

    def update_test_result(self, db: Session, instance_id: int, actual_result: str, status: str, executor: str) -> Optional[ApiInstance]:
        """更新测试结果"""
        api_instance = self.get(db, instance_id)
        if not api_instance:
            return None

        api_instance.status = status
        api_instance.actual_result = actual_result
        api_instance.executor = executor
        api_instance.exec_time = datetime.now()

        db.add(api_instance)
        db.commit()
        db.refresh(api_instance)
        return api_instance

# 创建全局API实例服务实例
api_instance_service = ApiInstanceService()
