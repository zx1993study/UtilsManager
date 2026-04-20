
"""
项目管理路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.project_service import project_service
from logger_config import logger

project_bp = Blueprint('projects', __name__)

@project_bp.route('/api/projects', methods=['GET'])
@jwt_required()
def get_projects():
    """获取项目列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        status = request.args.get('status')
        env = request.args.get('env')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            projects = project_service.search_projects(db, keyword, skip, limit)
        elif env:
            projects = project_service.get_projects_by_env(db, env, skip, limit)
        elif status:
            projects = project_service.get_projects_by_status(db, status, skip, limit)
        else:
            projects = project_service.get_multi(db, skip, limit)

        return jsonify([project.to_dict() for project in projects]), 200

    except Exception as e:
        logger.error(f'获取项目列表失败: {str(e)}')
        return jsonify({'message': '获取项目列表失败'}), 500

@project_bp.route('/api/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """获取单个项目信息"""
    try:
        db = next(get_db())
        project = project_service.get(db, project_id)

        if not project:
            return jsonify({'message': '项目不存在'}), 404

        return jsonify(project.to_dict()), 200

    except Exception as e:
        logger.error(f'获取项目信息失败: {str(e)}')
        return jsonify({'message': '获取项目信息失败'}), 500

@project_bp.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    """创建新项目"""
    try:
        data = request.get_json()

        if not data.get('project_name') or not data.get('project_address') or not data.get('project_port'):
            return jsonify({'message': '项目名称、地址和端口不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        project = project_service.create_project(db, data)

        logger.info(f'创建项目 {data["project_name"]} 成功')
        return jsonify(project.to_dict()), 201

    except Exception as e:
        logger.error(f'创建项目失败: {str(e)}')
        return jsonify({'message': '创建项目失败'}), 500

@project_bp.route('/api/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """更新项目信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        project = project_service.update_project(db, project_id, data)
        if not project:
            return jsonify({'message': '项目不存在'}), 404

        logger.info(f'更新项目 {project_id} 成功')
        return jsonify(project.to_dict()), 200

    except Exception as e:
        logger.error(f'更新项目失败: {str(e)}')
        return jsonify({'message': '更新项目失败'}), 500

@project_bp.route('/api/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """删除项目"""
    try:
        db = next(get_db())
        success = project_service.delete(db, project_id)

        if not success:
            return jsonify({'message': '项目不存在'}), 404

        logger.info(f'删除项目 {project_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除项目失败: {str(e)}')
        return jsonify({'message': '删除项目失败'}), 500

@project_bp.route('/api/projects/<int:project_id>/toggle-status', methods=['POST'])
@jwt_required()
def toggle_project_status(project_id):
    """切换项目状态"""
    try:
        db = next(get_db())
        project = project_service.toggle_status(db, project_id)

        if not project:
            return jsonify({'message': '项目不存在'}), 404

        logger.info(f'切换项目 {project_id} 状态成功')
        return jsonify(project.to_dict()), 200

    except Exception as e:
        logger.error(f'切换项目状态失败: {str(e)}')
        return jsonify({'message': '切换项目状态失败'}), 500
