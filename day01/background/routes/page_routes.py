
"""
页面路由
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db
from services.page_service import page_service
from logger_config import logger

page_bp = Blueprint('pages', __name__)

@page_bp.route('/api/pages', methods=['GET'])
@jwt_required()
def get_pages():
    """获取页面列表"""
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        token_id = request.args.get('tokenId')
        keyword = request.args.get('keyword')

        db = next(get_db())

        if keyword:
            pages = page_service.search_pages(db, keyword, skip, limit)
        elif token_id:
            pages = page_service.get_pages_by_token(db, token_id, skip, limit)
        else:
            pages = page_service.get_multi(db, skip, limit)

        return jsonify([page.to_dict() for page in pages]), 200

    except Exception as e:
        logger.error(f'获取页面列表失败: {str(e)}')
        return jsonify({'message': '获取页面列表失败'}), 500

@page_bp.route('/api/pages/<int:page_id>', methods=['GET'])
@jwt_required()
def get_page(page_id):
    """获取单个页面信息"""
    try:
        db = next(get_db())
        page = page_service.get(db, page_id)

        if not page:
            return jsonify({'message': '页面不存在'}), 404

        return jsonify(page.to_dict()), 200

    except Exception as e:
        logger.error(f'获取页面信息失败: {str(e)}')
        return jsonify({'message': '获取页面信息失败'}), 500

@page_bp.route('/api/pages', methods=['POST'])
@jwt_required()
def create_page():
    """创建新页面"""
    try:
        data = request.get_json()

        if not data.get('page_name') or not data.get('token_id'):
            return jsonify({'message': '页面名称和Token ID不能为空'}), 400

        db = next(get_db())

        # 获取当前用户作为创建人
        current_user_id = get_jwt_identity()
        data['creator'] = current_user_id

        page = page_service.create_page(db, data)

        logger.info(f'创建页面 {data["page_name"]} 成功')
        return jsonify(page.to_dict()), 201

    except Exception as e:
        logger.error(f'创建页面失败: {str(e)}')
        return jsonify({'message': '创建页面失败'}), 500

@page_bp.route('/api/pages/<int:page_id>', methods=['PUT'])
@jwt_required()
def update_page(page_id):
    """更新页面信息"""
    try:
        data = request.get_json()
        db = next(get_db())

        page = page_service.update_page(db, page_id, data)
        if not page:
            return jsonify({'message': '页面不存在'}), 404

        logger.info(f'更新页面 {page_id} 成功')
        return jsonify(page.to_dict()), 200

    except Exception as e:
        logger.error(f'更新页面失败: {str(e)}')
        return jsonify({'message': '更新页面失败'}), 500

@page_bp.route('/api/pages/<int:page_id>', methods=['DELETE'])
@jwt_required()
def delete_page(page_id):
    """删除页面"""
    try:
        db = next(get_db())
        success = page_service.delete(db, page_id)

        if not success:
            return jsonify({'message': '页面不存在'}), 404

        logger.info(f'删除页面 {page_id} 成功')
        return jsonify({'message': '删除成功'}), 200

    except Exception as e:
        logger.error(f'删除页面失败: {str(e)}')
        return jsonify({'message': '删除页面失败'}), 500

@page_bp.route('/api/pages/<int:page_id>/copy', methods=['POST'])
@jwt_required()
def copy_page(page_id):
    """复制页面"""
    try:
        data = request.get_json()
        new_name = data.get('name', f'副本-{page_id}')

        db = next(get_db())
        page = page_service.copy_page(db, page_id, new_name)

        if not page:
            return jsonify({'message': '页面不存在'}), 404

        logger.info(f'复制页面 {page_id} 成功')
        return jsonify(page.to_dict()), 201

    except Exception as e:
        logger.error(f'复制页面失败: {str(e)}')
        return jsonify({'message': '复制页面失败'}), 500

@page_bp.route('/api/pages/batch-run', methods=['POST'])
@jwt_required()
def batch_run_pages():
    """批量运行页面测试"""
    try:
        data = request.get_json()
        page_ids = data.get('pageIds', [])

        if not page_ids:
            return jsonify({'message': '请选择要运行的页面测试'}), 400

        db = next(get_db())

        # 获取当前用户作为执行人
        current_user_id = get_jwt_identity()

        results = []
        success_count = 0
        for page_id in page_ids:
            page = page_service.get(db, page_id)

            if page:
                # TODO: 实现实际的测试执行逻辑
                # 这里只是模拟，实际应该调用测试执行服务
                result = {
                    'pageId': str(page_id),
                    'status': 'success',
                    'message': '测试执行成功'
                }
                results.append(result)
                success_count += 1

        logger.info(f'批量运行页面测试成功: {success_count}/{len(page_ids)}')
        return jsonify({
            'message': f'已启动 {len(page_ids)} 个页面测试的执行',
            'successCount': success_count,
            'totalCount': len(page_ids),
            'results': results
        }), 200

    except Exception as e:
        logger.error(f'批量运行页面测试失败: {str(e)}')
        return jsonify({'message': '批量运行页面测试失败'}), 500
