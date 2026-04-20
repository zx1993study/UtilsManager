
"""
测试执行服务
"""
import asyncio
import json
import time
from typing import Dict, List, Any, Optional
from playwright.async_api import async_playwright, Page, Browser
import requests
from models import get_db
from models.api_result import ApiResult
from models.page_result import PageResult
from models.flow_result import FlowResult
from logger_config import logger
from config import Config

class TestExecutorService:
    """测试执行服务类"""

    def __init__(self):
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context = None

    async def init_browser(self):
        """初始化浏览器"""
        if not self.playwright:
            self.playwright = await async_playwright().start()

        if not self.browser:
            self.browser = await self.playwright.chromium.launch(
                headless=Config.PLAYWRIGHT_HEADLESS
            )
            self.context = await self.browser.new_context()

    async def close_browser(self):
        """关闭浏览器"""
        if self.context:
            await self.context.close()
            self.context = None

        if self.browser:
            await self.browser.close()
            self.browser = None

        if self.playwright:
            await self.playwright.stop()
            self.playwright = None

    async def execute_api_test(self, api_data: Dict[str, Any], instance_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行API测试"""
        try:
            url = api_data.get('method_url', '')
            method = api_data.get('method_type', 'GET').upper()
            headers = json.loads(api_data.get('request_header', '{}'))
            params = json.loads(instance_data.get('instance_json', '{}'))

            # 添加Token
            token_id = api_data.get('token_id')
            if token_id:
                # TODO: 从数据库获取Token并添加到请求头
                pass

            # 执行请求
            start_time = time.time()
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, headers=headers, json=params)
            elif method == 'PUT':
                response = requests.put(url, headers=headers, json=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, json=params)
            else:
                raise ValueError(f'不支持的HTTP方法: {method}')

            duration = time.time() - start_time

            # 保存测试结果
            result_data = {
                'instance_id': str(instance_data.get('instance_id')),
                'return_info': response.text,
                'result_status': 'success' if response.status_code == 200 else 'failed',
                'code': str(response.status_code),
                'remark': f'耗时: {duration:.2f}s'
            }

            db = next(get_db())
            result = ApiResult(**result_data)
            db.add(result)
            db.commit()
            db.refresh(result)

            return result.to_dict()

        except Exception as e:
            logger.error(f'执行API测试失败: {str(e)}')
            raise

    async def execute_page_test(self, page_data: Dict[str, Any], instance_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行页面测试"""
        try:
            await self.init_browser()

            page: Page = await self.context.new_page()

            # 导航到页面
            url = page_data.get('url', '')
            await page.goto(url, timeout=Config.PLAYWRIGHT_TIMEOUT)

            # 执行页面操作
            actions = json.loads(instance_data.get('action_json', '[]'))
            for action in actions:
                await self._execute_page_action(page, action)

            # 等待页面加载完成
            await page.wait_for_load_state('networkidle')

            # 截图
            screenshot_path = f'screenshots/page_{int(time.time())}.png'
            os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
            await page.screenshot(path=screenshot_path)

            # 验证预期结果
            expect_result = instance_data.get('expect_result', '')
            actual_result = await page.evaluate('() => document.body.innerText')

            # 保存测试结果
            result_data = {
                'page_instance_id': str(instance_data.get('page_instance_id')),
                'return_info': actual_result[:1000],  # 限制返回信息长度
                'result_status': 'success' if expect_result in actual_result else 'failed',
                'code': '200',
                'screenshot_path': screenshot_path,
                'remark': f'页面测试完成'
            }

            db = next(get_db())
            result = PageResult(**result_data)
            db.add(result)
            db.commit()
            db.refresh(result)

            await page.close()

            return result.to_dict()

        except Exception as e:
            logger.error(f'执行页面测试失败: {str(e)}')
            raise

    async def _execute_page_action(self, page: Page, action: Dict[str, Any]):
        """执行页面操作"""
        action_type = action.get('type')
        locator = action.get('locator')
        value = action.get('value')

        if action_type == 'click':
            await page.click(locator)
        elif action_type == 'fill':
            await page.fill(locator, value)
        elif action_type == 'select':
            await page.select_option(locator, value)
        elif action_type == 'wait':
            await page.wait_for_timeout(int(value) * 1000)
        elif action_type == 'navigate':
            await page.goto(value)
        else:
            logger.warning(f'未知的操作类型: {action_type}')

    async def execute_flow_test(self, flow_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行流程测试"""
        try:
            db = next(get_db())

            # 获取流程步骤
            from models.flow_step import FlowStep
            steps = db.query(FlowStep).filter(
                FlowStep.api_id == str(flow_data.get('flow_id'))
            ).all()

            results = []
            all_success = True

            for step in steps:
                try:
                    # 执行每个步骤
                    step_result = await self.execute_api_test(
                        {'method_url': step.param, 'method_type': 'POST'},
                        {'instance_id': step.instance_id}
                    )
                    results.append(step_result)

                    if step_result.get('result_status') != 'success':
                        all_success = False
                        break

                except Exception as e:
                    logger.error(f'执行流程步骤失败: {str(e)}')
                    all_success = False
                    break

            # 保存流程测试结果
            result_data = {
                'flow_id': str(flow_data.get('flow_id')),
                'result_id': json.dumps([r.get('id') for r in results]),
                'expect_result': flow_data.get('expect_result', ''),
                'status': 'success' if all_success else 'failed',
                'remark': f'共执行 {len(results)} 个步骤'
            }

            result = FlowResult(**result_data)
            db.add(result)
            db.commit()
            db.refresh(result)

            return result.to_dict()

        except Exception as e:
            logger.error(f'执行流程测试失败: {str(e)}')
            raise

# 创建全局测试执行服务实例
test_executor_service = TestExecutorService()
