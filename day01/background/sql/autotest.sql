
-- 创建数据库
CREATE DATABASE IF NOT EXISTS zx_test 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用该数据库
USE zx_test;


-- 1. 项目信息表 (Project Info)
CREATE TABLE `project_info` (
  `project_id` BIGINT NOT NULL COMMENT '项目id',
  `project_name` VARCHAR(255) DEFAULT NULL COMMENT '项目名称',
  `project_address` VARCHAR(255) DEFAULT NULL COMMENT '项目地址',
  `project_port` VARCHAR(255) DEFAULT NULL COMMENT '项目端口',
  `project_env` VARCHAR(255) DEFAULT NULL COMMENT '项目环境',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目信息表';

-- 2. 字典信息表 (Dictionary Info)
CREATE TABLE `dictionary_info` (
  `dict_id` BIGINT NOT NULL COMMENT '字典id',
  `dict_name` VARCHAR(255) DEFAULT NULL COMMENT '字典名称',
  `key_value` VARCHAR(255) DEFAULT NULL COMMENT '键值',
  `value` VARCHAR(255) DEFAULT NULL COMMENT '值',
  `type` VARCHAR(255) DEFAULT NULL COMMENT '类型',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`dict_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典信息表';

-- 3. 接口表 (API Info)
CREATE TABLE `api_info` (
  `api_id` BIGINT NOT NULL COMMENT '接口id',
  `api_name` VARCHAR(255) DEFAULT NULL COMMENT '接口名称',
  `method_type` VARCHAR(255) DEFAULT NULL COMMENT '方法类型',
  `method_url` VARCHAR(255) DEFAULT NULL COMMENT '方法URL',
  `token_id` VARCHAR(255) DEFAULT NULL COMMENT 'tokenId',
  `request_header` TEXT COMMENT '请求头',
  `description` TEXT COMMENT '描述',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`api_id`),
  INDEX idx_token_id (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接口表';

-- 4. 接口模板表 (API Template)
CREATE TABLE `api_template` (
  `api_template_id` BIGINT NOT NULL COMMENT '接口模板id',
  `field_name` VARCHAR(255) DEFAULT NULL COMMENT '字段名称',
  `field_type` VARCHAR(255) DEFAULT NULL COMMENT '字段类型',
  `field_size` VARCHAR(255) DEFAULT NULL COMMENT '字段大小',
  `not_null` VARCHAR(255) DEFAULT NULL COMMENT '非空',
  `api_id` VARCHAR(255) DEFAULT NULL COMMENT '接口id',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`api_template_id`),
  INDEX idx_api_id (`api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接口模板表';

-- 5. 参数实例表 (Parameter Instance)
CREATE TABLE `param_instance` (
  `instance_id` BIGINT NOT NULL COMMENT '接口实例id',
  `instance_name` VARCHAR(255) DEFAULT NULL COMMENT '接口实例名称',
  `description` TEXT COMMENT '描述',
  `api_id` VARCHAR(255) DEFAULT NULL COMMENT '接口id',
  `instance_json` TEXT COMMENT '实例JSON',
  `exec_count` INT DEFAULT NULL COMMENT '执行次数',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `expect_result` TEXT COMMENT '期望结果',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`instance_id`),
  INDEX idx_api_id (`api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='参数实例表';

-- 6. 页面管理表 (Page Management)
CREATE TABLE `page_info` (
  `page_id` BIGINT NOT NULL COMMENT '页面id',
  `page_name` VARCHAR(255) DEFAULT NULL COMMENT '页面名称',
  `description` TEXT COMMENT '描述',
  `url` VARCHAR(255) DEFAULT NULL COMMENT 'URL',
  `token_id` VARCHAR(255) DEFAULT NULL COMMENT 'tokenId',
  `function` TEXT COMMENT '功能',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`page_id`),
  INDEX idx_token_id (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面管理表';

-- 7. 元素模板表 (Element Template)
CREATE TABLE `element_template` (
  `element_template_id` BIGINT NOT NULL COMMENT '元素模板id',
  `element_name` VARCHAR(255) DEFAULT NULL COMMENT '元素名称',
  `page_id` VARCHAR(255) DEFAULT NULL COMMENT '页面id',
  `locator` VARCHAR(255) DEFAULT NULL COMMENT '定位器',
  `element` TEXT COMMENT '元素',
  `type` VARCHAR(255) DEFAULT NULL COMMENT '类型',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `action` TEXT COMMENT '操作',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`element_template_id`),
  INDEX idx_page_id (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='元素模板表';

-- 8. 页面实例表 (Page Instance)
CREATE TABLE `page_instance` (
  `page_instance_id` BIGINT NOT NULL COMMENT '页面实例id',
  `page_id` VARCHAR(255) DEFAULT NULL COMMENT '页面id',
  `action_json` TEXT COMMENT '操作JSON',
  `page_instance_name` VARCHAR(255) DEFAULT NULL COMMENT '页面实例名称',
  `description` TEXT COMMENT '描述',
  `expect_result` TEXT COMMENT '预期结果',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`page_instance_id`),
  INDEX idx_page_id (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面实例表';

-- 9. 流程信息表 (Flow Info)
CREATE TABLE `flow_info` (
  `flow_id` BIGINT NOT NULL COMMENT '流程id',
  `flow_name` VARCHAR(255) DEFAULT NULL COMMENT '流程名称',
  `description` TEXT COMMENT '描述',
  `expect_result` TEXT COMMENT '预期结果',
  `actual_result` TEXT COMMENT '实际结果',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`flow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程信息表';

-- 10. 流程步骤表 (Flow Step)
CREATE TABLE `flow_step` (
  `flow_step_id` BIGINT NOT NULL COMMENT '流程步骤id',
  `api_id` VARCHAR(255) DEFAULT NULL COMMENT '接口id',
  `instance_id` VARCHAR(255) DEFAULT NULL COMMENT '实例id',
  `param` TEXT COMMENT '参数',
  `is_batch` VARCHAR(255) DEFAULT NULL COMMENT '是否批处理',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `expect_result` TEXT COMMENT '预期结果',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`flow_step_id`),
  INDEX idx_api_id (`api_id`),
  INDEX idx_instance_id (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程步骤表';

-- 11. 接口结果表 (API Result)
CREATE TABLE `api_result` (
  `api_result_id` BIGINT NOT NULL COMMENT '接口结果id',
  `return_info` TEXT COMMENT '返回信息',
  `instance_id` VARCHAR(255) DEFAULT NULL COMMENT '接口实例id',
  `result_status` VARCHAR(255) DEFAULT NULL COMMENT '结果状态',
  `code` VARCHAR(255) DEFAULT NULL COMMENT 'code',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`api_result_id`),
  INDEX idx_instance_id (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接口结果表';

-- 12. 页面结果表 (Page Result)
CREATE TABLE `page_result` (
  `page_result_id` BIGINT NOT NULL COMMENT '页面结果id',
  `page_instance_id` VARCHAR(255) DEFAULT NULL COMMENT '页面实例id',
  `return_info` TEXT COMMENT '返回信息',
  `code` VARCHAR(255) DEFAULT NULL COMMENT 'code',
  `result_status` VARCHAR(255) DEFAULT NULL COMMENT '结果状态',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `screenshot_path` VARCHAR(255) DEFAULT NULL COMMENT '截图路径',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`page_result_id`),
  INDEX idx_page_instance_id (`page_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面结果表';

-- 13. 流程结果表 (Flow Result)
CREATE TABLE `flow_result` (
  `flow_result_id` BIGINT NOT NULL COMMENT '流程结果id',
  `flow_id` VARCHAR(255) DEFAULT NULL COMMENT '流程id',
  `result_id` VARCHAR(255) DEFAULT NULL COMMENT '结果id',
  `expect_result` TEXT COMMENT '预期结果',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`flow_result_id`),
  INDEX idx_flow_id (`flow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程结果表';

-- 14. 用户表 (User Info)
CREATE TABLE `user_info` (
  `user_id` BIGINT NOT NULL COMMENT '用户id',
  `nickname` VARCHAR(255) DEFAULT NULL COMMENT '用户昵称',
  `username` VARCHAR(255) DEFAULT NULL COMMENT '用户名',
  `password` VARCHAR(255) DEFAULT NULL COMMENT '密码',
  `dept_id` VARCHAR(255) DEFAULT NULL COMMENT '部门id',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 15. Token信息表 (Token Info)
CREATE TABLE `token_info` (
  `token_id` BIGINT NOT NULL COMMENT 'tokenId',
  `name` VARCHAR(255) DEFAULT NULL COMMENT '名称',
  `type` VARCHAR(255) DEFAULT NULL COMMENT '类型',
  `url` VARCHAR(255) DEFAULT NULL COMMENT 'URL',
  `param_type` VARCHAR(255) DEFAULT NULL COMMENT '参数类型',
  `param` TEXT COMMENT '参数',
  `status` VARCHAR(255) DEFAULT NULL COMMENT '状态',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `creator` VARCHAR(255) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='token信息表';