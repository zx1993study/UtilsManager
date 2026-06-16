import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/login")
    page.get_by_role("textbox", name="请输入您的账号").dblclick()
    page.get_by_role("textbox", name="请输入您的账号").fill("hongshana1")
    page.get_by_role("textbox", name="请输入您的密码").click()
    page.get_by_role("textbox", name="请输入您的密码").fill("123456")
    page.get_by_role("button", name="登 录").click()
    page.get_by_role("button", name="取消").click()
    page.get_by_text("活动管理").click()
    page.get_by_role("link", name="活动方案").click()
    page.get_by_role("button", name="更多").click()
    page.get_by_text("新增").click()
    page.get_by_role("dialog", name="添加活动").get_by_placeholder("请输入活动名称").dblclick()
    page.get_by_role("dialog", name="添加活动").get_by_placeholder("请输入活动名称").fill("测试2")
    page.get_by_role("dialog", name="添加活动").get_by_placeholder("请选择活动类型").click()
    page.get_by_text("黑酱品鉴会").nth(1).click(force=True)
    # page.get_by_role("textbox", name="可申请开始日期").click()
    page.get_by_role('textbox', name='可申请开始日期').fill('2026-06-01')
    page.get_by_role('textbox', name='可申请结束日期').fill('2025-07-31')
    # page.get_by_text("1", exact=True).nth(1).click()
    # page.get_by_text("30", exact=True).nth(2).click()
    page.get_by_role("textbox", name="不选则全部可申请；可选部门或具体人员").click()
    page.locator(".el-tree-node__expand-icon").click()
    page.locator("div:nth-child(5) > .el-tree-node__content > .el-checkbox > .el-checkbox__input > .el-checkbox__inner").click()
    page.get_by_text("基本信息活动名称活动类型活动周期至可申请范围可申请范围商品与付费活动商品全部商品指定商品范围指定具体商品申请次数每月1次每月2次每月3").click()
    page.get_by_role("textbox", name="请选择商品范围").click()
    page.get_by_text("全部商品").click()
    page.get_by_role("textbox", name="请选择每月可申请次数").click()
    page.locator("div:nth-child(13) > .el-scrollbar > .el-select-dropdown__wrap > .el-scrollbar__view > .el-select-dropdown__item.hover > span").click()
    page.get_by_role("button", name="确 定").click()

    # ---------------------
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)