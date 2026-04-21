
"""
API模板路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.api_template_service import api_template_service
from logger_config import logger

api_template_bp = Blueprint('api_templates', __name__)

@api_template_bp.route('/api/api-templates', methods=['GET'])
@jwt_required()
def get_api_templates():
    """获取API模板列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        api_id = request.args.get('apiId')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            api_templates = api_template_service.search_templates(db, keyword, skip, limit)
        elif api_id:
            api_templates = api_template_service.get_templates_by_api(db, api_id, skip, limit)
        else:
            api_templates = api_template_service.get_multi(db, skip, limit)

        return jsonify([api_template.to_dict() for api_template in api_templates]), 200

    except Exception as e:
        logger.error(f'获取API模板列表失败: {str(e)}')
        return jsonify({'message': '获取API模板列表失败'}), 500

@api_template_bp.route('/api/api-templates/<int:template_id>', methods=['GET'])
@jwt_required()
def get_api_template(template_id):
    """获取单个API模板信息"""
    try:
        db = next(get_db())
        api_template = api_template_service.get(db, template_id)

        if not api_template:
            return jsonify({'message': 'API模板不存在'}), 404

        return jsonify(api_template.to_dict()), 200

    except Exception as e:
        logger.error(f'获取API模板信息失败: {str(e)}')
        return jsonify({'message': '获取API模板信息失败'}), 500

@api_template_bp.route('/api/api-templates', methods=['POST'])
@jwt_required()
def create_api_template():
    """创建新API模板"""
    try:
        data = request.get_json()

        if not data.get('field_name') or not data.get('api_id'):
            return jsonify({'message': '字段名称和API ID不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        api_template = api_template_service.create_api_template(db, data)

        logger.info(f'创建API模板 {data["field_name"]} 成功')
        return jsonify(api_template.to_dict()), 201

    except Exception as e:
        logger.error(f'创建API模板失败: {str(e)}')
        return jsonify({'message': '创建API模板失败'}), 500

@api_template_bp.route('/api/api-templates/<int:template_id>', methods=['PUT'])
@jwt_required()
def update_api_template(template_id):
    """更新API模板信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        api_template = api_template_service.update_api_template(db, template_id, data)
        if not api_template:
            return jsonify({'message': 'API模板不存在'}), 404

        logger.info(f'更新API模板 {template_id} 成功')
        return jsonify(api_template.to_dict()), 200

    except Exception as e:
        logger.error(f'更新API模板失败: {str(e)}')
        return jsonify({'message': '更新API模板失败'}), 500

@api_template_bp.route('/api/api-templates/<int:template_id>', methods=['DELETE'])
@jwt_required()
def delete_api_template(template_id):
    """删除API模板"""
    try:
        db = next(get_db())
        success = api_template_service.delete(db, template_id)

        if not success:
            return jsonify({'message': 'API模板不存在'}), 404

        logger.info(f'删除API模板 {template_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除API模板失败: {str(e)}')
        return jsonify({'message': '删除API模板失败'}), 500

@api_template_bp.route('/api/api-templates/generate-instance', methods=['GET'])
@jwt_required()
def generate_instance():
    """根据API模板生成随机实例"""
    try:
        api_id = request.args.get('apiId')
        if not api_id:
            return jsonify({'message': 'API ID不能为空'}), 400

        db = next(get_db())
        instance = api_template_service.generate_random_instance(db, api_id)

        logger.info(f'根据API模板生成实例成功')
        return jsonify(instance), 200

    except Exception as e:
        logger.error(f'生成实例失败: {str(e)}')
        return jsonify({'message': '生成实例失败'}), 500
