import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/login")
    page.get_by_role("textbox", name="请输入您的账号").dblclick()
    page.get_by_role("textbox", name="请输入您的账号").fill("admin")
    page.get_by_role("textbox", name="请输入您的密码").click()
    page.get_by_role("textbox", name="请输入您的密码").fill("admin123")
    page.get_by_role("button", name="登 录").click()
    page.close()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
