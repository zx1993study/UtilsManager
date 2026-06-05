# ZX API Test Platform

基于Python+FastAPI+MySQL8的API测试管理平台，提供项目、API、页面、流程等管理功能。

## 技术栈

- **后端框架**: FastAPI
- **数据库**: MySQL8
- **ORM**: SQLAlchemy
- **认证**: JWT
- **测试**: Pytest
- **自动化测试**: Playwright
- **API测试**: Requests

## 项目结构

```
qcoder-python/
├── api/                 # API路由
│   └── v1/             # API v1版本
│       ├── auth.py              # 认证相关路由
│       ├── project_info.py      # 项目信息路由
│       ├── dict_info.py         # 字典信息路由
│       ├── api_info.py          # 接口路由
│       ├── api_template.py      # 接口模板路由
│       ├── api_instance.py      # 参数实例路由
│       ├── page_info.py         # 页面路由
│       ├── element_template.py  # 元素模板路由
│       ├── page_instance.py     # 页面实例路由
│       ├── flow_info.py         # 流程路由
│       ├── flow_step.py         # 流程步骤路由
│       ├── api_result.py        # API结果路由
│       ├── page_result.py       # 页面结果路由
│       ├── flow_result.py       # 流程结果路由
│       ├── sys_user.py          # 用户路由
│       └── token_info.py        # Token信息路由
├── mysql/               # 数据库操作
│   ├── project_info_sql.py      # 项目信息CRUD
│   ├── dict_info_sql.py         # 字典信息CRUD
│   ├── api_info_sql.py          # 接口CRUD
│   ├── api_template_sql.py      # 接口模板CRUD
│   ├── api_instance_sql.py      # 参数实例CRUD
│   ├── page_info_sql.py         # 页面CRUD
│   ├── element_template_sql.py  # 元素模板CRUD
│   ├── page_instance_sql.py     # 页面实例CRUD
│   ├── flow_info_sql.py         # 流程CRUD
│   ├── flow_step_sql.py         # 流程步骤CRUD
│   ├── api_result_sql.py        # API结果CRUD
│   ├── page_result_sql.py       # 页面结果CRUD
│   ├── flow_result_sql.py       # 流程结果CRUD
│   ├── sys_user_sql.py          # 用户CRUD
│   └── token_info_sql.py        # Token信息CRUD
├── core/               # 核心功能  
│     ├── db.py          # 数据库连接
│     ├── config.py       # 配置信息
│     ├── logger.py     # 日志处理
│     ├── exceptions.py    # 异常处理
│     ├── jwt.py          # 认证处理    
│     └── responsemsg.py   #返回信息处理
├── models/            # 数据模型
│   ├── project_info_model.py      # 项目信息模型
│   ├── dict_info_model.py         # 字典信息模型
│   ├── api_info_model.py          # 接口模型
│   ├── api_template_model.py      # 接口模板模型
│   ├── api_instance_model.py      # 参数实例模型
│   ├── page_info_model.py         # 页面模型
│   ├── element_template_model.py  # 元素模板模型
│   ├── page_instance_model.py     # 页面实例模型
│   ├── flow_info_model.py         # 流程模型
│   ├── flow_step_model.py         # 流程步骤模型
│   ├── api_result_model.py        # API结果模型
│   ├── page_result_model.py       # 页面结果模型
│   ├── flow_result_model.py       # 流程结果模型
│   ├── sys_user_model.py          # 用户模型
│   └── token_info_model.py        # Token信息模型
├── schemas/           # Pydantic模型
│   ├── project_info_schemas.py      # 项目信息Schema
│   ├── dict_info_schemas.py         # 字典信息Schema
│   ├── api_info_schemas.py          # 接口Schema
│   ├── api_template_schemas.py      # 接口模板Schema
│   ├── api_instance_schemas.py      # 参数实例Schema
│   ├── page_info_schemas.py         # 页面Schema
│   ├── element_template_schemas.py  # 元素模板Schema
│   ├── page_instance_schemas.py     # 页面实例Schema
│   ├── flow_info_schemas.py         # 流程Schema
│   ├── flow_step_schemas.py         # 流程步骤Schema
│   ├── api_result_schemas.py        # API结果Schema
│   ├── page_result_schemas.py       # 页面结果Schema
│   ├── flow_result_schemas.py       # 流程结果Schema
│   ├── sys_user_schemas.py          # 用户Schema
│   └── token_info_schemas.py        # Token信息Schema
├── utils/             # 工具类
│   ├── json_paser.py    # 接析swaggerjson工具类
│   ├── data_paser.py    # 日期转换工具类
│   └── html_paser.py     # 网页解析工具类
├── main.py            # 主应用
├── requirements.txt   # 依赖列表
└── tests/            # 测试
    ├── conftest.py   # 测试配置
    ├── test_auth.py  # 认证测试
    ├── test_project.py # 项目测试
    ├── test_dict.py  # 字典测试
    └── playwright/   # Playwright测试
        └── test_login.py # 登录测试
```


