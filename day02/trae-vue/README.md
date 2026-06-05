# Trae-Vue 自动化测试平台

基于 Vue 3 + Vite + Element Plus 构建的现代化自动化测试管理平台。

## 📋 项目简介

Trae-Vue 是一个功能完善的自动化测试管理平台，支持接口测试、页面测试和工作流测试等多种测试类型，提供完整的项目管理、测试用例管理、测试执行和报告生成功能。

## ✨ 核心特性

- 🚀 **现代化技术栈** - Vue 3 + Vite + Element Plus + Pinia
- 📊 **多维度测试** - 支持接口测试、页面测试、工作流测试
- 🗂️ **项目管理** - 完整的项目生命周期管理
- 📝 **测试用例** - 灵活的测试用例设计和执行
- 📈 **报告生成** - 自动生成详细的测试报告
- 🔐 **权限管理** - 基于角色的访问控制（RBAC）
- 🎨 **响应式设计** - 适配各种屏幕尺寸
- 🌙 **深色主题** - 专业的深色UI设计

## 🛠️ 技术栈

### 前端框架
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router 4** - 官方路由管理器
- **Pinia** - Vue 状态管理库

### UI 组件
- **Element Plus** - 基于 Vue 3 的组件库
- **ECharts** - 强大的图表库

### 工具库
- **Axios** - HTTP 客户端
- **Day.js** - 轻量级日期处理库

## 📁 项目结构

