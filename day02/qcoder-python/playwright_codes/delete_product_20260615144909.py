import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False,slow_mo=500)
    context = browser.new_context(storage_state="D:\\project\\UtilsManager\\day02\\qcoder-python\\playwright_tokens\\admin.json")
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/product/list")
    page.get_by_role("button", name="删除").first.click()
    page.get_by_role("button", name="确定").click()
    page.get_by_role("button", name="删除").nth(1).click()
    page.get_by_role("button", name="确定").click()
    page.close()

    """---------------------"""
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
