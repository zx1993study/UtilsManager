"""
Swagger解析工具
用于解析OpenAPI/Swagger文档并转换为系统数据
"""
from calendar import c

import requests
import json
from typing import Dict, Any, List


def fetch_swagger_json(swagger_url: str) -> Dict[str, Any]:
    """获取Swagger JSON文档"""
    try:
        response = requests.get(swagger_url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"获取Swagger文档失败: {str(e)}")


def parse_swagger_to_api_info(swagger_data: Dict[str, Any], project_id: int) -> List[Dict[str, Any]]:
    """
    解析Swagger数据为ApiInfo列表
    """
    api_infos = []
    paths = swagger_data.get('paths', {})
    
    # 方法类型映射
    method_map = {
        'get': 1,
        'post': 2,
        'put': 3,
        'delete': 4,
        'patch': 5
    }

    for path, methods in paths.items():
        for method_name, details in methods.items():
            if method_name not in method_map:
                continue
                
            summary = details.get('summary', details.get('description', ''))
            api_name = summary[:50] if summary else f"{method_name.upper()} {path}"
            
            # 判断参数位置和内容类型
            p_in = "in" # 默认为查询参数
            header_content_type = "application/json"
            
            body = details.get('requestBody')
            if body:
                p_in = "body"
                content = body.get('content', {})
                if content:
                    # 获取第一个 media type (如 application/json)
                    header_content_type = list(content.keys())[0]
            elif details.get('parameters'):
                # 如果有 parameters，检查是否有 form-data 或 x-www-form-urlencoded
                # 这里简化处理，默认保持 in，实际可根据 param.in 细化
                pass

            api_info = {
                "api_name": api_name,
                "method_type": method_map[method_name],
                "method_url": path,
                "project_id": project_id,
                "description": details.get('description', ''),
                "params_path": p_in,
                "request_header": f"{{\"Content-Type\": \"{header_content_type}\"}}"
            }
            api_infos.append(api_info)
            
    return api_infos


def _resolve_ref(schema: Dict[str, Any], definitions: Dict[str, Any]) -> Dict[str, Any]:
    """解析 Schema 引用，返回实际的 Schema 字典"""
    if not schema:
        return {}
    if '$ref' in schema:
        ref_name = schema['$ref'].split('/')[-1]
        return definitions.get(ref_name, {})
    return schema


def _resolve_type(schema: Dict[str, Any], definitions: Dict[str, Any]) -> str:
    """递归解析 Schema 中的类型，兼容 anyOf, allOf, $ref 等复杂结构"""
    if not schema:
        return 'string'
    
    # 1. 处理 $ref
    if '$ref' in schema:
        ref_name = schema['$ref'].split('/')[-1]
        ref_schema = definitions.get(ref_name, {})
        return _resolve_type(ref_schema, definitions)
    
    # 2. 处理 type
    if 'type' in schema:
        return schema['type']
    
    # 3. 处理 anyOf / allOf (取第一个非 null 的类型)
    for key in ['anyOf', 'allOf', 'oneOf']:
        if key in schema:
            for sub_schema in schema[key]:
                t = _resolve_type(sub_schema, definitions)
                if t != 'null':
                    return t
            return 'string' # 默认返回 string
            
    return 'object'


def parse_swagger_to_templates(swagger_data: Dict[str, Any], api_id_mapping: Dict[str, int]) -> List[Dict[str, Any]]:
    """
    解析Swagger数据为ApiTemplate列表
    api_id_mapping: { "METHOD URL": api_id }
    """
    templates = []
    paths = swagger_data.get('paths', {})
    # 兼容 OpenAPI 2.0 (definitions) 和 3.0 (components/schemas)
    components = swagger_data.get('components', {})
    definitions = swagger_data.get('definitions', components.get('schemas', {}))

    # 类型映射
    type_map = {
        'string': 1,
        'integer': 2,
        'number': 3,
        'boolean': 4,
        'array': 5,
        'object': 6
    }

    # 方法类型映射
    method_map = {
        'get': 1,
        'post': 2,
        'put': 3,
        'delete': 4,
        'patch': 5
    }

    for path, methods in paths.items():
        for method_name, details in methods.items():
            key = f"{method_map.get(method_name, 1)} {path}"
            api_id = api_id_mapping.get(key)
            if not api_id:
                continue

            # 解析请求参数 (parameters)
            parameters = details.get('parameters', [])
            for param in parameters:
                p_name = param.get('name', '')
                
                # 使用新的解析函数获取类型
                schema = param.get('schema', {})
                p_type = _resolve_type(schema, definitions)
                p_in = param.get('in', 'query')
                template = {
                    "field_name": f"{p_name}",
                    "field_type": type_map.get(p_type, 1),
                    "is_required": "Y" if param.get('required', False) else "N",
                    "api_id": api_id,
                    "remark": param.get('description', '') or f"参数位置: {p_in}"
                }
                templates.append(template)

            # 解析请求体 (requestBody - OpenAPI 3.0)
            request_body = details.get('requestBody', {})
            if request_body:
                content = request_body.get('content', {})
                for media_type, media_obj in content.items():
                    schema = media_obj.get('schema', {})
                    # 解析顶层 schema
                    resolved_schema = _resolve_ref(schema, definitions)
                    
                    if resolved_schema.get('type') == 'object' and resolved_schema.get('properties'):
                        required_fields = resolved_schema.get('required', [])
                        for field_name, prop in resolved_schema['properties'].items():
                            # 递归解析属性类型
                            prop_type = _resolve_type(prop, definitions)
                            template = {
                                "field_name": field_name,
                                "field_type": type_map.get(prop_type, 1),
                                "is_required": "Y" if field_name in required_fields else "N",
                                "api_id": api_id,
                                "remark": prop.get('description', '')
                            }
                            templates.append(template)

    return templates
