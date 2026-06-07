
import requests

url = " https://test.waiqin.yios.cn/dev-api/business/activity/list"
# params = {'username': 'hongshana1', 'password': '123456', 'source': 'web'}
# jsonata=None
# params=None
params = {"pageNum":1,"pageSize":10}
headers={'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMSIsInVzZXJfbmFtZSI6ImFkbWluIiwiZGVwdF9uYW1lIjoiXHU2YjY2XHU2NjBjXHU1MzNhXHU1NDJmXHU1MTQ5XHU1NTQ2XHU4ZDM4XHU2NzA5XHU5NjUwXHU1MTZjXHU1M2Y4Iiwic2Vzc2lvbl9pZCI6IjI3NTdhOWI5LWRmMjgtNDFlYi1iMDE1LTFmZjRkOGZmYTU5ZiIsImxvZ2luX2luZm8iOnsiaXBhZGRyIjoiMjcuMTguMTYxLjIwMyIsImxvZ2luTG9jYXRpb24iOiJcdTY3MmFcdTc3ZTUiLCJicm93c2VyIjoiQ2hyb21lIDE0NCIsIm9zIjoiV2luZG93cyAxMCIsImxvZ2luVGltZSI6IjIwMjYtMDYtMDYgMTI6MTI6MDgifSwic291cmNlIjoid2ViIiwiZXhwIjoxNzgzMzExMTI5fQ.JW19upxVkn02b1UOYZGRX6S-avM-EVKwqV2gmndpugg'}
# response = request("POST", url, headers=headers, data=data, timeout=10)
response = requests.request("GET", url, headers=headers, timeout=10,params=params)
response.encoding = 'utf-8'
print(response.text)
print(response.content)
# 2026-06-03 14:45:34 - zx_api - INFO - S
# ending POST request to https://test.waiqin.yios.cn/login:
#  with https://test.waiqin.yios.cn/getInfo: with headers={'Content-Type': 'application/json', 'Authorization': 'Bearer Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjE4IiwidXNlcl9uYW1lIjoiaG9uZ3NoYW5hMSIsImRlcHRfbmFtZSI6Ilx1NmQ0Ylx1OGJkNVx1OTBlOFx1NmQyYVx1NWM3MUEiLCJzZXNzaW9uX2lkIjoiN2E5ZTM5NDctZWRjMi00MmE4LWI4NDQtMTU0NjNiYmRlNmMwIiwibG9naW5faW5mbyI6eyJpcGFkZHIiOiI1OS4xNzMuMTg1LjI0NiIsImxvZ2luTG9jYXRpb24iOiJcdTY3MmFcdTc3ZTUiLCJicm93c2VyIjoiQ2hyb21lIDEzMCIsIm9zIjoiV2luZG93cyAxMCIsImxvZ2luVGltZSI6IjIwMjYtMDYtMDMgMTU6MTY6MjAifSwic291cmNlIjoid2ViIiwiZXhwIjoxNzgzMDYyOTgwfQ.G-wJWzlYgoXcG9aOV3AhBjEv5K3Mwvnu6EwE35YU5rk'}, params={}, data=None, json=None
# headers={'Content-Type': 'application/x-www-form-urlencoded'}, 
# params=None,
#  data={'username': 'hongshana1', 'password': '123456', 'source': 'web'}, 
# json=None  
