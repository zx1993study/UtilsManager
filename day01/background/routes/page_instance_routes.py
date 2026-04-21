
"""
页面实例路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.page_instance_service import page_instance_service
from logger_config import logger

page_instance_bp = Blueprint('page_instances', __name__)

@page_instance_bp.route('/api/page-instances', methods=['GET'])
@jwt_required()
def get_page_instances():
    """获取页面实例列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        page_id = request.args.get('pageId')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            page_instances = page_instance_service.search_instances(db, keyword, skip, limit)
        elif page_id:
            page_instances = page_instance_service.get_instances_by_page(db, page_id, skip, limit)
        else:
            page_instances = page_instance_service.get_multi(db, skip, limit)

        return jsonify([page_instance.to_dict() for page_instance in page_instances]), 200

    except Exception as e:
        logger.error(f'获取页面实例列表失败: {str(e)}')
        return jsonify({'message': '获取页面实例列表失败'}), 500

@page_instance_bp.route('/api/page-instances/<int:instance_id>', methods=['GET'])
@jwt_required()
def get_page_instance(instance_id):
    """获取单个页面实例信息"""
    try:
        db = next(get_db())
        page_instance = page_instance_service.get(db, instance_id)

        if not page_instance:
            return jsonify({'message': '页面实例不存在'}), 404

        return jsonify(page_instance.to_dict()), 200

    except Exception as e:
        logger.error(f'获取页面实例信息失败: {str(e)}')
        return jsonify({'message': '获取页面实例信息失败'}), 500

@page_instance_bp.route('/api/page-instances', methods=['POST'])
@jwt_required()
def create_page_instance():
    """创建新页面实例"""
    try:
        data = request.get_json()

        if not data.get('page_instance_name') or not data.get('page_id'):
            return jsonify({'message': '实例名称和页面ID不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        page_instance = page_instance_service.create_page_instance(db, data)

        logger.info(f'创建页面实例 {data["page_instance_name"]} 成功')
        return jsonify(page_instance.to_dict()), 201

    except Exception as e:
        logger.error(f'创建页面实例失败: {str(e)}')
        return jsonify({'message': '创建页面实例失败'}), 500

@page_instance_bp.route('/api/page-instances/<int:instance_id>', methods=['PUT'])
@jwt_required()
def update_page_instance(instance_id):
    """更新页面实例信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        page_instance = page_instance_service.update_page_instance(db, instance_id, data)
        if not page_instance:
            return jsonify({'message': '页面实例不存在'}), 404

        logger.info(f'更新页面实例 {instance_id} 成功')
        return jsonify(page_instance.to_dict()), 200

    except Exception as e:
        logger.error(f'更新页面实例失败: {str(e)}')
        return jsonify({'message': '更新页面实例失败'}), 500

@page_instance_bp.route('/api/page-instances/<int:instance_id>', methods=['DELETE'])
@jwt_required()
def delete_page_instance(instance_id):
    """删除页面实例"""
    try:
        db = next(get_db())
        success = page_instance_service.delete(db, instance_id)

        if not success:
            return jsonify({'message': '页面实例不存在'}), 404

        logger.info(f'删除页面实例 {instance_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除页面实例失败: {str(e)}')
        return jsonify({'message': '删除页面实例失败'}), 500

@page_instance_bp.route('/api/page-instances/<int:instance_id>/copy', methods=['POST'])
@jwt_required()
def copy_page_instance(instance_id):
    """复制页面实例"""
    try:
        data = request.get_json()
        new_name = data.get('name', f'副本-{instance_id}')

        db = next(get_db())
        page_instance = page_instance_service.copy_page_instance(db, instance_id, new_name)

        if not page_instance:
            return jsonify({'message': '页面实例不存在'}), 404

        logger.info(f'复制页面实例 {instance_id} 成功')
        return jsonify(page_instance.to_dict()), 201

    except Exception as e:
        logger.error(f'复制页面实例失败: {str(e)}')
        return jsonify({'message': '复制页面实例失败'}), 500

@page_instance_bp.route('/api/page-instances/<int:instance_id>/run', methods=['POST'])
@jwt_required()
def run_page_instance(instance_id):
    """运行测试用例"""
    try:
        db = next(get_db())

        # 增加执行次数
        page_instance = page_instance_service.increment_exec_count(db, instance_id)
        if not page_instance:
            return jsonify({'message': '页面实例不存在'}), 404

        # 获取当前用户作为执行人
        current_user_id = get_jwt_identity()

        # TODO: 实现实际的测试执行逻辑
        # 这里只是模拟，实际应该调用测试执行服务
        actual_result = "测试通过"
        status = "success"

        # 更新测试结果
        page_instance = page_instance_service.update_test_result(db, instance_id, actual_result, status, current_user_id)

        logger.info(f'运行测试用例 {instance_id} 成功')
        return jsonify({
            'message': '测试用例执行成功',
            'result': page_instance.to_dict()
        }), 200

    except Exception as e:
        logger.error(f'运行测试用例失败: {str(e)}')
        return jsonify({'message': '运行测试用例失败'}), 500

@page_instance_bp.route('/api/page-instances/batch-run', methods=['POST'])
@jwt_required()
def batch_run_page_instances():
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
            page_instance = page_instance_service.increment_exec_count(db, instance_id)

            if page_instance:
                # TODO: 实现实际的测试执行逻辑
                # 这里只是模拟，实际应该调用测试执行服务
                actual_result = "测试通过"
                status = "success"

                # 更新测试结果
                page_instance = page_instance_service.update_test_result(db, instance_id, actual_result, status, current_user_id)
                results.append(page_instance.to_dict())
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