## 安装与运行

### 环境要求

- Python 3.8+
- MySQL 8.0+

### 安装步骤

1. 克隆项目

```bash
git clone <repository-url>
cd qcoder-python
```

2. 创建虚拟环境

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
```

3. 安装依赖

```bash
pip install -r requirements.txt
```

4. 配置数据库

创建数据库并导入SQL文件：

```sql
mysql -u <username> -p <password> -e "CREATE DATABASE zx_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u <username> -p <password> zx_test < zx_test.sql
```

5. 修改配置文件

编辑`config.py`文件，修改数据库连接字符串：

```python
DATABASE_URL: str = "mysql+pymysql://<username>:<password>@localhost:3306/zx_test"
```

6. 启动应用

```bash
uvicorn main:app --reload
```

应用将在 `http://localhost:8000` 启动，API文档可在 `http://localhost:8000/docs` 查看。

## 命名规范

### 驼峰命名规范

本项目统一使用**驼峰命名（camelCase）**作为前后端交互的标准命名方式：

#### 1. 接收参数（请求参数）

所有 API 接口的请求参数（包括 query parameters、request body）统一使用驼峰命名：

**示例：**
```json
// 请求体
{
  "projectName": "测试项目",
  "projectAddress": "https://example.com",
  "projectPort": "8080",
  "pageSize": 10,
  "pageNum": 1
}
```

#### 2. 返回参数（响应数据）

所有 API 接口的返回数据统一使用驼峰命名：

**示例：**
```json
{
  "msg": "查询成功",
  "success": true,
  "data": {
    "projectId": 1,
    "projectName": "测试项目",
    "projectAddress": "https://example.com",
    "createTime": "2024-01-01 12:00:00",
    "updateTime": "2024-01-02 13:00:00"
  },
  "error": null
}
```

#### 3. 路由路径

路由路径使用**短横线分隔（kebab-case）**或**下划线分隔（snake_case）**，保持 RESTful 风格：

**推荐格式：**
- `/api/v1/project-info` - 使用短横线分隔
- `/api/v1/project_info` - 使用下划线分隔
- `/api/v1/projects/{project_id}` - 资源复数形式 + ID参数

**示例路由：**
```python
# 推荐的路由定义
@router.get("/project-info")           # 获取项目列表
@router.get("/project-info/{id}")      # 获取项目详情
@router.post("/project-info")          # 创建项目
@router.put("/project-info/{id}")      # 更新项目
@router.delete("/project-info/{id}")   # 删除项目
```

#### 4. 内部处理

后端内部代码（变量名、函数名、数据库字段）保持 **snake_case** 命名：

```python
# Python 内部代码使用 snake_case
project_name = "测试项目"
create_time = datetime.now()

def get_project_by_id(project_id: int):
    pass
```

### 自动转换机制

项目使用 Pydantic V2 的 `alias_generator` 实现自动转换：

