
"""
API模板服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.api_template import ApiTemplate
from services.base_service import BaseService
import time
from datetime import datetime

class ApiTemplateService(BaseService[ApiTemplate]):
    """API模板服务类"""

    def __init__(self):
        super().__init__(ApiTemplate)

    def create_api_template(self, db: Session, template_data: Dict[str, Any]) -> ApiTemplate:
        """创建新API模板"""
        # 生成API模板ID
        if 'api_template_id' not in template_data:
            template_data['api_template_id'] = int(time.time() * 1000)

        return self.create(db, template_data)

    def update_api_template(self, db: Session, template_id: int, template_data: Dict[str, Any]) -> Optional[ApiTemplate]:
        """更新API模板信息"""
        api_template = self.get(db, template_id)
        if not api_template:
            return None

        return self.update(db, api_template, template_data)

    def get_templates_by_api(self, db: Session, api_id: str, skip: int = 0, limit: int = 100) -> List[ApiTemplate]:
        """根据API ID获取模板列表"""
        return self.get_multi(db, skip=skip, limit=limit, api_id=api_id)

    def search_templates(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[ApiTemplate]:
        """搜索API模板"""
        query = db.query(ApiTemplate).filter(
            ApiTemplate.field_name.like(f'%{keyword}%') |
            ApiTemplate.remark.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def generate_random_instance(self, db: Session, api_id: str) -> Dict[str, Any]:
        """根据API模板生成随机实例"""
        templates = self.get_templates_by_api(db, api_id)
        instance = {}

        for template in templates:
            field_type = template.field_type
            field_name = template.field_name

            if field_type == 'String':
                # 生成随机长度为1-7的字符串
                import random
                import string
                random_length = random.randint(1, 7)
                instance[field_name] = ''.join(random.choices(string.ascii_letters + string.digits, k=random_length))
            elif field_type == 'Number':
                import random
                instance[field_name] = random.randint(0, 1000)
            elif field_type == 'Boolean':
                import random
                instance[field_name] = random.choice([True, False])
            elif field_type == 'Object':
                instance[field_name] = {'key': 'value'}
            elif field_type == 'Array':
                instance[field_name] = ['item1', 'item2']
            else:
                instance[field_name] = ''

        return instance

# 创建全局API模板服务实例
api_template_service = ApiTemplateService()
