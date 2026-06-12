import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/login?redirect=%2Findex")
    page.get_by_role("textbox", name="请输入您的账号").dblclick()
    page.get_by_role("textbox", name="请输入您的账号").fill("admin")
    page.get_by_role("textbox", name="请输入您的密码").click()
    page.get_by_role("textbox", name="请输入您的密码").fill("admin123")
    page.get_by_role("button", name="登 录").click()
    page.get_by_text("活动管理").dblclick()
    page.get_by_text("活动管理").click()
    page.get_by_role("link", name="活动方案").click()
    page.get_by_role("button", name="更多 ").click()
    page.get_by_text("新增").click()
    page.get_by_role("dialog", name="添加活动").get_by_placeholder("请输入活动名称").fill("测试3")
    page.get_by_role("dialog", name="添加活动").get_by_placeholder("请选择活动类型").click()
    page.get_by_role("listitem").filter(has_text="大九湖品鉴会").dblclick()
    page.get_by_role("textbox", name="可申请开始日期").fill("2024-07-01")
    page.get_by_role("textbox", name="可申请结束日期").fill("2024-07-31")
    page.wait_for_timeout(30000)
    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
