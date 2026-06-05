import request from '@/utils/request'

/**
 * 接口模板API
 */

// 获取模板列表
export function getTemplateList(params) {
  return request({
    url: '/api/v1/apiTemplate',
    method: 'get',
    params
  })
}

// 获取模板详情
export function getTemplateDetail(id) {
  return request({
    url: `/api/v1/apiTemplate/${id}`,
    method: 'get'
  })
}

// 新增模板
export function addTemplate(data) {
  return request({
    url: '/api/v1/apiTemplate',
    method: 'post',
    data
  })
}

// 更新模板
export function updateTemplate(data) {
  return request({
    url: '/api/v1/apiTemplate',
    method: 'put',
    data
  })
}

// 删除模板
export function deleteTemplate(id) {
  return request({
    url: `/api/v1/apiTemplate/${id}`,
    method: 'delete'
  })
}

// 批量删除模板
export function batchDeleteTemplate(ids) {
  return request({
    url: '/api/v1/apiTemplate/batch',
    method: 'delete',
    data: { ids }
  })
}
