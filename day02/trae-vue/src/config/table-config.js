/**
 * 表格配置统一管理
 * 包含所有列表页面的列配置和搜索字段配置
 */

// ==================== 系统管理模块 ====================

/**
 * 用户管理配置
 */
export const userConfig = {
  columns: [
    { prop: 'username', label: '用户名', minWidth: 120 },
    { prop: 'nickname', label: '昵称', minWidth: 120 },
    { prop: 'email', label: '邮箱', minWidth: 180 },
    { prop: 'phone', label: '手机号', width: 130 },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'username', label: '用户名', placeholder: '请输入用户名' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * 部门管理配置
 */
export const deptConfig = {
  columns: [
    { prop: 'deptName', label: '部门名称', minWidth: 200 },
    { prop: 'orderNum', label: '排序', width: 80 },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'deptName', label: '部门名称', placeholder: '请输入部门名称' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * 角色管理配置
 */
export const roleConfig = {
  columns: [
    { prop: 'roleName', label: '角色名称', minWidth: 150 },
    { prop: 'roleKey', label: '角色标识', minWidth: 150 },
    { prop: 'orderNum', label: '排序', width: 80 },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'roleName', label: '角色名称', placeholder: '请输入角色名称' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * 字典管理配置
 */
export const dictConfig = {
  columns: [
    { prop: 'dictName', label: '字典名称', minWidth: 150 },
    { prop: 'dictType', label: '字典类型', minWidth: 150 },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'dictName', label: '字典名称', placeholder: '请输入字典名称' },
    { type: 'input', prop: 'dictType', label: '字典类型', placeholder: '请输入字典类型' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * Token管理配置
 */
export const tokenConfig = {
  columns: [
    { prop: 'name', label: 'Token名称', minWidth: 150 },
    { prop: 'param', label: '参数', minWidth: 200, showOverflowTooltip: true },
    { prop: 'paramType', label: '参数类型', width: 120 },
    { prop: 'projectName', label: '项目名称', minWidth: 150 }
  ],
  searchFields: [
    { type: 'input', prop: 'name', label: 'Token名称', placeholder: '请输入Token名称' },
    { type: 'select', prop: 'paramType', label: '参数类型', placeholder: '请选择参数类型',
      options: [
        { label: 'Header', value: 1 },
        { label: 'Query', value: 2 },
        { label: 'Body', value: 3 }
      ]
    }
  ]
}

// ==================== 项目管理模块 ====================

/**
 * 项目管理配置
 */
export const projectConfig = {
  columns: [
    { prop: 'projectName', label: '项目名称', minWidth: 200 },
    { prop: 'projectAddress', label: '项目地址', minWidth: 250, showOverflowTooltip: true },
    { prop: 'projectSwagger', label: 'Swagger地址', minWidth: 250, showOverflowTooltip: true },
    { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'projectName', label: '项目名称', placeholder: '请输入项目名称' }
  ]
}

// ==================== 接口管理模块 ====================

/**
 * API列表配置
 */
export const apiListConfig = {
  columns: [
    { prop: 'apiName', label: '接口名称', minWidth: 200 },
    { prop: 'methodUrl', label: '接口路径', minWidth: 250 },
    { prop: 'methodType', label: '请求方法', width: 100, slot: 'methodType' },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'apiName', label: '接口名称', placeholder: '请输入接口名称' },
    { type: 'select', prop: 'methodType', label: '请求方法', placeholder: '请选择请求方法',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' }
      ]
    },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * API模板配置
 */
export const apiTemplateConfig = {
  columns: [
    { prop: 'templateName', label: '模板名称', minWidth: 200 },
    { prop: 'templateUrl', label: '模板URL', minWidth: 250, showOverflowTooltip: true },
    { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'templateName', label: '模板名称', placeholder: '请输入模板名称' }
  ]
}

/**
 * API测试用例配置
 */
export const apiTestcaseConfig = {
  columns: [
    { prop: 'testcaseName', label: '用例名称', minWidth: 200 },
    { prop: 'steps', label: '测试步骤', minWidth: 250, showOverflowTooltip: true },
    { prop: 'expectedResult', label: '预期结果', minWidth: 250, showOverflowTooltip: true },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'testcaseName', label: '用例名称', placeholder: '请输入用例名称' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * API测试结果配置
 */
export const apiResultConfig = {
  columns: [
    { prop: 'testcaseName', label: '用例名称', minWidth: 200 },
    { prop: 'apiName', label: '接口名称', minWidth: 200 },
    { prop: 'status', label: '测试结果', width: 100, slot: 'status' },
    { prop: 'responseTime', label: '响应时间(ms)', width: 120 },
    { prop: 'executeTime', label: '执行时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'testcaseName', label: '用例名称', placeholder: '请输入用例名称' },
    { type: 'select', prop: 'status', label: '测试结果', placeholder: '请选择状态',
      options: [
        { label: '通过', value: 1 },
        { label: '失败', value: 0 }
      ]
    }
  ]
}

// ==================== 页面管理模块 ====================

/**
 * 页面功能配置
 */
export const pageFunctionConfig = {
  columns: [
    { prop: 'functionName', label: '功能名称', minWidth: 200 },
    { prop: 'pagePath', label: '页面路径', minWidth: 250 },
    { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'functionName', label: '功能名称', placeholder: '请输入功能名称' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * 页面模板配置
 */
export const pageTemplateConfig = {
  columns: [
    { prop: 'templateName', label: '模板名称', minWidth: 200 },
    { prop: 'templateContent', label: '模板内容', minWidth: 250, showOverflowTooltip: true },
    { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'templateName', label: '模板名称', placeholder: '请输入模板名称' }
  ]
}

/**
 * 页面测试用例配置
 */
export const pageTestcaseConfig = {
  columns: [
    { prop: 'name', label: '用例名称', minWidth: 200 },
    { prop: 'steps', label: '测试步骤', minWidth: 250, showOverflowTooltip: true },
    { prop: 'expectedResult', label: '预期结果', minWidth: 250, showOverflowTooltip: true },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'name', label: '用例名称', placeholder: '请输入用例名称' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * 页面测试结果配置
 */
export const pageResultConfig = {
  columns: [
    { prop: 'testcaseName', label: '用例名称', minWidth: 200 },
    { prop: 'pageName', label: '页面名称', minWidth: 200 },
    { prop: 'status', label: '测试结果', width: 100, slot: 'status' },
    { prop: 'executeTime', label: '执行时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'testcaseName', label: '用例名称', placeholder: '请输入用例名称' },
    { type: 'select', prop: 'status', label: '测试结果', placeholder: '请选择状态',
      options: [
        { label: '通过', value: 1 },
        { label: '失败', value: 0 }
      ]
    }
  ]
}

// ==================== 工作流管理模块 ====================

/**
 * 工作流功能配置
 */
export const workflowFunctionConfig = {
  columns: [
    { prop: 'functionName', label: '功能名称', minWidth: 200 },
    { prop: 'workflowName', label: '工作流名称', minWidth: 200 },
    { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
    { prop: 'status', label: '状态', width: 80, slot: 'status' },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'functionName', label: '功能名称', placeholder: '请输入功能名称' },
    { type: 'select', prop: 'status', label: '状态', placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
}

/**
 * 工作流步骤配置
 */
export const workflowStepConfig = {
  columns: [
    { prop: 'stepName', label: '步骤名称', minWidth: 200 },
    { prop: 'stepOrder', label: '步骤顺序', width: 100 },
    { prop: 'description', label: '描述', minWidth: 250, showOverflowTooltip: true },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'stepName', label: '步骤名称', placeholder: '请输入步骤名称' }
  ]
}

/**
 * 工作流测试结果配置
 */
export const workflowResultConfig = {
  columns: [
    { prop: 'testcaseName', label: '用例名称', minWidth: 200 },
    { prop: 'workflowName', label: '工作流名称', minWidth: 200 },
    { prop: 'status', label: '测试结果', width: 100, slot: 'status' },
    { prop: 'executeTime', label: '执行时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'testcaseName', label: '用例名称', placeholder: '请输入用例名称' },
    { type: 'select', prop: 'status', label: '测试结果', placeholder: '请选择状态',
      options: [
        { label: '通过', value: 1 },
        { label: '失败', value: 0 }
      ]
    }
  ]
}

// ==================== 报告管理模块 ====================

/**
 * 接口报告配置
 */
export const reportApiConfig = {
  columns: [
    { prop: 'reportName', label: '报告名称', minWidth: 200 },
    { prop: 'apiName', label: '接口名称', minWidth: 200 },
    { prop: 'totalCases', label: '总用例数', width: 100 },
    { prop: 'passCases', label: '通过数', width: 100 },
    { prop: 'passRate', label: '通过率', width: 100 },
    { prop: 'executeTime', label: '执行时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'reportName', label: '报告名称', placeholder: '请输入报告名称' },
    { type: 'input', prop: 'apiName', label: '接口名称', placeholder: '请输入接口名称' }
  ]
}

/**
 * 页面报告配置
 */
export const reportPageConfig = {
  columns: [
    { prop: 'reportName', label: '报告名称', minWidth: 200 },
    { prop: 'pageName', label: '页面名称', minWidth: 200 },
    { prop: 'totalCases', label: '总用例数', width: 100 },
    { prop: 'passCases', label: '通过数', width: 100 },
    { prop: 'passRate', label: '通过率', width: 100 },
    { prop: 'executeTime', label: '执行时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'reportName', label: '报告名称', placeholder: '请输入报告名称' },
    { type: 'input', prop: 'pageName', label: '页面名称', placeholder: '请输入页面名称' }
  ]
}

/**
 * 工作流报告配置
 */
export const reportWorkflowConfig = {
  columns: [
    { prop: 'reportName', label: '报告名称', minWidth: 200 },
    { prop: 'workflowName', label: '工作流名称', minWidth: 200 },
    { prop: 'totalCases', label: '总用例数', width: 100 },
    { prop: 'passCases', label: '通过数', width: 100 },
    { prop: 'passRate', label: '通过率', width: 100 },
    { prop: 'executeTime', label: '执行时间', width: 180 }
  ],
  searchFields: [
    { type: 'input', prop: 'reportName', label: '报告名称', placeholder: '请输入报告名称' },
    { type: 'input', prop: 'workflowName', label: '工作流名称', placeholder: '请输入工作流名称' }
  ]
}
