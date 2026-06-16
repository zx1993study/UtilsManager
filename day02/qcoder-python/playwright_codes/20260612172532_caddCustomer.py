import re
from typing import List
from playwright.sync_api import Playwright, sync_playwright, expect


def run(playwright: Playwright) -> List[str]:
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context(storage_state="D:\\project\\UtilsManager\\day02\\qcoder-python\\playwright_tokens\\admin.json")
    page = context.new_page()
    page.goto("https://test.waiqin.yios.cn/customer/business?customerType=1")
    page.get_by_role("button", name="更多").click()
    page.get_by_text("新增").click()
    page.get_by_role("dialog", name="添加终端客户").get_by_placeholder("请输入客户名称").fill("pw2")
    page.get_by_role("textbox", name="请输入客户手机号").fill("123")
    page.get_by_role("dialog", name="添加终端客户").get_by_placeholder("请选择终端类型").click()
    page.get_by_role("listitem").filter(has_text="零售").click()
    page.get_by_role("listitem").filter(has_text="餐饮").click()
    page.get_by_role("listitem").filter(has_text="异业").click()
    page.get_by_role("textbox", name="请输入客户手机号").click()
    page.get_by_role("textbox", name="请输入客户手机号").fill("17288888888")
    page.get_by_role("dialog", name="添加终端客户").get_by_placeholder("请选择产品类型").click()
    page.get_by_role("listitem").filter(has_text="巴马水").click()
    page.get_by_role("listitem").filter(has_text="神农架酒").click()
    page.get_by_role("textbox", name="请选择客户级别").click()
    page.get_by_role("listitem").filter(has_text="暂无").click()
    page.get_by_role("textbox", name="请选择销售区域").click()
    page.get_by_role("listitem").filter(has_text="暂无").click()
    page.get_by_label("添加终端客户").get_by_text("合作状态", exact=True).dblclick()
    page.get_by_role("textbox", name="请选择终端标签").click()
    page.get_by_role("listitem").filter(has_text="A类").click()
    page.get_by_role("listitem").filter(has_text="B类").click()
    page.get_by_role("listitem").filter(has_text="C类").click()
    page.get_by_role("listitem").filter(has_text="常规零售").click()
    page.get_by_role("listitem").filter(has_text="常规餐饮").click()
    page.get_by_role("listitem").filter(has_text="D类").click()
    page.get_by_role("listitem").filter(has_text="零售样板店").click()
    page.get_by_role("listitem").filter(has_text="餐饮专场").click()
    page.get_by_role("listitem").filter(has_text="常规异业").click()
    page.get_by_role("listitem").filter(has_text="核心异业").click()
    page.locator("div").filter(has_text=re.compile(r"^A类\+ 9$")).nth(2).click()
    page.get_by_role("dialog", name="添加终端客户").get_by_placeholder("请选择合作状态").click()
    page.locator("span").filter(has_text=re.compile(r"^正在合作$")).nth(1).click()
    page.get_by_role("listitem").filter(has_text="终止合作").click()
    page.get_by_role("listitem").filter(has_text="空白网点").click()
    page.get_by_role("listitem").filter(has_text="终止合作").click()
    page.locator(".el-select__input").click()
    page.get_by_role("listitem").filter(has_text=re.compile(r"^洪山$")).click()
    page.get_by_role("listitem").filter(has_text=re.compile(r"^洪山a1$")).click()
    page.get_by_role("listitem").filter(has_text="洪山a3").click()
    page.get_by_role("listitem").filter(has_text="洪山a2").click()
    page.locator(".el-select__input").click()
    page.get_by_role("textbox", name="请选择拜访频率").click()
    page.get_by_role("listitem").filter(has_text="暂无").click()
    files = ["D:\\project\\UtilsManager\\day02\\qcoder-python\\playwright_screenshots\\caddCustomer1.png", "D:\\project\\UtilsManager\\day02\\qcoder-python\\playwright_screenshots\\caddCustomer2.png"]
    page.screenshot(path=files[0],full_page=True)
    page.get_by_role("button", name="确 定").click()
    page.screenshot(path=files[1],full_page=True)

    """---------------------"""
    context.close()
    browser.close()
    return files


with sync_playwright() as playwright:
    run(playwright)
