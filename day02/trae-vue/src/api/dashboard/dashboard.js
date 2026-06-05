import request from '@/utils/request'

/**
 * 仪表盘API
 */

// 获取统计数据
export function getStatistics() {
  return request({
    url: '/dashboard/statistics',
    method: 'get'
  })
}

// 获取趋势数据
export function getTrendData(params) {
  return request({
    url: '/dashboard/trend',
    method: 'get',
    params
  })
}

// 获取最近活动
export function getRecentActivities(limit = 10) {
  return request({
    url: '/dashboard/activities',
    method: 'get',
    params: { limit }
  })
}
