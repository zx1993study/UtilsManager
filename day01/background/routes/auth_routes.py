
"""
认证相关路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import get_db
from services.user_service import user_service
from logger_config import logger

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': '用户名和密码不能为空'}), 400

        db = next(get_db())
        user = user_service.get_by_username(db, username)

        if not user or not user_service.verify_password(user, password):
            return jsonify({'message': '用户名或密码错误'}), 401

        if user.status != 'active':
            return jsonify({'message': '账号已被禁用'}), 403

        # 创建访问令牌
        access_token = create_access_token(identity=str(user.user_id))

        logger.info(f'用户 {username} 登录成功')

        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f'登录失败: {str(e)}')
        return jsonify({'message': '登录失败'}), 500

@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """获取当前用户信息"""
    try:
        user_id = get_jwt_identity()
        db = next(get_db())
        user = user_service.get(db, int(user_id))

        if not user:
            return jsonify({'message': '用户不存在'}), 404

        return jsonify(user.to_dict()), 200

    except Exception as e:
        logger.error(f'获取用户信息失败: {str(e)}')
        return jsonify({'message': '获取用户信息失败'}), 500

@auth_bp.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """用户登出"""
    try:
        logger.info(f'用户登出成功')
        return jsonify({'message': '登出成功'}), 200
    except Exception as e:
        logger.error(f'登出失败: {str(e)}')
        return jsonify({'message': '登出失败'}), 500

@auth_bp.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """修改密码"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')

        if not old_password or not new_password:
            return jsonify({'message': '旧密码和新密码不能为空'}), 400

        db = next(get_db())
        success = user_service.change_password(db, int(user_id), old_password, new_password)

        if not success:
            return jsonify({'message': '旧密码错误'}), 400

        logger.info(f'用户 {user_id} 修改密码成功')
        return jsonify({'message': '密码修改成功'}), 200

    except Exception as e:
        logger.error(f'修改密码失败: {str(e)}')
        return jsonify({'message': '修改密码失败'}), 500
