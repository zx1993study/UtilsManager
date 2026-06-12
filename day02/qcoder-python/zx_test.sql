-- 创建数据库
CREATE DATABASE IF NOT EXISTS zx_test 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用该数据库
USE zx_test;
-- ----------------------------
-- 1. 项目信息表
-- ----------------------------
DROP TABLE IF EXISTS `project_info`;
CREATE TABLE `project_info` (
  `project_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `project_name` VARCHAR(50) DEFAULT NULL COMMENT '项目名称',
  `project_address` VARCHAR(50) DEFAULT NULL COMMENT '项目地址',
  `project_swagger` VARCHAR(50) DEFAULT NULL COMMENT '项目端口',
  `project_env` VARCHAR(50) DEFAULT NULL COMMENT '项目环境',
  `version` VARCHAR(50) DEFAULT NULL COMMENT '项目版本',
  `remark` TEXT COMMENT '备注',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目信息表';

-- ----------------------------
-- 15. token信息表 (token_info)
-- ----------------------------
DROP TABLE IF EXISTS `token_info`;
CREATE TABLE `token_info` (
  `token_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'tokenId',
  `name` VARCHAR(50) DEFAULT NULL COMMENT '名称',
  `type` SMALLINT DEFAULT NULL COMMENT '类型',
  `token_type` SMALLINT DEFAULT 1 COMMENT 'token类型 1api 2web',
  `project_id` BIGINT DEFAULT NULL COMMENT '项目id',
  `instance_id` BIGINT DEFAULT NULL COMMENT '实例id',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `token` TEXT COMMENT 'token',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`token_id`),
  KEY `idx_token_project_id` (`project_id`),
  CONSTRAINT `fk_token_project` FOREIGN KEY (`project_id`) REFERENCES `project_info` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='token信息表';

