# locustfile.py

from locust import HttpUser, task, between
import json

class MyWebsiteUser(HttpUser):
    # 定义用户在任务之间等待的时间（秒），这里设置为 1 到 5 秒之间的随机值
    wait_time = between(1, 5)
    
    def on_start(self):
        """
        这个方法在每个用户开始执行任务前运行一次。
        我们在这里进行登录操作。
        """
        login_url = "/dev-api/login" # 替换为你的实际登录接口路径
        login_payload = {
            "username": "admin", # 替换为你的用户名
            "password": "admin123" , # 替换为你的密码
            "source": "web"
        }
        
        # 发送登录请求
        response = self.client.post(login_url, data=login_payload, headers={
                'Content-Type': 'application/x-www-form-urlencoded'
            })

        if response.status_code == 200:
            try:
                # 假设登录成功后返回的 JSON 中包含 'access_token' 字段
                result = response.json()
                # --- 关键：将 token 保存到用户实例 ---
                self.token = result['token']
                
                print(f"User logged in successfully. Token acquired.")
            except KeyError:
                # 如果没有找到 access_token 字段，抛出异常或记录错误
                print("Login response did not contain 'access_token'.")
                self.token = None # 或者可以在这里直接 raise 异常终止用户
            except json.JSONDecodeError:
                # 如果响应不是 JSON 格式
                print("Login response was not valid JSON.")
                self.token = None
        else:
            print(f"Login failed for user. Status code: {response.status_code}, Response: {response.text}")
            self.token = None # 登录失败，token 设为 None

    @task
    def load_homepage(self):
        # 定义一个任务：访问网站主页
        self.client.get("/")

    @task
    def load_api_data(self):
        # 定义另一个任务：访问一个 API 端点
        self.client.get("/dev-api/business/customer/list?pageNum=1&pageSize=10&customerType=1", headers={"Authorization": f"Bearer {self.token}"})
        print("Accessed API endpoint with token.")
