import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/login?redirect=%2Findex")
    page.get_by_role("textbox", name="请输入您的账号").click()
    page.get_by_role("textbox", name="请输入您的账号").fill("admin")
    page.get_by_role("textbox", name="请输入您的密码").dblclick()
    page.get_by_role("textbox", name="请输入您的密码").fill("admin123")
    page.get_by_role("button", name="登 录").click()
    page.locator("div").filter(has_text=re.compile(r"^客户管理$")).click()
    page.get_by_role("link", name="前端").click()
    page.get_by_role("button", name="更多").click()
    page.get_by_text("新增").click()
    page.get_by_role("dialog", name="添加终端客户").get_by_placeholder("请输入客户名称").click()
    page.get_by_role("dialog", name="添加终端客户").get_by_placeholder("请输入客户名称").fill("pw客户1")
    page.locator(".el-select__input").click()
    page.get_by_role("listitem").filter(has_text=re.compile(r"^洪山a1$")).click()
    page.get_by_role("dialog", name="添加终端客户").get_by_placeholder("请选择合作状态").click()
    page.get_by_role("listitem").filter(has_text="正在合作").click()
    page.wait_for_timeout(3000)
    page.get_by_role("button", name="确 定").click()

    """---------------------"""
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
