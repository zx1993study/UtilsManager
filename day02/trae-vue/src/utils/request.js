import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const NETWORK_RETRY_COUNT = 1
const NETWORK_RETRY_DELAY = 300
const MESSAGE_DEDUP_INTERVAL = 1500
let lastMessage = ''
let lastMessageAt = 0

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const isIdempotentMethod = (method = 'get') => {
  return ['get', 'head', 'options'].includes(String(method).toLowerCase())
}

const isNetworkError = (error) => {
  return !error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK'
}

const showErrorMessage = (message) => {
  const now = Date.now()
  if (message === lastMessage && now - lastMessageAt < MESSAGE_DEDUP_INTERVAL) {
    return
  }
  lastMessage = message
  lastMessageAt = now
  ElMessage.error(message)
}

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    const token = userStore.token || localStorage.getItem('token')
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    ElMessage.error('请求配置错误')
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的是文件流，直接返回
    if (response.config.responseType === 'blob') {
      return res
    }
    
    // 统一处理业务状态码
    if (res.code !== 200 && res.code !== undefined) {
      showErrorMessage(res.message || '请求失败')
      
      // token过期或无效，跳转到登录页
      if (res.code === 401) {
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
      }
      
      // 权限不足
      if (res.code === 403) {
        showErrorMessage('权限不足，无法访问')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    const config = error.config || {}
    const retryCount = config.__retryCount || 0

    if (isNetworkError(error) && isIdempotentMethod(config.method) && retryCount < NETWORK_RETRY_COUNT) {
      config.__retryCount = retryCount + 1
      return sleep(NETWORK_RETRY_DELAY).then(() => request(config))
    }
    
    let message = '网络错误'
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = error.response.data?.message || '连接错误'
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    } else if (!window.navigator.onLine) {
      message = '网络连接异常，请检查网络'
    }
    
    if (!config.silent) {
      showErrorMessage(message)
    }
    return Promise.reject(error)
  }
)

export default request
