
# 自动化测试平台后端

## 项目简介

这是一个基于Python的自动化测试平台后端服务，提供API测试、页面测试和流程测试功能，支持测试报告生成和导出。

## 技术栈

- **Web框架**: Flask 3.0.0
- **数据库**: MySQL (使用SQLAlchemy ORM)
- **认证**: JWT (Flask-JWT-Extended)
- **自动化测试**: Playwright (页面测试)、Requests (API测试)
- **测试框架**: Pytest
- **日志**: Python Logging + JSON Logger
- **Excel处理**: OpenPyXL

## 项目结构

```
background/
├── app.py                      # 应用入口文件
├── config.py                   # 配置文件
├── logger_config.py            # 日志配置
├── requirements.txt            # 项目依赖
├── models/                     # 数据模型层
│   ├── __init__.py
│   ├── project.py             # 项目模型
│   ├── user.py                # 用户模型
│   ├── api.py                 # API模型
│   ├── token.py               # Token模型
│   ├── dictionary.py          # 字典模型
│   ├── flow.py                # 流程模型
│   ├── flow_step.py           # 流程步骤模型
│   ├── api_result.py          # API结果模型
│   ├── page_result.py         # 页面结果模型
│   ├── flow_result.py         # 流程结果模型
│   └── ...                    # 其他模型
├── services/                   # 业务逻辑层
│   ├── base_service.py        # 服务基类
│   ├── user_service.py       # 用户服务
│   ├── project_service.py    # 项目服务
│   ├── api_service.py        # API服务
│   ├── token_service.py      # Token服务
│   ├── flow_service.py       # 流程服务
│   ├── dictionary_service.py # 字典服务
│   └── test_executor_service.py # 测试执行服务
├── routes/                     # 接口路由层
│   ├── auth_routes.py        # 认证路由
│   ├── user_routes.py       # 用户路由
│   ├── project_routes.py    # 项目路由
│   ├── api_routes.py        # API路由
│   ├── token_routes.py      # Token路由
│   ├── flow_routes.py       # 流程路由
│   ├── dictionary_routes.py # 字典路由
│   └── report_routes.py     # 报告路由
├── logs/                      # 日志目录
├── uploads/                   # 上传文件目录
└── exports/                   # 导出文件目录
```

## 安装依赖

```bash
pip install -r requirements.txt
```

## 配置说明

创建 `.env` 文件，配置以下环境变量：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=zx_test

# JWT配置
JWT_SECRET_KEY=your-jwt-secret-key

# 日志配置
LOG_LEVEL=INFO

# Playwright配置
PLAYWRIGHT_HEADLESS=True
PLAYWRIGHT_TIMEOUT=30000

# 应用配置
FLASK_ENV=development
```

## 数据库初始化

1. 创建数据库：
```sql
CREATE DATABASE zx_test DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
```

2. 执行SQL脚本初始化表结构：
```bash
mysql -u root -p zx_test < sql/autotest.sql
```

## 运行应用

```bash
python app.py
```

应用将在 `http://localhost:5000` 启动。

## API接口文档

### 认证接口

- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/change-password` - 修改密码

### 用户管理

- `GET /api/users` - 获取用户列表
- `GET /api/users/<user_id>` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/<user_id>` - 更新用户
- `DELETE /api/users/<user_id>` - 删除用户
- `POST /api/users/<user_id>/toggle-status` - 切换用户状态

### 项目管理

- `GET /api/projects` - 获取项目列表
- `GET /api/projects/<project_id>` - 获取项目详情
- `POST /api/projects` - 创建项目
- `PUT /api/projects/<project_id>` - 更新项目
- `DELETE /api/projects/<project_id>` - 删除项目
- `POST /api/projects/<project_id>/toggle-status` - 切换项目状态

### API管理

- `GET /api/interfaces` - 获取API列表
- `GET /api/interfaces/<api_id>` - 获取API详情
- `POST /api/interfaces` - 创建API
- `PUT /api/interfaces/<api_id>` - 更新API
- `DELETE /api/interfaces/<api_id>` - 删除API
- `POST /api/interfaces/<api_id>/copy` - 复制API
- `POST /api/interfaces/batch-run` - 批量运行API

### Token管理

- `GET /api/tokens` - 获取Token列表
- `GET /api/tokens/<token_id>` - 获取Token详情
- `POST /api/tokens` - 创建Token
- `PUT /api/tokens/<token_id>` - 更新Token
- `DELETE /api/tokens/<token_id>` - 删除Token
- `POST /api/tokens/<token_id>/toggle-status` - 切换Token状态

### 流程管理

- `GET /api/flows` - 获取流程列表
- `GET /api/flows/<flow_id>` - 获取流程详情
- `POST /api/flows` - 创建流程
- `PUT /api/flows/<flow_id>` - 更新流程
- `DELETE /api/flows/<flow_id>` - 删除流程
- `POST /api/flows/<flow_id>/steps` - 添加流程步骤
- `PUT /api/flows/steps/<step_id>` - 更新流程步骤
- `DELETE /api/flows/steps/<step_id>` - 删除流程步骤
- `POST /api/flows/<flow_id>/run` - 运行流程

### 字典管理

- `GET /api/dictionaries` - 获取字典列表
- `GET /api/dictionaries/<dict_id>` - 获取字典详情
- `POST /api/dictionaries` - 创建字典
- `PUT /api/dictionaries/<dict_id>` - 更新字典
- `DELETE /api/dictionaries/<dict_id>` - 删除字典
- `POST /api/dictionaries/<dict_id>/toggle-status` - 切换字典状态

### 报告管理

- `GET /api/reports` - 获取报告列表
- `GET /api/reports/<report_type>/<result_id>` - 获取报告详情
- `POST /api/reports/export` - 导出报告为Excel

## 开发说明

### 添加新的模型

1. 在 `models/` 目录下创建新的模型文件
2. 继承 `Base` 类并定义表结构
3. 实现 `to_dict()` 方法
4. 在 `models/__init__.py` 中导入新模型

### 添加新的服务

1. 在 `services/` 目录下创建新的服务文件
2. 继承 `BaseService` 类
3. 实现业务逻辑方法
4. 创建全局服务实例

### 添加新的路由

1. 在 `routes/` 目录下创建新的路由文件
2. 创建Blueprint并定义路由
3. 在 `app.py` 中注册Blueprint

## 日志

日志文件保存在 `logs/` 目录下：
- `autotest.log` - 普通日志
- `error.log` - 错误日志
- `autotest.json` - JSON格式日志

## 注意事项

1. 所有API接口（除登录外）都需要JWT认证
2. 密码使用werkzeug的generate_password_hash进行加密
3. 文件上传大小限制为16MB
4. Playwright浏览器默认以无头模式运行

## 许可证

MIT License
