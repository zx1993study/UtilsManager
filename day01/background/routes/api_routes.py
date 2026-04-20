
"""
API管理路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.api_service import api_service
from logger_config import logger

api_bp = Blueprint('apis', __name__)

@api_bp.route('/api/interfaces', methods=['GET'])
@jwt_required()
def get_apis():
    """获取API列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        method = request.args.get('method')
        token_id = request.args.get('tokenId')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            apis = api_service.search_apis(db, keyword, skip, limit)
        elif token_id:
            apis = api_service.get_apis_by_token(db, token_id, skip, limit)
        elif method:
            apis = api_service.get_apis_by_method(db, method, skip, limit)
        else:
            apis = api_service.get_multi(db, skip, limit)

        return jsonify([api.to_dict() for api in apis]), 200

    except Exception as e:
        logger.error(f'获取API列表失败: {str(e)}')
        return jsonify({'message': '获取API列表失败'}), 500

@api_bp.route('/api/interfaces/<int:api_id>', methods=['GET'])
@jwt_required()
def get_api(api_id):
    """获取单个API信息"""
    try:
        db = next(get_db())
        api = api_service.get(db, api_id)

        if not api:
            return jsonify({'message': 'API不存在'}), 404

        return jsonify(api.to_dict()), 200

    except Exception as e:
        logger.error(f'获取API信息失败: {str(e)}')
        return jsonify({'message': '获取API信息失败'}), 500

@api_bp.route('/api/interfaces', methods=['POST'])
@jwt_required()
def create_api():
    """创建新API"""
    try:
        data = request.get_json()

        if not data.get('api_name') or not data.get('method_url'):
            return jsonify({'message': 'API名称和URL不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        api = api_service.create_api(db, data)

        logger.info(f'创建API {data["api_name"]} 成功')
        return jsonify(api.to_dict()), 201

    except Exception as e:
        logger.error(f'创建API失败: {str(e)}')
        return jsonify({'message': '创建API失败'}), 500

@api_bp.route('/api/interfaces/<int:api_id>', methods=['PUT'])
@jwt_required()
def update_api(api_id):
    """更新API信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        api = api_service.update_api(db, api_id, data)
        if not api:
            return jsonify({'message': 'API不存在'}), 404

        logger.info(f'更新API {api_id} 成功')
        return jsonify(api.to_dict()), 200

    except Exception as e:
        logger.error(f'更新API失败: {str(e)}')
        return jsonify({'message': '更新API失败'}), 500

@api_bp.route('/api/interfaces/<int:api_id>', methods=['DELETE'])
@jwt_required()
def delete_api(api_id):
    """删除API"""
    try:
        db = next(get_db())
        success = api_service.delete(db, api_id)

        if not success:
            return jsonify({'message': 'API不存在'}), 404

        logger.info(f'删除API {api_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除API失败: {str(e)}')
        return jsonify({'message': '删除API失败'}), 500

@api_bp.route('/api/interfaces/<int:api_id>/copy', methods=['POST'])
@jwt_required()
def copy_api(api_id):
    """复制API"""
    try:
        data = request.get_json()
        new_name = data.get('name', f'副本-{api_id}')

        db = next(get_db())
        api = api_service.copy_api(db, api_id, new_name)

        if not api:
            return jsonify({'message': 'API不存在'}), 404

        logger.info(f'复制API {api_id} 成功')
        return jsonify(api.to_dict()), 201

    except Exception as e:
        logger.error(f'复制API失败: {str(e)}')
        return jsonify({'message': '复制API失败'}), 500

@api_bp.route('/api/interfaces/batch-run', methods=['POST'])
@jwt_required()
def batch_run_apis():
    """批量运行API"""
    try:
        data = request.get_json()
        api_ids = data.get('apiIds', [])

        if not api_ids:
            return jsonify({'message': '请选择要运行的API'}), 400

        # TODO: 实现批量运行API的逻辑
        logger.info(f'批量运行API: {api_ids}')

        return jsonify({
            'message': f'已启动 {len(api_ids)} 个API的测试',
            'taskIds': [f'task-{id}' for id in api_ids]
        }), 200

    except Exception as e:
        logger.error(f'批量运行API失败: {str(e)}')
        return jsonify({'message': '批量运行API失败'}), 500
