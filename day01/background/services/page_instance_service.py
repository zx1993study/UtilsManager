
"""
页面实例服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.page_instance import PageInstance
from services.base_service import BaseService
import time
from datetime import datetime

class PageInstanceService(BaseService[PageInstance]):
    """页面实例服务类"""

    def __init__(self):
        super().__init__(PageInstance)

    def create_page_instance(self, db: Session, instance_data: Dict[str, Any]) -> PageInstance:
        """创建新页面实例"""
        # 生成页面实例ID
        if 'page_instance_id' not in instance_data:
            instance_data['page_instance_id'] = int(time.time() * 1000)

        return self.create(db, instance_data)

    def update_page_instance(self, db: Session, instance_id: int, instance_data: Dict[str, Any]) -> Optional[PageInstance]:
        """更新页面实例信息"""
        page_instance = self.get(db, instance_id)
        if not page_instance:
            return None

        return self.update(db, page_instance, instance_data)

    def get_instances_by_page(self, db: Session, page_id: str, skip: int = 0, limit: int = 100) -> List[PageInstance]:
        """根据页面ID获取页面实例列表"""
        return self.get_multi(db, skip=skip, limit=limit, page_id=page_id)

    def search_instances(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[PageInstance]:
        """搜索页面实例"""
        query = db.query(PageInstance).filter(
            PageInstance.page_instance_name.like(f'%{keyword}%') |
            PageInstance.description.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def copy_page_instance(self, db: Session, instance_id: int, new_name: str) -> Optional[PageInstance]:
        """复制页面实例"""
        page_instance = self.get(db, instance_id)
        if not page_instance:
            return None

        # 创建副本
        copy_data = {
            'page_instance_name': new_name,
            'description': page_instance.description,
            'page_id': page_instance.page_id,
            'action_json': page_instance.action_json,
            'expect_result': page_instance.expect_result,
            'status': 'pending',
            'remark': page_instance.remark,
            'creator': page_instance.creator
        }

        return self.create_page_instance(db, copy_data)

    def increment_exec_count(self, db: Session, instance_id: int) -> Optional[PageInstance]:
        """增加执行次数"""
        page_instance = self.get(db, instance_id)
        if not page_instance:
            return None

        # PageInstance模型没有exec_count字段，这里不做任何操作
        return page_instance

    def update_test_result(self, db: Session, instance_id: int, actual_result: str, status: str, executor: str) -> Optional[PageInstance]:
        """更新测试结果"""
        page_instance = self.get(db, instance_id)
        if not page_instance:
            return None

        page_instance.status = status
        # 注意：PageInstance模型没有actual_result和executor字段，所以这里不更新这些字段

        db.add(page_instance)
        db.commit()
        db.refresh(page_instance)
        return page_instance

# 创建全局页面实例服务实例
page_instance_service = PageInstanceService()
