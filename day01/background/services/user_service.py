
"""
用户服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.user import User
from services.base_service import BaseService
from werkzeug.security import generate_password_hash, check_password_hash
import time

class UserService(BaseService[User]):
    """用户服务类"""

    def __init__(self):
        super().__init__(User)

    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()

    def create_user(self, db: Session, user_data: Dict[str, Any]) -> User:
        """创建新用户"""
        # 密码加密
        if 'password' in user_data:
            user_data['password'] = generate_password_hash(user_data['password'])

        # 生成用户ID
        if 'user_id' not in user_data:
            user_data['user_id'] = int(time.time() * 1000)

        return self.create(db, user_data)

    def verify_password(self, user: User, password: str) -> bool:
        """验证密码"""
        return check_password_hash(user.password, password)

    def update_user(self, db: Session, user_id: int, user_data: Dict[str, Any]) -> Optional[User]:
        """更新用户信息"""
        user = self.get(db, user_id)
        if not user:
            return None

        # 如果更新密码，需要加密
        if 'password' in user_data:
            user_data['password'] = generate_password_hash(user_data['password'])

        return self.update(db, user, user_data)

    def change_password(self, db: Session, user_id: int, old_password: str, new_password: str) -> bool:
        """修改密码"""
        user = self.get(db, user_id)
        if not user or not self.verify_password(user, old_password):
            return False

        user.password = generate_password_hash(new_password)
        db.commit()
        return True

    def get_users_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[User]:
        """根据状态获取用户列表"""
        return self.get_multi(db, skip=skip, limit=limit, status=status)

    def toggle_status(self, db: Session, user_id: int) -> Optional[User]:
        """切换用户状态"""
        user = self.get(db, user_id)
        if not user:
            return None

        user.status = 'active' if user.status == 'inactive' else 'inactive'
        db.commit()
        db.refresh(user)
        return user

# 创建全局用户服务实例
user_service = UserService()
