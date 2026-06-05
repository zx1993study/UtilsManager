
import requests

url = "https://test.waiqin.yios.cn/dev-api/getInfo"
# params = {'username': 'hongshana1', 'password': '123456', 'source': 'web'}
# jsonata=None
# params=None
headers={'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjE4IiwidXNlcl9uYW1lIjoiaG9uZ3NoYW5hMSIsImRlcHRfbmFtZSI6Ilx1NmQ0Ylx1OGJkNVx1OTBlOFx1NmQyYVx1NWM3MUEiLCJzZXNzaW9uX2lkIjoiN2E5ZTM5NDctZWRjMi00MmE4LWI4NDQtMTU0NjNiYmRlNmMwIiwibG9naW5faW5mbyI6eyJpcGFkZHIiOiI1OS4xNzMuMTg1LjI0NiIsImxvZ2luTG9jYXRpb24iOiJcdTY3MmFcdTc3ZTUiLCJicm93c2VyIjoiQ2hyb21lIDEzMCIsIm9zIjoiV2luZG93cyAxMCIsImxvZ2luVGltZSI6IjIwMjYtMDYtMDMgMTU6MTY6MjAifSwic291cmNlIjoid2ViIiwiZXhwIjoxNzgzMDYyOTgwfQ.G-wJWzlYgoXcG9aOV3AhBjEv5K3Mwvnu6EwE35YU5rk'}# response = request("POST", url, headers=headers, data=data, timeout=10)
response = requests.request("GET", url, headers=headers, timeout=10,params={},json=None,data=None)
print(response.text)
# 2026-06-03 14:45:34 - zx_api - INFO - S
# ending POST request to https://test.waiqin.yios.cn/login:
#  with https://test.waiqin.yios.cn/getInfo: with headers={'Content-Type': 'application/json', 'Authorization': 'Bearer Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjE4IiwidXNlcl9uYW1lIjoiaG9uZ3NoYW5hMSIsImRlcHRfbmFtZSI6Ilx1NmQ0Ylx1OGJkNVx1OTBlOFx1NmQyYVx1NWM3MUEiLCJzZXNzaW9uX2lkIjoiN2E5ZTM5NDctZWRjMi00MmE4LWI4NDQtMTU0NjNiYmRlNmMwIiwibG9naW5faW5mbyI6eyJpcGFkZHIiOiI1OS4xNzMuMTg1LjI0NiIsImxvZ2luTG9jYXRpb24iOiJcdTY3MmFcdTc3ZTUiLCJicm93c2VyIjoiQ2hyb21lIDEzMCIsIm9zIjoiV2luZG93cyAxMCIsImxvZ2luVGltZSI6IjIwMjYtMDYtMDMgMTU6MTY6MjAifSwic291cmNlIjoid2ViIiwiZXhwIjoxNzgzMDYyOTgwfQ.G-wJWzlYgoXcG9aOV3AhBjEv5K3Mwvnu6EwE35YU5rk'}, params={}, data=None, json=None
# headers={'Content-Type': 'application/x-www-form-urlencoded'}, 
# params=None,
#  data={'username': 'hongshana1', 'password': '123456', 'source': 'web'}, 
# json=None  
