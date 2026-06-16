"""
Swagger解析Service层
"""
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from utils.swagger_parser import fetch_swagger_json, parse_swagger_to_api_info, parse_swagger_to_templates
from mysql.api_info_sql import create_api_info, get_api_info_by_unique_fields
from mysql.api_template_sql import create_api_template, get_api_template_by_unique_fields, batch_create_api_templates, get_existing_template_fields
from core.responsemsg import success_response, error_response
from core.logger import logger
from utils.data_paser import set_audit_fields_for_create


async def parse_and_save_swagger_service(db: Session, project_id: int, swagger_url: str):
    """解析Swagger并保存到数据库（优化版：内存去重 + 批量插入）"""
    try:
        """1. 获取Swagger JSON"""
        swagger_data = fetch_swagger_json(swagger_url)
        
        """2. 解析为 ApiInfo 数据"""
        api_info_list = parse_swagger_to_api_info(swagger_data, project_id)
        
        if not api_info_list:
            return error_response(msg="未从Swagger文档中解析到任何API信息")
            
        created_api_ids = {}
        """用于存储 "METHOD URL" -> api_id 的映射"""
        saved_count = 0
        new_api_ids = []
        
        """3. 保存 ApiInfo 并获取 ID"""
        for info_data in api_info_list:
            existing = await get_api_info_by_unique_fields(
                db, 
                method_url=info_data['method_url'],
                method_type=info_data['method_type'],
                project_id=project_id
            )
            
            if existing:
                created_api_ids[f"{info_data['method_type']} {info_data['method_url']}"] = existing.api_id
            else:
                info_data = set_audit_fields_for_create(info_data)
                info_data['creator'] = 'Swagger_Import'
                new_obj = await create_api_info(db, info_data)
                created_api_ids[f"{new_obj.method_type} {new_obj.method_url}"] = new_obj.api_id
                new_api_ids.append(new_obj.api_id)
                saved_count += 1
                
        """4. 解析模板数据"""
        template_list = parse_swagger_to_templates(swagger_data, created_api_ids)
        logger.info(f"Total templates parsed: {len(template_list)}")
        
        if not template_list:
            return success_response(msg=f"解析成功，新增 {saved_count} 个接口，无模板字段", data={"api_count": saved_count})

        """5. 内存去重优化"""
        all_involved_api_ids = list(created_api_ids.values())
        existing_keys = await get_existing_template_fields(db, all_involved_api_ids)
        
        final_templates = []
        for temp_data in template_list:
            key = f"{temp_data['api_id']}_{temp_data['field_name']}"
            if key not in existing_keys:
                temp_data = set_audit_fields_for_create(temp_data)
                temp_data['creator'] = 'Swagger_Import'
                final_templates.append(temp_data)
                existing_keys.add(key)
                """防止当前批次内重复"""

        """6. 批量插入（每批 200 条）"""
        batch_size = 200
        total_saved = 0
        for i in range(0, len(final_templates), batch_size):
            batch = final_templates[i:i + batch_size]
            count = await batch_create_api_templates(db, batch)
            total_saved += count
            logger.info(f"Batch insert: {count} templates saved.")            
        """return success_response("""
        """msg=f"解析成功，新增 {saved_count} 个接口，{total_saved} 个模板字段","""
        """data={"api_count": saved_count, "template_count": total_saved}"""
        """)"""
        logger.info(f"解析成功，新增 {saved_count} 个接口，{total_saved} 个模板字段")
        
    except Exception as e:
        logger.error(f"Swagger parse error: {str(e)}")
        """return error_response(msg=f"解析失败: {str(e)}")"""
