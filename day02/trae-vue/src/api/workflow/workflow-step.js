import request from '@/utils/request'

/**
 * 工作流步骤API
 */

// 获取工作流步骤列表
export function getWorkflowStepList(params) {
  return request({
    url: '/workflow/step/list',
    method: 'get',
    params
  })
}

// 获取工作流步骤详情
export function getWorkflowStepDetail(id) {
  return request({
    url: `/workflow/step/${id}`,
    method: 'get'
  })
}

// 新增工作流步骤
export function addWorkflowStep(data) {
  return request({
    url: '/workflow/step',
    method: 'post',
    data
  })
}

// 更新工作流步骤
export function updateWorkflowStep(data) {
  return request({
    url: '/workflow/step',
    method: 'put',
    data
  })
}

// 删除工作流步骤
export function deleteWorkflowStep(id) {
  return request({
    url: `/workflow/step/${id}`,
    method: 'delete'
  })
}

// 批量删除工作流步骤
export function batchDeleteWorkflowStep(ids) {
  return request({
    url: '/workflow/step/batch',
    method: 'delete',
    data: { ids }
  })
}