```python
from pydantic import ConfigDict, BaseModel
from pydantic.alias_generators import to_camel

class ProjectBase(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )
    
    project_name: str
    project_address: str
    create_time: datetime
```

**配置说明：**
- `alias_generator=to_camel`: 自动将 snake_case 转换为 camelCase
- `populate_by_name=True`: 同时支持原始字段名和别名

### 注意事项

1. **前端传参**：必须使用驼峰命名（如 `projectName`）
2. **后端返回**：必须使用驼峰命名（如 `projectId`）
3. **路由路径**：使用 kebab-case 或 snake_case
4. **数据库字段**：保持 snake_case（如 `project_name`）
5. **Python 代码**：保持 snake_case（如 `project_name`）
6. **Query 参数**：需要使用 `Query(alias="pageSize")` 显式指定别名

### 时间格式自动转换

所有时间类型数据（datetime）在返回时会自动转换为字符串格式：

**转换规则：**
- 格式：`"YYYY-MM-DD HH:MM:SS"` （如：`"2024-01-15 14:30:00"`）
- 时区：默认使用 UTC+8（北京时间）
- 空值处理：如果时间为 null，则返回 null

**示例：**

数据库中的 datetime 字段：
```python
create_time = datetime(2024, 1, 15, 14, 30, 0)
update_time = None
```

API 返回结果：
```json
{
  "msg": "查询成功",
  "success": true,
  "data": {
    "projectId": 1,
    "projectName": "测试项目",
    "createTime": "2024-01-15 14:30:00",
    "updateTime": null
  },
  "error": null
}
```

**实现方式：**

在 Pydantic Schema 中使用自定义序列化器：

```python
from pydantic import BaseModel, field_serializer
from datetime import datetime
from typing import Optional

class ProjectInfo(BaseModel):
    project_id: int
    project_name: str
    create_time: Optional[datetime] = None
    update_time: Optional[datetime] = None
    
    @field_serializer('create_time', 'update_time')
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        if dt is None:
            return None
        return dt.strftime('%Y-%m-%d %H:%M:%S')
```

**注意事项：**
- 所有 datetime 字段都会自动转换为字符串
- 前端接收到的时间都是字符串格式，无需额外处理
- 如果需要其他格式，可以修改 `strftime` 的格式字符串
- 建议在 Schema 层统一处理时间格式化，避免在多个地方重复代码

### 分页功能

所有列表查询接口均支持分页功能，使用 `pageNum` 和 `pageSize` 参数：

**请求参数：**
- `pageNum`: 页码，从1开始，默认值为1
- `pageSize`: 每页大小，范围1-100，默认值为10

**示例请求：**
```bash
# 获取第1页，每页10条
GET /api/v1/project-info?pageNum=1&pageSize=10

# 获取第2页，每页20条
GET /api/v1/project-info?pageNum=2&pageSize=20
```

**响应格式：**
```json
{
  "msg": "查询成功",
  "success": true,
  "data": {
    "total": 100,
    "pageNum": 1,
    "pageSize": 10,
    "pages": 10,
    "items": [
      {
        "projectId": 1,
        "projectName": "测试项目"
      }
    ]
  },
  "error": null
}
```

**分页响应字段说明：**
- `total`: 总记录数
- `pageNum`: 当前页码
- `pageSize`: 每页大小
- `pages`: 总页数（自动计算）
- `items`: 当前页的数据列表

**实现细节：**
- 使用 SQLAlchemy 的 `offset()` 和 `limit()` 实现分页
- 使用 `func.count()` 查询总记录数
- 偏移量计算公式：`offset = (pageNum - 1) * pageSize`
- 总页数计算公式：`pages = (total + pageSize - 1) // pageSize`

## API接口

### 认证相关

- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/login/token` - JSON格式登录
- `POST /api/v1/auth/register` - 用户注册
- `GET /api/v1/auth/me` - 获取当前用户信息
- `PUT /api/v1/auth/me` - 更新当前用户信息
- `GET /api/v1/auth/users` - 获取用户列表
- `GET /api/v1/auth/users/{user_id}` - 获取用户详情
- `PUT /api/v1/auth/users/{user_id}` - 更新用户信息
- `DELETE /api/v1/auth/users/{user_id}` - 删除用户

### 项目管理

- `GET /api/v1/projects/` - 获取项目列表
- `POST /api/v1/projects/` - 创建项目
- `GET /api/v1/projects/{project_id}` - 获取项目详情
- `PUT /api/v1/projects/{project_id}` - 更新项目
- `DELETE /api/v1/projects/{project_id}` - 删除项目

### 字典管理

- `GET /api/v1/dicts/` - 获取字典列表
- `POST /api/v1/dicts/` - 创建字典
- `GET /api/v1/dicts/{dict_id}` - 获取字典详情
- `PUT /api/v1/dicts/{dict_id}` - 更新字典
- `DELETE /api/v1/dicts/{dict_id}` - 删除字典

### API管理

- `GET /api/v1/apis/info` - 获取API列表
- `POST /api/v1/apis/info` - 创建API
- `GET /api/v1/apis/info/{api_id}` - 获取API详情
- `PUT /api/v1/apis/info/{api_id}` - 更新API
- `DELETE /api/v1/apis/info/{api_id}` - 删除API

- `GET /api/v1/apis/template` - 获取API模板列表
- `POST /api/v1/apis/template` - 创建API模板
- `GET /api/v1/apis/template/{template_id}` - 获取API模板详情
- `PUT /api/v1/apis/template/{template_id}` - 更新API模板
- `DELETE /api/v1/apis/template/{template_id}` - 删除API模板

- `GET /api/v1/apis/instance` - 获取API实例列表
- `POST /api/v1/apis/instance` - 创建API实例
- `GET /api/v1/apis/instance/{instance_id}` - 获取API实例详情
- `PUT /api/v1/apis/instance/{instance_id}` - 更新API实例
- `DELETE /api/v1/apis/instance/{instance_id}` - 删除API实例

- `GET /api/v1/apis/result` - 获取API结果列表
- `POST /api/v1/apis/result` - 创建API结果
- `GET /api/v1/apis/result/{result_id}` - 获取API结果详情
- `PUT /api/v1/apis/result/{result_id}` - 更新API结果
- `DELETE /api/v1/apis/result/{result_id}` - 删除API结果

### 页面管理

- `GET /api/v1/pages/` - 获取页面列表
- `POST /api/v1/pages/` - 创建页面
- `GET /api/v1/pages/{page_id}` - 获取页面详情
- `PUT /api/v1/pages/{page_id}` - 更新页面
- `DELETE /api/v1/pages/{page_id}` - 删除页面

- `GET /api/v1/pages/element` - 获取元素模板列表
- `POST /api/v1/pages/element` - 创建元素模板
- `GET /api/v1/pages/element/{element_id}` - 获取元素模板详情
- `PUT /api/v1/pages/element/{element_id}` - 更新元素模板
- `DELETE /api/v1/pages/element/{element_id}` - 删除元素模板

- `GET /api/v1/pages/instance` - 获取页面实例列表
- `POST /api/v1/pages/instance` - 创建页面实例
- `GET /api/v1/pages/instance/{instance_id}` - 获取页面实例详情
- `PUT /api/v1/pages/instance/{instance_id}` - 更新页面实例
- `DELETE /api/v1/pages/instance/{instance_id}` - 删除页面实例

- `GET /api/v1/pages/result` - 获取页面结果列表
- `POST /api/v1/pages/result` - 创建页面结果
- `GET /api/v1/pages/result/{result_id}` - 获取页面结果详情
- `PUT /api/v1/pages/result/{result_id}` - 更新页面结果
- `DELETE /api/v1/pages/result/{result_id}` - 删除页面结果

### 流程管理

- `GET /api/v1/flows/` - 获取流程列表
- `POST /api/v1/flows/` - 创建流程
- `GET /api/v1/flows/{flow_id}` - 获取流程详情
- `PUT /api/v1/flows/{flow_id}` - 更新流程
- `DELETE /api/v1/flows/{flow_id}` - 删除流程

- `GET /api/v1/flows/step` - 获取流程步骤列表
- `POST /api/v1/flows/step` - 创建流程步骤
- `GET /api/v1/flows/step/{step_id}` - 获取流程步骤详情
- `PUT /api/v1/flows/step/{step_id}` - 更新流程步骤
- `DELETE /api/v1/flows/step/{step_id}` - 删除流程步骤

- `GET /api/v1/flows/result` - 获取流程结果列表
- `POST /api/v1/flows/result` - 创建流程结果
- `GET /api/v1/flows/result/{result_id}` - 获取流程结果详情
- `PUT /api/v1/flows/result/{result_id}` - 更新流程结果
- `DELETE /api/v1/flows/result/{result_id}` - 删除流程结果

### Token管理

- `GET /api/v1/tokens/` - 获取Token列表
- `POST /api/v1/tokens/` - 创建Token
- `GET /api/v1/tokens/{token_id}` - 获取Token详情
- `PUT /api/v1/tokens/{token_id}` - 更新Token
- `DELETE /api/v1/tokens/{token_id}` - 删除Token

## Service 层业务逻辑规范

### 新增操作流程

所有模块的新增操作遵循以下统一流程：

1. **校验数据是否存在**
   - 根据关键字段（如名称、编码等唯一标识）查询数据库
   - 检查是否已存在相同的数据记录

2. **存在则返回失败响应**
   ```json
   {
     "msg": "添加失败",
     "success": false,
     "data": {
       "id": 1,
       "message": "该记录已存在"
     }
   }
   ```

3. **不存在则执行新增**
   - 调用 CRUD 层创建数据
   - 返回成功响应：
   ```json
   {
     "msg": "添加成功",
     "success": true,
     "data": {
       "id": 1,
       "name": "新增的记录"
     }
   }
   ```

### 示例代码

```python
async def create_project(project_data: ProjectCreate, db: Session):
    """
    创建项目
    """
    # 1. 校验项目是否已存在
    existing_project = await get_project_by_name(db, project_data.project_name)
    if existieng_project:
        return {
            "msg":  f"添加失败，项目 '{project_data.project_name}' 已存在",
            "success": False,
            "data":existieng_project
        }
    
    # 2. 执行新增操作
    new_project = await create_project_sql(db, project_data)
    
    # 3. 返回成功响应
    return {
        "msg": "添加成功",
        "success": True,
        "data": new_project
    }
