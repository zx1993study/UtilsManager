
"""
元素模板服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.element_template import ElementTemplate
from services.base_service import BaseService
import time
from datetime import datetime

class ElementTemplateService(BaseService[ElementTemplate]):
    """元素模板服务类"""

    def __init__(self):
        super().__init__(ElementTemplate)

    def create_element_template(self, db: Session, template_data: Dict[str, Any]) -> ElementTemplate:
        """创建新元素模板"""
        # 生成元素模板ID
        if 'element_template_id' not in template_data:
            template_data['element_template_id'] = int(time.time() * 1000)

        return self.create(db, template_data)

    def update_element_template(self, db: Session, template_id: int, template_data: Dict[str, Any]) -> Optional[ElementTemplate]:
        """更新元素模板信息"""
        element_template = self.get(db, template_id)
        if not element_template:
            return None

        return self.update(db, element_template, template_data)

    def get_templates_by_page(self, db: Session, page_id: str, skip: int = 0, limit: int = 100) -> List[ElementTemplate]:
        """根据页面ID获取元素模板列表"""
        return self.get_multi(db, skip=skip, limit=limit, page_id=page_id)

    def search_templates(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[ElementTemplate]:
        """搜索元素模板"""
        query = db.query(ElementTemplate).filter(
            ElementTemplate.element_name.like(f'%{keyword}%') |
            ElementTemplate.remark.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def generate_random_instance(self, db: Session, page_id: str) -> Dict[str, Any]:
        """根据元素模板生成随机实例"""
        templates = self.get_templates_by_page(db, page_id)
        instance = {}

        for template in templates:
            element_type = template.type
            element_name = template.element_name

            if element_type == '文本输入':
                # 生成随机长度为1-7的字符串
                import random
                import string
                random_length = random.randint(1, 7)
                instance[element_name] = ''.join(random.choices(string.ascii_letters + string.digits, k=random_length))
            elif element_type == '密码输入':
                import random
                import string
                random_length = random.randint(6, 12)
                instance[element_name] = ''.join(random.choices(string.ascii_letters + string.digits + '!@#$%', k=random_length))
            elif element_type == '按钮点击':
                instance[element_name] = 'click'
            elif element_type == '下拉选择':
                instance[element_name] = 'option1'
            elif element_type == '复选框':
                import random
                instance[element_name] = random.choice([True, False])
            elif element_type == '单选框':
                import random
                instance[element_name] = random.choice(['option1', 'option2'])
            else:
                instance[element_name] = ''

        return instance

# 创建全局元素模板服务实例
element_template_service = ElementTemplateService()
