
"""
字典管理路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.dictionary_service import dictionary_service
from logger_config import logger

dictionary_bp = Blueprint('dictionaries', __name__)

@dictionary_bp.route('/api/dictionaries', methods=['GET'])
@jwt_required()
def get_dictionaries():
    """获取字典列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        dict_type = request.args.get('type')
        dict_name = request.args.get('name')
        status = request.args.get('status')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            dictionaries = dictionary_service.search_dictionaries(db, keyword, skip, limit)
        elif dict_type:
            dictionaries = dictionary_service.get_dictionaries_by_type(db, dict_type, skip, limit)
        elif dict_name:
            dictionaries = dictionary_service.get_dictionaries_by_name(db, dict_name, skip, limit)
        elif status == 'active':
            dictionaries = dictionary_service.get_active_dictionaries(db, skip, limit)
        else:
            dictionaries = dictionary_service.get_multi(db, skip, limit)

        return jsonify([dict.to_dict() for dict in dictionaries]), 200

    except Exception as e:
        logger.error(f'获取字典列表失败: {str(e)}')
        return jsonify({'message': '获取字典列表失败'}), 500

@dictionary_bp.route('/api/dictionaries/<int:dict_id>', methods=['GET'])
@jwt_required()
def get_dictionary(dict_id):
    """获取单个字典信息"""
    try:
        db = next(get_db())
        dictionary = dictionary_service.get(db, dict_id)

        if not dictionary:
            return jsonify({'message': '字典不存在'}), 404

        return jsonify(dictionary.to_dict()), 200

    except Exception as e:
        logger.error(f'获取字典信息失败: {str(e)}')
        return jsonify({'message': '获取字典信息失败'}), 500

@dictionary_bp.route('/api/dictionaries', methods=['POST'])
@jwt_required()
def create_dictionary():
    """创建新字典"""
    try:
        data = request.get_json()

        if not data.get('dict_name') or not data.get('key_value') or not data.get('value'):
            return jsonify({'message': '字典名称、键值和值不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        dictionary = dictionary_service.create_dictionary(db, data)

        logger.info(f'创建字典 {data["dict_name"]} 成功')
        return jsonify(dictionary.to_dict()), 201

    except Exception as e:
        logger.error(f'创建字典失败: {str(e)}')
        return jsonify({'message': '创建字典失败'}), 500

@dictionary_bp.route('/api/dictionaries/<int:dict_id>', methods=['PUT'])
@jwt_required()
def update_dictionary(dict_id):
    """更新字典信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        dictionary = dictionary_service.update_dictionary(db, dict_id, data)
        if not dictionary:
            return jsonify({'message': '字典不存在'}), 404

        logger.info(f'更新字典 {dict_id} 成功')
        return jsonify(dictionary.to_dict()), 200

    except Exception as e:
        logger.error(f'更新字典失败: {str(e)}')
        return jsonify({'message': '更新字典失败'}), 500

@dictionary_bp.route('/api/dictionaries/<int:dict_id>', methods=['DELETE'])
@jwt_required()
def delete_dictionary(dict_id):
    """删除字典"""
    try:
        db = next(get_db())
        success = dictionary_service.delete(db, dict_id)

        if not success:
            return jsonify({'message': '字典不存在'}), 404

        logger.info(f'删除字典 {dict_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除字典失败: {str(e)}')
        return jsonify({'message': '删除字典失败'}), 500

@dictionary_bp.route('/api/dictionaries/<int:dict_id>/toggle-status', methods=['POST'])
@jwt_required()
def toggle_dictionary_status(dict_id):
    """切换字典状态"""
    try:
        db = next(get_db())
        dictionary = dictionary_service.toggle_status(db, dict_id)

        if not dictionary:
            return jsonify({'message': '字典不存在'}), 404

        logger.info(f'切换字典 {dict_id} 状态成功')
        return jsonify(dictionary.to_dict()), 200

    except Exception as e:
        logger.error(f'切换字典状态失败: {str(e)}')
        return jsonify({'message': '切换字典状态失败'}), 500
