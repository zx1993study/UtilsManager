/**
 * API 统一导出
 */

// 认证相关
export * from './auth'

// 系统管理
export * from './system/user'
export * from './system/dept'
export * from './system/role'
export * from './system/dict'
export * from './system/log'
export * from './system/token'

// 项目管理
export * from './project/project'

// 接口管理
export * from './api/api'
export * from './api/api-template'
export * from './api/api-testcase'
export * from './api/api-result'

// 页面管理
export * from './page/page-function'
export * from './page/page-template'
export * from './page/page-testcase'
export * from './page/page-result'

// 工作流管理
export * from './workflow/workflow-function'
export * from './workflow/workflow-step'
export * from './workflow/workflow-result'

// 报告管理
export * from './report/report-api'
export * from './report/report-page'
export * from './report/report-workflow'

// 仪表盘
export * from './dashboard/dashboard'