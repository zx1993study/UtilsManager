
"""
Token管理路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.token_service import token_service
from logger_config import logger

token_bp = Blueprint('tokens', __name__)

@token_bp.route('/api/tokens', methods=['GET'])
@jwt_required()
def get_tokens():
    """获取Token列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        token_type = request.args.get('type')
        status = request.args.get('status')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            tokens = token_service.search_tokens(db, keyword, skip, limit)
        elif token_type:
            tokens = token_service.get_tokens_by_type(db, token_type, skip, limit)
        elif status == 'active':
            tokens = token_service.get_active_tokens(db, skip, limit)
        else:
            tokens = token_service.get_multi(db, skip, limit)

        return jsonify([token.to_dict() for token in tokens]), 200

    except Exception as e:
        logger.error(f'获取Token列表失败: {str(e)}')
        return jsonify({'message': '获取Token列表失败'}), 500

@token_bp.route('/api/tokens/<int:token_id>', methods=['GET'])
@jwt_required()
def get_token(token_id):
    """获取单个Token信息"""
    try:
        db = next(get_db())
        token = token_service.get(db, token_id)

        if not token:
            return jsonify({'message': 'Token不存在'}), 404

        return jsonify(token.to_dict()), 200

    except Exception as e:
        logger.error(f'获取Token信息失败: {str(e)}')
        return jsonify({'message': '获取Token信息失败'}), 500

@token_bp.route('/api/tokens', methods=['POST'])
@jwt_required()
def create_token():
    """创建新Token"""
    try:
        data = request.get_json()

        if not data.get('name'):
            return jsonify({'message': 'Token名称不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        token = token_service.create_token(db, data)

        logger.info(f'创建Token {data["name"]} 成功')
        return jsonify(token.to_dict()), 201

    except Exception as e:
        logger.error(f'创建Token失败: {str(e)}')
        return jsonify({'message': '创建Token失败'}), 500

@token_bp.route('/api/tokens/<int:token_id>', methods=['PUT'])
@jwt_required()
def update_token(token_id):
    """更新Token信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        token = token_service.update_token(db, token_id, data)
        if not token:
            return jsonify({'message': 'Token不存在'}), 404

        logger.info(f'更新Token {token_id} 成功')
        return jsonify(token.to_dict()), 200

    except Exception as e:
        logger.error(f'更新Token失败: {str(e)}')
        return jsonify({'message': '更新Token失败'}), 500

@token_bp.route('/api/tokens/<int:token_id>', methods=['DELETE'])
@jwt_required()
def delete_token(token_id):
    """删除Token"""
    try:
        db = next(get_db())
        success = token_service.delete(db, token_id)

        if not success:
            return jsonify({'message': 'Token不存在'}), 404

        logger.info(f'删除Token {token_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除Token失败: {str(e)}')
        return jsonify({'message': '删除Token失败'}), 500

@token_bp.route('/api/tokens/<int:token_id>/toggle-status', methods=['POST'])
@jwt_required()
def toggle_token_status(token_id):
    """切换Token状态"""
    try:
        db = next(get_db())
        token = token_service.toggle_status(db, token_id)

        if not token:
            return jsonify({'message': 'Token不存在'}), 404

        logger.info(f'切换Token {token_id} 状态成功')
        return jsonify(token.to_dict()), 200

    except Exception as e:
        logger.error(f'切换Token状态失败: {str(e)}')
        return jsonify({'message': '切换Token状态失败'}), 500
