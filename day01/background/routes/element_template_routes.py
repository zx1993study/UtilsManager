
"""
元素模板路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.element_template_service import element_template_service
from logger_config import logger

element_template_bp = Blueprint('element_templates', __name__)

@element_template_bp.route('/api/element-templates', methods=['GET'])
@jwt_required()
def get_element_templates():
    """获取元素模板列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        page_id = request.args.get('pageId')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            element_templates = element_template_service.search_templates(db, keyword, skip, limit)
        elif page_id:
            element_templates = element_template_service.get_templates_by_page(db, page_id, skip, limit)
        else:
            element_templates = element_template_service.get_multi(db, skip, limit)

        return jsonify([element_template.to_dict() for element_template in element_templates]), 200

    except Exception as e:
        logger.error(f'获取元素模板列表失败: {str(e)}')
        return jsonify({'message': '获取元素模板列表失败'}), 500

@element_template_bp.route('/api/element-templates/<int:template_id>', methods=['GET'])
@jwt_required()
def get_element_template(template_id):
    """获取单个元素模板信息"""
    try:
        db = next(get_db())
        element_template = element_template_service.get(db, template_id)

        if not element_template:
            return jsonify({'message': '元素模板不存在'}), 404

        return jsonify(element_template.to_dict()), 200

    except Exception as e:
        logger.error(f'获取元素模板信息失败: {str(e)}')
        return jsonify({'message': '获取元素模板信息失败'}), 500

@element_template_bp.route('/api/element-templates', methods=['POST'])
@jwt_required()
def create_element_template():
    """创建新元素模板"""
    try:
        data = request.get_json()

        if not data.get('element_name') or not data.get('page_id'):
            return jsonify({'message': '元素名称和页面ID不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        element_template = element_template_service.create_element_template(db, data)

        logger.info(f'创建元素模板 {data["element_name"]} 成功')
        return jsonify(element_template.to_dict()), 201

    except Exception as e:
        logger.error(f'创建元素模板失败: {str(e)}')
        return jsonify({'message': '创建元素模板失败'}), 500

@element_template_bp.route('/api/element-templates/<int:template_id>', methods=['PUT'])
@jwt_required()
def update_element_template(template_id):
    """更新元素模板信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        element_template = element_template_service.update_element_template(db, template_id, data)
        if not element_template:
            return jsonify({'message': '元素模板不存在'}), 404

        logger.info(f'更新元素模板 {template_id} 成功')
        return jsonify(element_template.to_dict()), 200

    except Exception as e:
        logger.error(f'更新元素模板失败: {str(e)}')
        return jsonify({'message': '更新元素模板失败'}), 500

@element_template_bp.route('/api/element-templates/<int:template_id>', methods=['DELETE'])
@jwt_required()
def delete_element_template(template_id):
    """删除元素模板"""
    try:
        db = next(get_db())
        success = element_template_service.delete(db, template_id)

        if not success:
            return jsonify({'message': '元素模板不存在'}), 404

        logger.info(f'删除元素模板 {template_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除元素模板失败: {str(e)}')
        return jsonify({'message': '删除元素模板失败'}), 500

@element_template_bp.route('/api/element-templates/generate-instance', methods=['GET'])
@jwt_required()
def generate_instance():
    """根据元素模板生成随机实例"""
    try:
        page_id = request.args.get('pageId')
        if not page_id:
            return jsonify({'message': '页面ID不能为空'}), 400

        db = next(get_db())
        instance = element_template_service.generate_random_instance(db, page_id)

        logger.info(f'根据元素模板生成实例成功')
        return jsonify(instance), 200

    except Exception as e:
        logger.error(f'生成实例失败: {str(e)}')
        return jsonify({'message': '生成实例失败'}), 500