-- ----------------------------
-- 2. 字典信息表
-- ----------------------------
DROP TABLE IF EXISTS `dict_info`;
CREATE TABLE `dict_info` (
  `dict_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dict_name` VARCHAR(50) DEFAULT NULL COMMENT '字典名称',
  `dict_key` VARCHAR(50) DEFAULT NULL COMMENT '键值',
  `dict_value` TEXT COMMENT '值',
  `type` SMALLINT DEFAULT NULL COMMENT '类型',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`dict_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='字典信息表';

-- ----------------------------
-- 3. 接口表
-- ----------------------------
DROP TABLE IF EXISTS `api_info`;
CREATE TABLE `api_info` (
  `api_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `api_name` VARCHAR(50) DEFAULT NULL COMMENT '接口名称',
  `method_type` SMALLINT DEFAULT NULL COMMENT '方法类型',
  `method_url` VARCHAR(500) DEFAULT NULL COMMENT '方法URL',
  `project_id` BIGINT DEFAULT NULL COMMENT '项目id',
  `token_id` BIGINT DEFAULT NULL COMMENT 'tokenId',
  `request_header` VARCHAR(500) DEFAULT NULL COMMENT '请求头',
  `params_path` VARCHAR(50) DEFAULT NULL COMMENT '参数位置',
  `description` TEXT COMMENT '描述',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`api_id`),
  KEY `idx_api_project_id` (`project_id`),
  KEY `idx_api_token_id` (`token_id`),
  CONSTRAINT `fk_api_project` FOREIGN KEY (`project_id`) REFERENCES `project_info` (`project_id`),
  CONSTRAINT `fk_api_token` FOREIGN KEY (`token_id`) REFERENCES `token_info` (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接口表';

-- ----------------------------
-- 4. 接口模板表
-- ----------------------------
DROP TABLE IF EXISTS `api_template`;
CREATE TABLE `api_template` (
  `template_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `field_name` VARCHAR(50) DEFAULT NULL COMMENT '字段名称',
  `field_type` SMALLINT DEFAULT NULL COMMENT '字段类型',
  `field_size` int4 DEFAULT NULL COMMENT '字段大小',
  `is_required` VARCHAR(10) DEFAULT NULL COMMENT '非空',
  `api_id` BIGINT DEFAULT NULL COMMENT '接口id',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`template_id`),
  KEY `idx_template_api_id` (`api_id`),
  CONSTRAINT `fk_template_api` FOREIGN KEY (`api_id`) REFERENCES `api_info` (`api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接口模板表';

-- ----------------------------
-- 5. 参数实例表
-- ----------------------------
DROP TABLE IF EXISTS `api_instance`;
CREATE TABLE `api_instance` (
  `instance_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `instance_name` VARCHAR(50) DEFAULT NULL COMMENT '接口实例名称',
  `description` TEXT COMMENT '描述',
  `api_id` BIGINT DEFAULT NULL COMMENT '接口id',
  `instance_json` TEXT COMMENT '实例JSON',
  `exec_count` INT DEFAULT 0 COMMENT '执行次数',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `expect_result` TEXT COMMENT '期望结果',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`instance_id`),
  KEY `idx_instance_api_id` (`api_id`),
  CONSTRAINT `fk_instance_api` FOREIGN KEY (`api_id`) REFERENCES `api_info` (`api_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='参数实例表';

-- ----------------------------
-- 6. 页面管理表
-- ----------------------------
DROP TABLE IF EXISTS `page_info`;
CREATE TABLE `page_info` (
  `page_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `page_name` VARCHAR(50) DEFAULT NULL COMMENT '页面名称',
  `description` TEXT COMMENT '描述',
  `project_id` BIGINT DEFAULT NULL COMMENT '项目id',
  `page_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL',
  `file_name` VARCHAR(50) DEFAULT NULL COMMENT '功能代码文件名称',
  `real_file_name` VARCHAR(100) DEFAULT NULL COMMENT '功能代码文件名称',
  `token_id` BIGINT DEFAULT NULL COMMENT 'tokenId',
  `function` TEXT COMMENT '功能',
  `status` SMALLINT DEFAULT 1 COMMENT '状态',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`page_id`),
  KEY `idx_page_project_id` (`project_id`),
  KEY `idx_page_token_id` (`token_id`),
  CONSTRAINT `fk_page_project` FOREIGN KEY (`project_id`) REFERENCES `project_info` (`project_id`),
  CONSTRAINT `fk_page_token` FOREIGN KEY (`token_id`) REFERENCES `token_info` (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面管理表';

-- ----------------------------
-- 7. 元素模板表
-- ----------------------------
DROP TABLE IF EXISTS `element_template`;
CREATE TABLE `element_template` (
  `element_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `element_name` VARCHAR(50) DEFAULT NULL COMMENT '元素名称',
  `page_id` BIGINT DEFAULT NULL COMMENT '页面id',
  `locator_type` SMALLINT DEFAULT NULL COMMENT '定位器',
  `element_value` TEXT COMMENT '元素',
  `element_type` SMALLINT DEFAULT NULL COMMENT '类型',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `operation` SMALLINT DEFAULT NULL COMMENT '操作',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`element_id`),
  KEY `idx_element_page_id` (`page_id`),
  CONSTRAINT `fk_element_page` FOREIGN KEY (`page_id`) REFERENCES `page_info` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='元素模板表';

-- ----------------------------
-- 8. 页面实例表
-- ----------------------------
DROP TABLE IF EXISTS `page_instance`;
CREATE TABLE `page_instance` (
  `page_instance_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `page_id` BIGINT DEFAULT NULL COMMENT '页面id',
  `operation_json` TEXT COMMENT '操作JSON',
  `instance_name` VARCHAR(50) DEFAULT NULL COMMENT '页面实例名称',
  `description` TEXT COMMENT '描述',
  `expect_result` TEXT COMMENT '预期结果',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`page_instance_id`),
  KEY `idx_page_inst_page_id` (`page_id`),
  CONSTRAINT `fk_page_inst_page` FOREIGN KEY (`page_id`) REFERENCES `page_info` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面实例表';

-- ----------------------------
-- 9. 流程信息表
-- ----------------------------
DROP TABLE IF EXISTS `flow_info`;
CREATE TABLE `flow_info` (
  `flow_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `flow_name` VARCHAR(50) DEFAULT NULL COMMENT '流程名称',
  `description` TEXT COMMENT '描述',
  `project_id` BIGINT DEFAULT NULL COMMENT '项目id',
  `expect_result` TEXT COMMENT '预期结果',
  `actual_result` TEXT COMMENT '实际结果',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`flow_id`),
  KEY `idx_flow_project_id` (`project_id`),
  CONSTRAINT `fk_flow_project` FOREIGN KEY (`project_id`) REFERENCES `project_info` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程信息表';

-- ----------------------------
-- 10. 流程步骤表
-- ----------------------------
DROP TABLE IF EXISTS `flow_step`;
CREATE TABLE `flow_step` (
  `step_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `api_id` BIGINT DEFAULT NULL COMMENT '接口id',
  `instance_id` BIGINT DEFAULT NULL COMMENT '实例id',
  `params` TEXT COMMENT '参数',
  `is_batch` VARCHAR(10) DEFAULT NULL COMMENT '是否批处理',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `expect_result` TEXT COMMENT '预期结果',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`step_id`),
  KEY `idx_step_api_id` (`api_id`),
  KEY `idx_step_instance_id` (`instance_id`),
  CONSTRAINT `fk_step_api` FOREIGN KEY (`api_id`) REFERENCES `api_info` (`api_id`),
  CONSTRAINT `fk_step_instance` FOREIGN KEY (`instance_id`) REFERENCES `api_instance` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程步骤表';

-- ----------------------------
-- 11. 接口结果表 (api_result)
-- ----------------------------
DROP TABLE IF EXISTS `api_result`;
CREATE TABLE `api_result` (
  `result_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '接口结果id',
  `response_info` TEXT COMMENT '返回信息',
  `instance_id` BIGINT DEFAULT NULL COMMENT '接口实例id',
  `result_status` BIGINT DEFAULT NULL COMMENT '结果状态',
  `code` VARCHAR(50) DEFAULT NULL COMMENT 'code',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`result_id`),
  KEY `idx_result_instance_id` (`instance_id`),
  CONSTRAINT `fk_result_instance` FOREIGN KEY (`instance_id`) REFERENCES `api_instance` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='接口结果表';

-- ----------------------------
-- 12. 页面结果表 (page_result)
-- ----------------------------
DROP TABLE IF EXISTS `page_result`;
CREATE TABLE `page_result` (
  `page_result_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '页面结果id',
  `page_instance_id` BIGINT DEFAULT NULL COMMENT '页面实例id',
  `response_info` TEXT COMMENT '返回信息',
  `code` VARCHAR(50) DEFAULT NULL COMMENT 'code',
  `result_status` SMALLINT DEFAULT NULL COMMENT '结果状态',
  `remark` TEXT COMMENT '备注',
  `screenshot_path` TEXT COMMENT '截图路径(JSON数组)',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`page_result_id`),
  KEY `idx_page_result_instance_id` (`page_instance_id`),
  CONSTRAINT `fk_page_result_instance` FOREIGN KEY (`page_instance_id`) REFERENCES `page_instance` (`page_instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面结果表';

-- ----------------------------
-- 13. 流程结果表 (flow_result)
-- ----------------------------
DROP TABLE IF EXISTS `flow_result`;
CREATE TABLE `flow_result` (
  `flow_result_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '流程结果id',
  `flow_id` BIGINT DEFAULT NULL COMMENT '流程id',
  `result_id` BIGINT DEFAULT NULL COMMENT '结果id',
  `expected_result` TEXT COMMENT '预期结果',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`flow_result_id`),
  KEY `idx_flow_result_flow_id` (`flow_id`),
  CONSTRAINT `fk_flow_result_flow` FOREIGN KEY (`flow_id`) REFERENCES `flow_info` (`flow_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程结果表';

-- ----------------------------
-- 14. 用户表 (sys_user)
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `user_id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '用户昵称',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码',
  `dept_id` BIGINT DEFAULT NULL COMMENT '部门id',
  `status` SMALLINT DEFAULT NULL COMMENT '状态',
  `remark` TEXT COMMENT '备注',
  `creator` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `create_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `sys_user` (`nickname`, `username`, `password`, `status`, `creator`, `create_time`, `update_time`) VALUES
('管理员', 'admin', 'admin123', 1, 'admin', NOW(), NOW())，
('测试专员', 'test_user', 'test123', 1, 'admin', NOW(), NOW()),
('审计部管理员', 'audit_admin', 'Audit@2024', 0, 'admin', NOW(), NOW());

INSERT INTO `dict_info` (`dict_name`, `dict_key`, `dict_value`, `type`, `status`, `creator`, `create_time`, `update_time`) VALUES
('通用状态', '1', '正常', 1, 1, 'admin', NOW(), NOW()),
('通用状态', '0', '停用', 1, 1, 'admin', NOW(), NOW()),
('通用状态', '2', '删除', 1, 1, 'admin', NOW(), NOW()),
('是否类型', 'Y', '是', 2, 1, 'admin', NOW(), NOW()),
('是否类型', 'N', '否', 2, 1, 'admin', NOW(), NOW()),
('请求方法', '1', 'GET', 3, 1, 'admin', NOW(), NOW()),
('请求方法', '2', 'POST', 3, 1, 'admin', NOW(), NOW()),
('请求方法', '3', 'PUT', 3, 1, 'admin', NOW(), NOW()),
('请求方法', '4', 'DELETE', 3, 1, 'admin', NOW(), NOW()),
('参数类型', '1', 'Query', 4, 1, 'admin', NOW(), NOW()),
('参数类型', '2', 'Body', 4, 1, 'admin', NOW(), NOW()),
('定位方式', '1', 'ID', 5, 1, 'admin', NOW(), NOW()),
('定位方式', '2', 'Name', 5, 1, 'admin', NOW(), NOW()),
('定位方式', '3', 'XPath', 5, 1, 'admin', NOW(), NOW()),
('定位方式', '4', 'CSS Selector', 5, 1, 'admin', NOW(), NOW());

INSERT INTO `project_info` (`project_name`, `project_address`, `project_port`, `project_env`, `remark`, `status`, `creator`, `create_time`, `update_time`) VALUES
('电商后台管理系统', '192.168.1.100', '8080', '开发环境', '主要用于内部功能开发和联调', 1, 'admin', NOW(), NOW()),
('用户中心微服务', '10.0.0.55', '8081', '测试环境', '包含登录、注册及个人信息管理模块', 1, 'admin', NOW(), NOW()),
('供应链数据中台', '172.16.20.10', '3000', '预发布环境', '对接外部ERP系统的数据同步服务', 1, 'admin', NOW(), NOW()),
('移动端API网关', 'api.example.com', '443', '生产环境', '对外提供HTTPS服务的正式网关', 1, 'admin', NOW(), NOW());