```

### 注意事项

- 校验字段应根据业务需求确定（如项目名称、字典键值、API路径等）
- 错误信息应清晰明确，便于前端展示和用户理解
- 所有新增操作都应遵循此流程，保持系统一致性

### 更新操作流程

所有模块的更新操作遵循以下统一流程：

1. **根据 ID 校验数据是否存在**
   - 使用主键 ID 查询数据库
   - 检查记录是否存在

2. **不存在则返回失败响应**
   ```json
   {
     "msg": "更新失败，信息不存在",
     "success": false,
     "data": null
   }
   ```

3. **存在则执行更新**
   - 调用 CRUD 层更新数据
   - 返回成功响应：
   ```json
   {
     "msg": "更新成功",
     "success": true,
     "data": {
       "id": 1,
       "name": "更新后的记录"
     }
   }
   ```

#### 示例代码

```python
async def update_project(project_id: int, project_data: ProjectUpdate, db: Session):
    """
    更新项目
    """
    # 1. 校验项目是否存在
    existing_project = await get_project_by_id(db, project_id)
    if not existing_project:
        return {
            "msg": "更新失败，信息不存在",
            "success": False,
            "data":project_id
        }
    
    # 2. 执行更新操作
    updated_project = await update_project_sql(db, project_id, project_data)
    
    # 3. 返回成功响应
    return {
        "msg": "更新成功",
        "success": True,
        "data": updated_project
    }
