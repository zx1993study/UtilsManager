import request from '@/utils/request'

/**
 * 页面模板API
 */

// 获取页面模板列表
export function getPageTemplateList(params) {
  return request({
    url: '/page/template/list',
    method: 'get',
    params
  })
}

// 获取页面模板详情
export function getPageTemplateDetail(id) {
  return request({
    url: `/page/template/${id}`,
    method: 'get'
  })
}

// 新增页面模板
export function addPageTemplate(data) {
  return request({
    url: '/page/template',
    method: 'post',
    data
  })
}

// 更新页面模板
export function updatePageTemplate(data) {
  return request({
    url: '/page/template',
    method: 'put',
    data
  })
}

// 删除页面模板
export function deletePageTemplate(id) {
  return request({
    url: `/page/template/${id}`,
    method: 'delete'
  })
}

// 批量删除页面模板
export function batchDeletePageTemplate(ids) {
  return request({
    url: '/page/template/batch',
    method: 'delete',
    data: { ids }
  })
}
