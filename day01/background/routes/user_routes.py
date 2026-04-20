
"""
用户管理路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.user_service import user_service
from logger_config import logger

user_bp = Blueprint('users', __name__)

@user_bp.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    """获取用户列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        status = request.args.get('status')

        db = next(get_db())

        if status:
            users = user_service.get_users_by_status(db, status, skip, limit)
        else:
            users = user_service.get_multi(db, skip, limit)

        return jsonify([user.to_dict() for user in users]), 200

    except Exception as e:
        logger.error(f'获取用户列表失败: {str(e)}')
        return jsonify({'message': '获取用户列表失败'}), 500

@user_bp.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """获取单个用户信息"""
    try:
        db = next(get_db())
        user = user_service.get(db, user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        return jsonify(user.to_dict()), 200

    except Exception as e:
        logger.error(f'获取用户信息失败: {str(e)}')
        return jsonify({'message': '获取用户信息失败'}), 500

@user_bp.route('/api/users', methods=['POST'])
@jwt_required()
def create_user():
    """创建新用户"""
    try:
        data = request.get_json()

        if not data.get('username') or not data.get('password'):
            return jsonify({'message': '用户名和密码不能为空'}), 400

        db = next(get_db())

        # 检查用户名是否已存在
        if user_service.get_by_username(db, data['username']):
            return jsonify({'message': '用户名已存在'}), 400

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        user = user_service.create_user(db, data)

        logger.info(f'创建用户 {data["username"]} 成功')
        return jsonify(user.to_dict()), 201

    except Exception as e:
        logger.error(f'创建用户失败: {str(e)}')
        return jsonify({'message': '创建用户失败'}), 500

@user_bp.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """更新用户信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        user = user_service.update_user(db, user_id, data)
        if not user:
            return jsonify({'message': '用户不存在'}), 404

        logger.info(f'更新用户 {user_id} 成功')
        return jsonify(user.to_dict()), 200

    except Exception as e:
        logger.error(f'更新用户失败: {str(e)}')
        return jsonify({'message': '更新用户失败'}), 500

@user_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """删除用户"""
    try:
        db = next(get_db())
        success = user_service.delete(db, user_id)

        if not success:
            return jsonify({'message': '用户不存在'}), 404

        logger.info(f'删除用户 {user_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除用户失败: {str(e)}')
        return jsonify({'message': '删除用户失败'}), 500

@user_bp.route('/api/users/<int:user_id>/toggle-status', methods=['POST'])
@jwt_required()
def toggle_user_status(user_id):
    """切换用户状态"""
    try:
        db = next(get_db())
        user = user_service.toggle_status(db, user_id)

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        logger.info(f'切换用户 {user_id} 状态成功')
        return jsonify(user.to_dict()), 200

    except Exception as e:
        logger.error(f'切换用户状态失败: {str(e)}')
        return jsonify({'message': '切换用户状态失败'}), 500
