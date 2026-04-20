
"""
项目服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.project import Project
from services.base_service import BaseService
import time

class ProjectService(BaseService[Project]):
    """项目服务类"""

    def __init__(self):
        super().__init__(Project)

    def create_project(self, db: Session, project_data: Dict[str, Any]) -> Project:
        """创建新项目"""
        # 生成项目ID
        if 'project_id' not in project_data:
            project_data['project_id'] = int(time.time() * 1000)

        # 设置默认状态
        if 'status' not in project_data:
            project_data['status'] = 'active'

        return self.create(db, project_data)

    def update_project(self, db: Session, project_id: int, project_data: Dict[str, Any]) -> Optional[Project]:
        """更新项目信息"""
        project = self.get(db, project_id)
        if not project:
            return None

        return self.update(db, project, project_data)

    def get_projects_by_env(self, db: Session, env: str, skip: int = 0, limit: int = 100) -> List[Project]:
        """根据环境获取项目列表"""
        return self.get_multi(db, skip=skip, limit=limit, project_env=env)

    def get_projects_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Project]:
        """根据状态获取项目列表"""
        return self.get_multi(db, skip=skip, limit=limit, status=status)

    def toggle_status(self, db: Session, project_id: int) -> Optional[Project]:
        """切换项目状态"""
        project = self.get(db, project_id)
        if not project:
            return None

        project.status = 'active' if project.status == 'inactive' else 'inactive'
        db.commit()
        db.refresh(project)
        return project

    def search_projects(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Project]:
        """搜索项目"""
        query = db.query(Project).filter(
            Project.project_name.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

# 创建全局项目服务实例
project_service = ProjectService()
