import os
import re
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> None:
    browser = playwright.chromium.launch(headless=False,slow_mo=500)
    context = browser.new_context(storage_state=os.path.join(os.environ.get('PLAYWRIGHT_TOKEN_PATH', './playwright_tokens'), 'admin.json'))
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/product/list")
    page.get_by_role("button", name="更多").click()
    page.get_by_text("新增").click()
    page.get_by_role("textbox", name="请输入商品名称", exact=True).click()
    page.get_by_role("textbox", name="请输入商品名称", exact=True).fill("测试1")
    page.get_by_role("textbox", name="请选择商品容量").click()
    page.get_by_role("listitem").filter(has_text=re.compile(r"^500ML$")).click()
    page.get_by_role("textbox", name="请选择装箱规格").click()
    page.get_by_role("listitem").filter(has_text="*24").click()
    page.get_by_role("dialog", name="添加商品").get_by_placeholder("请选择商品品牌").click()
    page.get_by_role("listitem").filter(has_text="黑酱").click()
    page.get_by_role("textbox", name="请选择单位").click()
    page.get_by_role("listitem").filter(has_text="瓶").click()
    page.get_by_role("spinbutton", name="请输入采购价").fill("20")
    page.get_by_role("spinbutton", name="请输入直营商批发价").click()
    page.get_by_role("spinbutton", name="请输入直营商批发价").fill("60")
    page.get_by_role("spinbutton", name="请输入终端批发价").click()
    page.get_by_role("spinbutton", name="请输入终端批发价").fill("100")
    page.get_by_role("spinbutton", name="请输入团购价格").click()
    page.get_by_role("spinbutton", name="请输入团购价格").fill("80")
    page.locator(".el-upload input[type='file']").set_input_files(r"C:\Users\26713\Pictures\7tian2.jpg")
    page.get_by_role("radio", name="停用").click()
    page.get_by_role("radio", name="正常").click()
    page.get_by_role("textbox", name="请输入备注").click()
    page.get_by_role("textbox", name="请输入备注").fill("123")
    page.get_by_role("button", name="确 定").click()
    """page.set_default_timeout(5000)"""
    page.close()

    """---------------------"""
    context.close()
    browser.close()


if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)