import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False, slow_mo=500)
    context = browser.new_context(storage_state="D:\\project\\UtilsManager\\day02\\qcoder-python\\playwright_tokens\\admin.json")
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/warehouse/purchase-in-order")
    page.get_by_role("button", name="更多").click()
    page.get_by_text("新增").click()
    page.get_by_role("dialog", name="添加采购入库单").get_by_placeholder("请选择仓库").click()
    page.get_by_role("listitem").filter(has_text="硚口总仓").click()
    page.get_by_role("button", name="添加商品").click()
    page.locator("td > .cell > .el-checkbox > .el-checkbox__input > .el-checkbox__inner").first.click()
    page.locator("tr:nth-child(2) > .el-table_2_column_8 > .cell > .el-checkbox").click()
    page.get_by_role("button", name="确定选择").click()
    page.get_by_role("spinbutton").nth(1).click()
    page.get_by_role("spinbutton").nth(1).fill("100")
    page.get_by_role("spinbutton").nth(2).click()
    page.get_by_role("spinbutton").nth(2).fill("200")
    page.get_by_role("button", name="确认提交").click()
    page.get_by_role("button", name="详情").first.click()
    page.get_by_role("button", name="Close").click()
    page.close()

    """---------------------"""
    context.close()
    browser.close()


with sync_playwright() as playwright:
    run(playwright)
