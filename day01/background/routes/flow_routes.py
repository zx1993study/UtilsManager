
"""
流程管理路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.flow_service import flow_service
from logger_config import logger

flow_bp = Blueprint('flows', __name__)

@flow_bp.route('/api/flows', methods=['GET'])
@jwt_required()
def get_flows():
    """获取流程列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        status = request.args.get('status')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            flows = flow_service.search_flows(db, keyword, skip, limit)
        elif status:
            flows = flow_service.get_flows_by_status(db, status, skip, limit)
        else:
            flows = flow_service.get_multi(db, skip, limit)

        return jsonify([flow.to_dict() for flow in flows]), 200

    except Exception as e:
        logger.error(f'获取流程列表失败: {str(e)}')
        return jsonify({'message': '获取流程列表失败'}), 500

@flow_bp.route('/api/flows/<int:flow_id>', methods=['GET'])
@jwt_required()
def get_flow(flow_id):
    """获取单个流程信息"""
    try:
        db = next(get_db())
        flow = flow_service.get(db, flow_id)

        if not flow:
            return jsonify({'message': '流程不存在'}), 404

        # 获取流程步骤
        steps = flow_service.get_flow_steps(db, flow_id)
        flow_dict = flow.to_dict()
        flow_dict['steps'] = [step.to_dict() for step in steps]

        return jsonify(flow_dict), 200

    except Exception as e:
        logger.error(f'获取流程信息失败: {str(e)}')
        return jsonify({'message': '获取流程信息失败'}), 500

@flow_bp.route('/api/flows', methods=['POST'])
@jwt_required()
def create_flow():
    """创建新流程"""
    try:
        data = request.get_json()

        if not data.get('flow_name'):
            return jsonify({'message': '流程名称不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        flow = flow_service.create_flow(db, data)

        logger.info(f'创建流程 {data["flow_name"]} 成功')
        return jsonify(flow.to_dict()), 201

    except Exception as e:
        logger.error(f'创建流程失败: {str(e)}')
        return jsonify({'message': '创建流程失败'}), 500

@flow_bp.route('/api/flows/<int:flow_id>', methods=['PUT'])
@jwt_required()
def update_flow(flow_id):
    """更新流程信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        flow = flow_service.update_flow(db, flow_id, data)
        if not flow:
            return jsonify({'message': '流程不存在'}), 404

        logger.info(f'更新流程 {flow_id} 成功')
        return jsonify(flow.to_dict()), 200

    except Exception as e:
        logger.error(f'更新流程失败: {str(e)}')
        return jsonify({'message': '更新流程失败'}), 500

@flow_bp.route('/api/flows/<int:flow_id>', methods=['DELETE'])
@jwt_required()
def delete_flow(flow_id):
    """删除流程"""
    try:
        db = next(get_db())
        success = flow_service.delete(db, flow_id)

        if not success:
            return jsonify({'message': '流程不存在'}), 404

        logger.info(f'删除流程 {flow_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除流程失败: {str(e)}')
        return jsonify({'message': '删除流程失败'}), 500

@flow_bp.route('/api/flows/<int:flow_id>/steps', methods=['POST'])
@jwt_required()
def add_flow_step(flow_id):
    """添加流程步骤"""
    try:
        data = request.get_json()
        data['api_id'] = str(flow_id)

        db = next(get_db())
        step = flow_service.add_flow_step(db, data)

        logger.info(f'添加流程步骤成功')
        return jsonify(step.to_dict()), 201

    except Exception as e:
        logger.error(f'添加流程步骤失败: {str(e)}')
        return jsonify({'message': '添加流程步骤失败'}), 500

@flow_bp.route('/api/flows/steps/<int:step_id>', methods=['PUT'])
@jwt_required()
def update_flow_step(step_id):
    """更新流程步骤"""
    try:
        data = request.get_json()
        db = next(get_db())

        step = flow_service.update_flow_step(db, step_id, data)
        if not step:
            return jsonify({'message': '步骤不存在'}), 404

        logger.info(f'更新流程步骤 {step_id} 成功')
        return jsonify(step.to_dict()), 200

    except Exception as e:
        logger.error(f'更新流程步骤失败: {str(e)}')
        return jsonify({'message': '更新流程步骤失败'}), 500

@flow_bp.route('/api/flows/steps/<int:step_id>', methods=['DELETE'])
@jwt_required()
def delete_flow_step(step_id):
    """删除流程步骤"""
    try:
        db = next(get_db())
        success = flow_service.delete_flow_step(db, step_id)

        if not success:
            return jsonify({'message': '步骤不存在'}), 404

        logger.info(f'删除流程步骤 {step_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除流程步骤失败: {str(e)}')
        return jsonify({'message': '删除流程步骤失败'}), 500

@flow_bp.route('/api/flows/<int:flow_id>/run', methods=['POST'])
@jwt_required()
def run_flow(flow_id):
    """运行流程"""
    try:
        db = next(get_db())
        flow = flow_service.get(db, flow_id)

        if not flow:
            return jsonify({'message': '流程不存在'}), 404

        # TODO: 实现运行流程的逻辑
        logger.info(f'运行流程 {flow_id} 成功')

        return jsonify({
            'message': '流程已启动',
            'taskId': f'task-{flow_id}'
        }), 200

    except Exception as e:
        logger.error(f'运行流程失败: {str(e)}')
        return jsonify({'message': '运行流程失败'}), 500
