import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/stores/user'
import { getUserInfo } from '@/api/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  // 根路径重定向到仪表盘
  {
    path: '/',
    redirect: '/dashboard'
  },
  // 仪表盘（一级菜单）
  {
    path: '/dashboard',
    component: Layout,
    meta: { title: '仪表盘', icon: 'Odometer' },
    children: [
      {
        // 空 path 作为 /dashboard 的默认子路由，避免与父路由同名（消除 vue-router 重复路径告警）
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      }
    ]
  },
  // 系统管理
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: '/system/dept',
        name: 'SystemDept',
        component: () => import('@/views/system/dept/index.vue'),
        meta: { title: '部门管理', icon: 'OfficeBuilding' }
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'Avatar' }
      },
      {
        path: '/system/dict',
        name: 'SystemDict',
        component: () => import('@/views/system/dict/index.vue'),
        meta: { title: '字典管理', icon: 'Collection' }
      },
      {
        path: '/system/log',
        name: 'SystemLog',
        component: () => import('@/views/system/log/index.vue'),
        meta: { title: '日志管理', icon: 'Document' }
      }
    ]
  },
  // 项目管理
  {
    path: '/project',
    component: Layout,
    redirect: '/project/list',
    meta: { title: '项目管理', icon: 'Folder' },
    children: [
      {
        path: '/project/list',
        name: 'ProjectList',
        component: () => import('@/views/project/list/index.vue'),
        meta: { title: '项目列表', icon: 'List' }
      },
      {
        path: '/project/token',
        name: 'ProjectToken',
        component: () => import('@/views/project/token/index.vue'),
        meta: { title: 'Token管理', icon: 'Key' }
      }
    ]
  },
  // 接口管理
  {
    path: '/api',
    component: Layout,
    redirect: '/api/list',
    meta: { title: '接口管理', icon: 'Connection' },
    children: [
      {
        path: '/api/list',
        name: 'ApiList',
        component: () => import('@/views/api/list/index.vue'),
        meta: { title: 'API列表', icon: 'List' }
      },
      {
        path: '/api/template',
        name: 'ApiTemplate',
        component: () => import('@/views/api/template/index.vue'),
        meta: { title: '参数模板', icon: 'Document' }
      },
      {
        path: '/api/testcase',
        name: 'ApiTestcase',
        component: () => import('@/views/api/testcase/index.vue'),
        meta: { title: '测试用例', icon: 'Files' }
      },
      {
        path: '/api/result',
        name: 'ApiResult',
        component: () => import('@/views/api/result/index.vue'),
        meta: { title: '结果管理', icon: 'DataAnalysis' }
      },
      {
        path: '/api/flow',
        name: 'ApiFlow',
        component: () => import('@/views/api/flow/index.vue'),
        meta: { title: 'API流程', icon: 'Share' }
      },
      {
        path: '/api/flow-detail/:flowId',
        name: 'ApiFlowDetail',
        component: () => import('@/views/api/flow-detail/index.vue'),
        meta: { title: '流程详情', hidden: true }
      },
      {
        path: '/api/testcase-detail/:apiId',
        name: 'ApiTestcaseDetail',
        component: () => import('@/views/api/testcase-detail/index.vue'),
        meta: { title: 'API测试用例详情', hidden: true }
      }
    ]
  },
  // 页面管理
  {
    path: '/page',
    component: Layout,
    redirect: '/page/function',
    meta: { title: '页面管理', icon: 'Monitor' },
    children: [
      {
        path: '/page/function',
        name: 'PageFunction',
        component: () => import('@/views/page/function/index.vue'),
        meta: { title: '页面功能', icon: 'Menu' }
      },
      {
        path: '/page/template',
        name: 'PageTemplate',
        component: () => import('@/views/page/template/index.vue'),
        meta: { title: '元素模板', icon: 'Document', hidden: true }
      },
      {
        path: '/page/function-detail/:pageId',
        name: 'PageFunctionDetail',
        component: () => import('@/views/page/function-detail/index.vue'),
        meta: { title: '页面功能详情', hidden: true }
      },
      {
        path: '/page/testcase',
        name: 'PageTestcase',
        component: () => import('@/views/page/testcase/index.vue'),
        meta: { title: '测试用例', icon: 'Files' }
      },
      {
        path: '/page/result',
        name: 'PageResult',
        component: () => import('@/views/page/result/index.vue'),
        meta: { title: '结果管理', icon: 'DataAnalysis' }
      }
    ]
  },
  // 流程管理
  {
    path: '/workflow',
    component: Layout,
    redirect: '/workflow/function',
    meta: { title: '流程管理', icon: 'Share' },
    children: [
      {
        path: '/workflow/function',
        name: 'WorkflowFunction',
        component: () => import('@/views/workflow/function/index.vue'),
        meta: { title: '流程功能', icon: 'Menu' }
      },
      {
        path: '/workflow/step',
        name: 'WorkflowStep',
        component: () => import('@/views/workflow/step/index.vue'),
        meta: { title: '流程步骤', icon: 'Operation' }
      },
      {
        path: '/workflow/result',
        name: 'WorkflowResult',
        component: () => import('@/views/workflow/result/index.vue'),
        meta: { title: '结果管理', icon: 'DataAnalysis' }
      }
    ]
  },
  // 报告管理
  {
    path: '/report',
    component: Layout,
    redirect: '/report/api',
    meta: { title: '报告管理', icon: 'TrendCharts' },
    children: [
      {
        path: '/report/api',
        name: 'ReportApi',
        component: () => import('@/views/report/api/index.vue'),
        meta: { title: '接口报告', icon: 'TrendCharts' }
      },
      {
        path: '/report/page',
        name: 'ReportPage',
        component: () => import('@/views/report/page/index.vue'),
        meta: { title: '页面报告', icon: 'Histogram' }
      },
      {
        path: '/report/workflow',
        name: 'ReportWorkflow',
        component: () => import('@/views/report/workflow/index.vue'),
        meta: { title: '流程报告', icon: 'PieChart' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 本次会话是否已向后端校验过 token（避免每次导航都请求）
let tokenValidated = false

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')

  // 未登录：只放行登录页，其余一律去登录
  if (!token) {
    tokenValidated = false
    return to.path === '/login' ? next() : next('/login')
  }

  // 有 token：首屏向后端校验一次，过滤掉残留/伪造/过期的 token
  if (!tokenValidated) {
    tokenValidated = true
    try {
      const res = await getUserInfo()
      if (res && res.success) {
        userStore.setUserInfo(res.data)
      } else {
        userStore.logout()
        return next('/login')
      }
    } catch (error) {
      // 401/网络异常等：清登录态，回登录页
      userStore.logout()
      return next('/login')
    }
  }

  // 已登录且校验通过：访问登录页时跳回仪表盘
  if (to.path === '/login') {
    return next('/dashboard')
  }
  next()
})

export default router
