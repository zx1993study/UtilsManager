import request from '@/utils/request'

/**
 * 项目管理API
 */

// 获取项目列表
export function getProjectList(params) {
  return request({
    url: '/api/v1/projectInfo',
    method: 'get',
    params
  })
}

export function getProjectSelectOptions(params) {
  return request({
    url: '/api/v1/projectInfo/selectOptions',
    method: 'get',
    params
  })
}

// 获取项目详情
export function getProjectDetail(id) {
  return request({
    url: `/api/v1/projectInfo/${id}`,
    method: 'get'
  })
}

// 新增项目
export function addProject(data) {
  return request({
    url: '/api/v1/projectInfo',
    method: 'post',
    data
  })
}

// 更新项目
export function updateProject(data) {
  return request({
    url: '/api/v1/projectInfo',
    method: 'put',
    data
  })
}

// 删除项目
export function deleteProject(id) {
  return request({
    url: `/api/v1/projectInfo/${id}`,
    method: 'delete'
  })
}

// 批量删除项目
export function batchDeleteProject(ids) {
  return request({
    url: '/api/v1/projectInfo/batch',
    method: 'delete',
    data: { ids }
  })
}

// 获取项目成员
export function getProjectMembers(projectId) {
  return request({
    url: `/api/v1/projectInfo/${projectId}/members`,
    method: 'get'
  })
}

// 添加项目成员
export function addProjectMember(projectId, memberIds) {
  return request({
    url: `/api/v1/projectInfo/${projectId}/members`,
    method: 'post',
    data: { memberIds }
  })
}

// 移除项目成员
export function removeProjectMember(projectId, memberId) {
  return request({
    url: `/api/v1/projectInfo/${projectId}/members/${memberId}`,
    method: 'delete'
  })
}

// 解析Swagger
export function parseSwagger(data) {
  return request({
    url: '/api/v1/swagger/parse',
    method: 'post',
    timeout: 60000,
    data
  })
}
