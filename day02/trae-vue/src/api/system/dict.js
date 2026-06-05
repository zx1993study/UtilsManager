import request from '@/utils/request'

/**
 * 字典管理API
 */

// 获取字典列表
export function getDictList(params) {
  return request({
    url: '/system/dict/list',
    method: 'get',
    params
  })
}

// 获取字典详情
export function getDictDetail(id) {
  return request({
    url: `/system/dict/${id}`,
    method: 'get'
  })
}

// 新增字典
export function addDict(data) {
  return request({
    url: '/system/dict',
    method: 'post',
    data
  })
}

// 更新字典
export function updateDict(data) {
  return request({
    url: '/system/dict',
    method: 'put',
    data
  })
}

// 删除字典
export function deleteDict(id) {
  return request({
    url: `/system/dict/${id}`,
    method: 'delete'
  })
}

// 批量删除字典
export function batchDeleteDict(ids) {
  return request({
    url: '/system/dict/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取字典数据
export function getDictData(dictType) {
  return request({
    url: `/system/dict/data/${dictType}`,
    method: 'get'
  })
}