```
trae-vue/
├── public/                      # 静态资源
│   ├── favicon.svg             # 网站图标
│   └── icons.svg               # 图标资源
├── src/
│   ├── api/                    # API接口配置（按模块分类）
│   │   ├── index.js            # API统一导出
│   │   ├── auth.js             # 认证API
│   │   ├── api/                # 接口管理模块
│   │   │   ├── api.js          # 接口列表API
│   │   │   ├── api-template.js # 接口模板API
│   │   │   ├── api-testcase.js # 接口测试用例API
│   │   │   └── api-result.js   # 接口测试结果API
│   │   ├── dashboard/          # 仪表盘模块
│   │   │   └── dashboard.js    # 仪表盘API
│   │   ├── page/               # 页面管理模块
│   │   │   ├── page-function.js    # 页面功能API
│   │   │   ├── page-template.js    # 页面模板API
│   │   │   ├── page-testcase.js    # 页面测试用例API
│   │   │   └── page-result.js      # 页面测试结果API
│   │   ├── project/            # 项目管理模块
│   │   │   └── project.js      # 项目管理API
│   │   ├── report/             # 报告管理模块
│   │   │   ├── report-api.js       # 接口报告API
│   │   │   ├── report-page.js      # 页面报告API
│   │   │   └── report-workflow.js  # 工作流报告API
│   │   ├── system/             # 系统管理模块
│   │   │   ├── user.js         # 用户管理API
│   │   │   ├── dept.js         # 部门管理API
│   │   │   ├── role.js         # 角色管理API
│   │   │   ├── dict.js         # 字典管理API
│   │   │   ├── log.js          # 日志管理API
│   │   │   └── token.js        # Token管理API
│   │   └── workflow/           # 工作流管理模块
│   │       ├── workflow-function.js # 工作流功能API
│   │       ├── workflow-step.js     # 工作流步骤API
│   │       └── workflow-result.js   # 工作流测试结果API
│   ├── assets/                 # 静态资源文件
│   │   ├── hero.png            # Hero图片
│   │   ├── vite.svg            # Vite图标
│   │   └── vue.svg             # Vue图标
│   ├── components/             # 公共组件
│   │   ├── CommonTable.vue     # 通用表格组件
│   │   ├── CommonDialog.vue    # 通用对话框组件
│   │   └── CommonButton.vue    # 通用按钮组件
│   ├── layout/                 # 布局组件
│   │   └── index.vue           # 主布局（侧边栏+顶部+内容区）
│   ├── router/                 # 路由配置
│   │   └── index.js            # 路由定义
│   ├── stores/                 # Pinia状态管理
│   │   ├── user.js             # 用户状态管理
│   │   └── app.js              # 应用状态管理
│   ├── utils/                  # 工具函数
│   │   ├── request.js          # Axios封装（请求拦截器、响应拦截器）
│   │   └── index.js            # 通用工具函数
│   ├── styles/                 # 全局样式
│   │   └── global.css          # 全局样式文件
│   ├── views/                  # 页面视图（按模块分类）
│   │   ├── login/              # 登录页
│   │   │   └── index.vue
│   │   ├── dashboard/          # 仪表盘
│   │   │   └── index.vue
│   │   ├── project/            # 项目管理
│   │   │   └── list/           # 项目列表
│   │   │       └── index.vue
│   │   ├── api/                # 接口管理
│   │   │   ├── list/           # 接口列表
│   │   │   │   └── index.vue
│   │   │   ├── template/       # 接口模板
│   │   │   │   └── index.vue
│   │   │   ├── testcase/       # 接口测试用例
│   │   │   │   └── index.vue
│   │   │   └── result/         # 接口测试结果
│   │   │       └── index.vue
│   │   ├── page/               # 页面管理
│   │   │   ├── function/       # 页面功能
│   │   │   │   └── index.vue
│   │   │   ├── template/       # 页面模板
│   │   │   │   └── index.vue
│   │   │   ├── testcase/       # 页面测试用例
│   │   │   │   └── index.vue
│   │   │   └── result/         # 页面测试结果
│   │   │       └── index.vue
│   │   ├── workflow/           # 工作流管理
│   │   │   ├── function/       # 工作流功能
│   │   │   │   └── index.vue
│   │   │   ├── step/           # 工作流步骤
│   │   │   │   └── index.vue
│   │   │   └── result/         # 工作流测试结果
│   │   │       └── index.vue
│   │   ├── report/             # 报告管理
│   │   │   ├── api/            # 接口报告
│   │   │   │   └── index.vue
│   │   │   ├── page/           # 页面报告
│   │   │   │   └── index.vue
│   │   │   └── workflow/       # 工作流报告
│   │   │       └── index.vue
│   │   └── system/             # 系统管理
│   │       ├── user/           # 用户管理
│   │       │   └── index.vue
│   │       ├── dept/           # 部门管理
│   │       │   └── index.vue
│   │       ├── role/           # 角色管理
│   │       │   └── index.vue
│   │       ├── dict/           # 字典管理
│   │       │   └── index.vue
│   │       ├── log/            # 日志管理
│   │       │   └── index.vue
│   │       └── token/          # Token管理
│   │           └── index.vue
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 入口文件
│   └── style.css               # 全局样式入口
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .gitignore                  # Git忽略配置
├── index.html                  # HTML模板
├── package.json                # 项目依赖
├── package-lock.json           # 依赖锁定文件
├── vite.config.js              # Vite配置
├── README.md                   # 项目说明文档
├── PROJECT.md                  # 项目详细文档
└── GUIDE.md                    # 使用指南
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📖 功能模块

### 1. 认证模块
- ✅ 用户登录/登出
- ✅ Token自动刷新
- ✅ 权限验证
- ✅ 路由守卫

### 2. 仪表盘
- 📊 数据统计概览
- 📈 趋势图表展示
- 🕒 最近活动记录

### 3. 项目管理
- 📁 项目创建与管理
- 👥 项目成员管理
- 📋 项目信息维护

### 4. 接口测试
- 🔌 接口定义与管理
- 📝 接口模板管理
- 🧪 测试用例设计
- ▶️ 测试执行
- 📊 结果查看与分析

### 5. 页面测试
- 🖼️ 页面功能定义
- 📄 页面模板管理
- 🧪 测试用例设计
- ▶️ 测试执行
- 📊 结果查看与分析

### 6. 工作流测试
- ⚙️ 工作流功能定义
- 🔄 工作流步骤配置
- ▶️ 测试执行
- 📊 结果查看与分析

### 7. 报告管理
- 📄 接口测试报告
- 📄 页面测试报告
- 📄 工作流测试报告
- 📥 报告导出功能

### 8. 系统管理
- 👤 用户管理
- 🏢 部门管理
- 🔑 角色管理
- 📚 字典管理
- 📝 日志管理
- 🔐 Token管理

## 🔧 配置说明

### 环境变量

项目使用 `.env` 文件管理环境变量：

**开发环境** (`.env.development`):
```env
VITE_API_BASE_URL=/api
```

**生产环境** (`.env.production`):
```env
VITE_API_BASE_URL=https://api.example.com
```

### API 配置

所有 API 接口统一在 `src/api/` 目录下管理，按模块划分：

```javascript
// 导入API
import { getUserList, addUser } from '@/api/system/user'

// 使用API
const res = await getUserList({ pageNum: 1, pageSize: 10 })
```

详见 [API_GUIDE.md](./API_GUIDE.md)

## 📚 文档

- [README.md](./README.md) - 项目说明（本文件）
- [PROJECT.md](./PROJECT.md) - 项目详细文档
- [GUIDE.md](./GUIDE.md) - 使用指南
- [API_GUIDE.md](./API_GUIDE.md) - API使用指南

## 🎨 设计规范

### 菜单规范
- 一级菜单直接显示，不显示展开箭头
- 二级菜单仅在多个子项时显示为可折叠菜单
- 退出登录按钮固定在侧边栏底部

### 表格规范
- 单元格内容超出自动隐藏并显示省略号
- 鼠标悬浮显示完整内容
- 统一的行高和样式

### 样式规范
- 统一的深色主题配色
- 一致的按钮样式和交互效果
- 响应式布局设计

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件

## 👥 团队

- 前端开发团队
- UI/UX 设计团队
- 测试团队

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 Email: support@example.com
- 💬 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [ECharts](https://echarts.apache.org/)

---

Made with ❤️ by Trae-Vue Team