```

### 删除操作流程

所有模块的删除操作遵循以下统一流程：

1. **根据 ID 校验数据是否存在**
   - 使用主键 ID 查询数据库
   - 检查记录是否存在

2. **不存在则返回失败响应**
   ```json
   {
     "msg": "删除失败，信息不存在",
     "success": false,
     "data": null
   }
   ```

3. **存在则执行删除**
   - 调用 CRUD 层删除数据
   - 返回成功响应：
   ```json
   {
     "msg": "记录删除成功",
     "success": true,
     "data": {
       "id": 1,
       "message": "记录已删除"
     }
   }
   ```

#### 示例代码

```python
async def delete_project(project_id: int, db: Session):
    """
    删除项目
    """
    # 1. 校验项目是否存在
    existing_project = await get_project_by_id(db, project_id)
    if not existing_project:
        return {
            "msg": "删除失败，信息不存在",
            "success": False,
            "data": None
        }
    
    # 2. 执行删除操作
    deleted_project = await delete_project_sql(db, project_id)
    
    # 3. 返回成功响应
    return {
        "msg": "项目已删除",
        "success": True,
        "data": {
            "id": project_id,
        }
    }
```

### 通用注意事项

- 所有更新和删除操作都必须先校验数据是否存在
- 使用主键 ID 作为唯一标识进行查询
- 返回值检查应使用 `if object is None:` 而非 `if not object:`
- CRUD 层的 delete 函数应返回被删除的实体对象，而不是布尔值
- 保持错误信息的一致性，便于前端统一处理

## 测试

### 单元测试

```bash
pytest tests/
```

### Playwright测试

1. 安装Playwright

```bash
pip install playwright
playwright install
```

2. 运行测试

```bash
pytest tests/playwright/
```

## 默认用户

系统默认提供了以下用户：

- **管理员**
  - 用户名: admin
  - 密码: admin123

- **测试专员**
  - 用户名: test_user
  - 密码: test123

- **审计部管理员**
  - 用户名: audit_admin
  - 密码: Audit@2024
  - 状态: 已禁用

## 环境变量

可以通过创建`.env`文件来配置环境变量：

```
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/zx_test
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 开发指南

### 添加新的API接口

1. 在`models/`目录下创建新的数据模型
2. 在`schemas/`目录下创建对应的Pydantic模型
3. 在`mysql/`目录下实现CRUD操作
4. 在`api/v1/`目录下创建路由文件
5. 在`main.py`中注册新路由

### 添加新的中间件

1. 在`core/`中创建新的中间件类
2. 在`main.py`中注册中间件

### API 返回信息格式

所有 API 接口统一使用以下返回格式：

``json
{
  "msg": "操作成功",
  "success": true,
  "data": {},
  "error": null
}
```

**字段说明：**
- `msg`: 返回消息，描述操作结果或错误信息
- `success`: 布尔值，表示操作是否成功（true/false）
- `data`: 返回的数据内容，可以是对象、数组或其他数据类型
- `error`: 异常信息，当操作失败时包含详细的错误信息或异常堆栈，成功时为 null

**示例：**

成功响应：
``json
{
  "msg": "查询成功",
  "success": true,
  "data": {
    "projectId": 1,
    "projectName": "测试项目"
  },
  "error": null
}
```

失败响应（业务逻辑错误）：
``json
{
  "msg": "项目不存在",
  "success": false,
  "data": null,
  "error": {
    "errorCode": "PROJECT_NOT_FOUND",
    "message": "该项目ID在系统中不存在"
  }
}
```

失败响应（系统异常）：
``json
{
  "msg": "系统异常",
  "success": false,
  "data": null,
  "error": {
    "errorCode": "INTERNAL_SERVER_ERROR",
    "message": "数据库连接超时",
    "stackTrace": "SQLException: Connection timed out..."
  }
}
```

## 许可证

本项目采用MIT许可证。
