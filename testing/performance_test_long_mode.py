from locust import SequentialTaskSet, HttpUser, constant, task # locust 2.26.0
import json, logging


class LongSummarizer(SequentialTaskSet):

    @task
    def login(self):
        data ={
            'username':'nguyenphamkien15@gmail.com',
            'password':'123',
            'withCredentials':'true'
        }
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '1118',
            'Content-Type': 'application/json',
            'Cookie': 'session=qW7Gqkdq9t4A3sz6zS94_ptTNKf8azc5Tp5bjh9NW8c',
            'Host': '127.0.0.1:5000', # replace this with hosted backend server
            'Origin': 'https://vietnamese-text-summarizer.onrender.com',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }   
        with self.client.post("/login", data=json.dumps(data), headers=headers, catch_response=True) as response:
            if response.status_code == 403 or response.status_code == 200: # 403 is when reditected to home but denied because cannot access to session.. idk why it cannnot access to session at /home api
                response.success()
                logging.error("Login successfully!")
            else:
                logging.error("Failed to log in. Status code: %d" % response.status_code)
    
    @task
    def home(self):
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '1118',
            'Content-Type': 'application/json',
            'Cookie': 'session=qW7Gqkdq9t4A3sz6zS94_ptTNKf8azc5Tp5bjh9NW8c',
            'Host': '127.0.0.1:5000', # replace this with hosted backend server
            'Origin': 'https://vietnamese-text-summarizer.onrender.com',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
        response = self.client.get("/home", headers=headers)    

        if response.status_code == 200: 
            logging.info("At home")
        else:
            logging.error("Failed access home. Status code: %d" % response.status_code)

    @task
    def summarize_long_mode(self):
        data ={
            'input-text': 'Tổng giám đốc Apple Tim Cook đã có mặt tại Hà Nội rạng sáng nay, dự kiến gặp gỡ một số nhà sáng tạo nội dung và lập trình viên Việt.Không có nơi nào như Việt Nam, một đất nước sôi động và xinh đẹp. Tôi vô cùng hào hứng khi được tới đây kết nối với sinh viên, nhà sáng tạo và khách hàng, hiểu hơn về sự đa dạng trong cách họ sử dụng sản phẩm của chúng tôi để làm nên những điều phi thường, Tim Cook chia sẻ ngay khi vừa đến Hà Nội. Trong chuyến thăm lần này của CEO, Apple cũng thông báo tăng cường cam kết với Việt Nam. Công ty cho biết sẽ nâng các khoản chi cho nhà cung cấp, cùng với tiến triển mới trong sáng kiến hỗ trợ nước sạch cho trường học địa phương. Apple đã chi gần 400 nghìn tỷ đồng kể từ năm 2019 thông qua chuỗi cung ứng địa phương và đã tăng hơn gấp đôi mức chi hàng năm cho Việt Nam trong cùng kỳ.',
            'sentences': 6,
            'withCredentials':'true'
        }
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '1118',
            'Content-Type': 'application/json',
            'Cookie': 'session=qW7Gqkdq9t4A3sz6zS94_ptTNKf8azc5Tp5bjh9NW8c',
            'Host': '127.0.0.1:5000', # replace this with hosted backend server
            'Origin': 'https://vietnamese-text-summarizer.onrender.com',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
        response = self.client.post("/summarize-long", data=json.dumps(data), headers=headers)  
        if response.status_code == 200:
            logging.info("Summarized long mode successfully!")
        else:
            logging.error("Failed to summarize long mode. Status code: %d" % response.status_code)  

class MyLoadTest(HttpUser):
    host = "http://127.0.0.1:5000"
    tasks = [LongSummarizer]
    wait_time = constant(2)
