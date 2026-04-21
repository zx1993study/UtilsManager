
"""
API实例路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.api_instance_service import api_instance_service
from logger_config import logger

api_instance_bp = Blueprint('api_instances', __name__)

@api_instance_bp.route('/api/api-instances', methods=['GET'])
@jwt_required()
def get_api_instances():
    """获取API实例列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        api_id = request.args.get('apiId')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            api_instances = api_instance_service.search_api_instances(db, keyword, skip, limit)
        elif api_id:
            api_instances = api_instance_service.get_api_instances_by_api(db, api_id, skip, limit)
        else:
            api_instances = api_instance_service.get_multi(db, skip, limit)

        return jsonify([api_instance.to_dict() for api_instance in api_instances]), 200

    except Exception as e:
        logger.error(f'获取API实例列表失败: {str(e)}')
        return jsonify({'message': '获取API实例列表失败'}), 500

@api_instance_bp.route('/api/api-instances/<int:instance_id>', methods=['GET'])
@jwt_required()
def get_api_instance(instance_id):
    """获取单个API实例信息"""
    try:
        db = next(get_db())
        api_instance = api_instance_service.get(db, instance_id)

        if not api_instance:
            return jsonify({'message': 'API实例不存在'}), 404

        return jsonify(api_instance.to_dict()), 200

    except Exception as e:
        logger.error(f'获取API实例信息失败: {str(e)}')
        return jsonify({'message': '获取API实例信息失败'}), 500

@api_instance_bp.route('/api/api-instances', methods=['POST'])
@jwt_required()
def create_api_instance():
    """创建新API实例"""
    try:
        data = request.get_json()

        if not data.get('instance_name') or not data.get('api_id'):
            return jsonify({'message': '实例名称和API ID不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        api_instance = api_instance_service.create_api_instance(db, data)

        logger.info(f'创建API实例 {data["instance_name"]} 成功')
        return jsonify(api_instance.to_dict()), 201

    except Exception as e:
        logger.error(f'创建API实例失败: {str(e)}')
        return jsonify({'message': '创建API实例失败'}), 500

@api_instance_bp.route('/api/api-instances/<int:instance_id>', methods=['PUT'])
@jwt_required()
def update_api_instance(instance_id):
    """更新API实例信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        api_instance = api_instance_service.update_api_instance(db, instance_id, data)
        if not api_instance:
            return jsonify({'message': 'API实例不存在'}), 404

        logger.info(f'更新API实例 {instance_id} 成功')
        return jsonify(api_instance.to_dict()), 200

    except Exception as e:
        logger.error(f'更新API实例失败: {str(e)}')
        return jsonify({'message': '更新API实例失败'}), 500

@api_instance_bp.route('/api/api-instances/<int:instance_id>', methods=['DELETE'])
@jwt_required()
def delete_api_instance(instance_id):
    """删除API实例"""
    try:
        db = next(get_db())
        success = api_instance_service.delete(db, instance_id)

        if not success:
            return jsonify({'message': 'API实例不存在'}), 404

        logger.info(f'删除API实例 {instance_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除API实例失败: {str(e)}')
        return jsonify({'message': '删除API实例失败'}), 500

@api_instance_bp.route('/api/api-instances/<int:instance_id>/copy', methods=['POST'])
@jwt_required()
def copy_api_instance(instance_id):
    """复制API实例"""
    try:
        data = request.get_json()
        new_name = data.get('name', f'副本-{instance_id}')

        db = next(get_db())
        api_instance = api_instance_service.copy_api_instance(db, instance_id, new_name)

        if not api_instance:
            return jsonify({'message': 'API实例不存在'}), 404

        logger.info(f'复制API实例 {instance_id} 成功')
        return jsonify(api_instance.to_dict()), 201

    except Exception as e:
        logger.error(f'复制API实例失败: {str(e)}')
        return jsonify({'message': '复制API实例失败'}), 500

@api_instance_bp.route('/api/api-instances/<int:instance_id>/increment-exec-count', methods=['POST'])
@jwt_required()
def increment_exec_count(instance_id):
    """增加API实例执行次数"""
    try:
        db = next(get_db())
        api_instance = api_instance_service.increment_exec_count(db, instance_id)

        if not api_instance:
            return jsonify({'message': 'API实例不存在'}), 404

        logger.info(f'增加API实例 {instance_id} 执行次数成功')
        return jsonify(api_instance.to_dict()), 200

    except Exception as e:
        logger.error(f'增加API实例执行次数失败: {str(e)}')
        return jsonify({'message': '增加API实例执行次数失败'}), 500

@api_instance_bp.route('/api/api-instances/<int:instance_id>/run', methods=['POST'])
@jwt_required()
def run_api_instance(instance_id):
    """运行测试用例"""
    try:
        db = next(get_db())

        # 增加执行次数
        api_instance = api_instance_service.increment_exec_count(db, instance_id)
        if not api_instance:
            return jsonify({'message': 'API实例不存在'}), 404

        # 获取当前用户作为执行人
        current_user_id = get_jwt_identity()

        # TODO: 实现实际的测试执行逻辑
        # 这里只是模拟，实际应该调用测试执行服务
        actual_result = "200 OK"
        status = "success"

        # 更新测试结果
        api_instance = api_instance_service.update_test_result(db, instance_id, actual_result, status, current_user_id)

        logger.info(f'运行测试用例 {instance_id} 成功')
        return jsonify({
            'message': '测试用例执行成功',
            'result': api_instance.to_dict()
        }), 200

    except Exception as e:
        logger.error(f'运行测试用例失败: {str(e)}')
        return jsonify({'message': '运行测试用例失败'}), 500

@api_instance_bp.route('/api/api-instances/batch-run', methods=['POST'])
@jwt_required()
def batch_run_api_instances():
    """批量运行测试用例"""
    try:
        data = request.get_json()
        instance_ids = data.get('instanceIds', [])

        if not instance_ids:
            return jsonify({'message': '请选择要运行的测试用例'}), 400

        db = next(get_db())

        # 获取当前用户作为执行人
        current_user_id = get_jwt_identity()

        results = []
        success_count = 0
        for instance_id in instance_ids:
            # 增加执行次数
            api_instance = api_instance_service.increment_exec_count(db, instance_id)

            if api_instance:
                # TODO: 实现实际的测试执行逻辑
                # 这里只是模拟，实际应该调用测试执行服务
                actual_result = "200 OK"
                status = "success"

                # 更新测试结果
                api_instance = api_instance_service.update_test_result(db, instance_id, actual_result, status, current_user_id)
                results.append(api_instance.to_dict())
                success_count += 1

        logger.info(f'批量运行测试用例成功: {success_count}/{len(instance_ids)}')
        return jsonify({
            'message': f'已启动 {len(instance_ids)} 个测试用例的执行',
            'successCount': success_count,
            'totalCount': len(instance_ids),
            'results': results
        }), 200

    except Exception as e:
        logger.error(f'批量运行测试用例失败: {str(e)}')
        return jsonify({'message': '批量运行测试用例失败'}), 500
