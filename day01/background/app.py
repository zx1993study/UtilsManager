
"""
自动化测试平台主应用
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from logger_config import logger
from models import init_db
import os

# 创建Flask应用
def create_app(config_name='default'):
    """应用工厂函数"""
    app = Flask(__name__)

    # 加载配置
    app.config.from_object(config[config_name])

    # 启用CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # 配置JWT
    app.config['JWT_SECRET_KEY'] = config[config_name].JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = config[config_name].JWT_ACCESS_TOKEN_EXPIRES
    jwt = JWTManager(app)

    # 确保必要的目录存在
    os.makedirs(app.config['LOG_DIR'], exist_ok=True)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['EXPORT_DIR'], exist_ok=True)

    # 初始化数据库
    with app.app_context():
        init_db()

    # 注册蓝图
    from routes.auth_routes import auth_bp
    from routes.user_routes import user_bp
    from routes.project_routes import project_bp
    from routes.api_routes import api_bp
    from routes.token_routes import token_bp
    from routes.flow_routes import flow_bp
    from routes.dictionary_routes import dictionary_bp
    from routes.report_routes import report_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(token_bp)
    app.register_blueprint(flow_bp)
    app.register_blueprint(dictionary_bp)
    app.register_blueprint(report_bp)

    # 健康检查端点
    @app.route('/health')
    def health_check():
        """健康检查"""
        return {'status': 'healthy', 'version': app.config['APP_VERSION']}, 200

    # 错误处理
    @app.errorhandler(404)
    def not_found(error):
        return {'message': '资源不存在'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f'服务器内部错误: {str(error)}')
        return {'message': '服务器内部错误'}, 500

    logger.info(f'应用启动成功 - 环境: {config_name}')

    return app

# 创建应用实例
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
