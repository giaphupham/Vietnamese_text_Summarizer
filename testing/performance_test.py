from locust import SequentialTaskSet, HttpUser, constant, task # locust 2.26.0
import json, logging, sys


class Summarizer(SequentialTaskSet):

    @task
    def login(self):
        data ={
            'username':'20120385@student.hcmus.edu.vn',
            'password':'123',
            'withCredentials':'true'
        }
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Access-Control-Request-Headers': 'content-type',
            'Access-Control-Request-Method': 'POST',
            'Connection': 'keep-alive',
            'Content-Length': '84',
            'Content-Type': 'application/json',
            'Cookie': 'session=trlD-HVJD65lUIOMLArFnEyUUluj66GSJ9vK6Y7Zb8U',
            'Host': 'vietnamesetextsummarizer.azurewebsites.net',
            'Origin': 'https://hcmusummarizer.azurewebsites.net',
            'Referer': 'https://hcmusummarizer.azurewebsites.net/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }   
        with self.client.post("/login", data=json.dumps(data), headers=headers, catch_response=True) as response:
            if response.status_code == 403 or response.status_code == 200: # 403 is when reditected to home but denied because cannot access to session.. idk why it cannnot access to session at /home
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
            'Content-Type': 'application/json',
            'Cookie': 'session=trlD-HVJD65lUIOMLArFnEyUUluj66GSJ9vK6Y7Zb8U',
            'Host': 'vietnamesetextsummarizer.azurewebsites.net',
            'Origin': 'https://hcmusummarizer.azurewebsites.net',
            'Referer': 'https://hcmusummarizer.azurewebsites.net/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        
        }
        response = self.client.get("/home", headers=headers)    

        if response.status_code == 200: 
            logging.info("At home")
        else:
            logging.error("Failed access home. Status code: %d" % response.status_code)

    @task
    def summarize(self):

        def read_file(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    return content
            except FileNotFoundError:
                return "Error: File '{}' not found.".format(file_path)
            except Exception as e:
                return "Error: " +str(e)
        text = read_file('data/around300words.txt')
        # print(text)
        data ={
            'input-text': text,
            'sentences': 0,
            'withCredentials':'true'
        }
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '3216',
            'Content-Type': 'application/json',
            'Cookie': 'session=trlD-HVJD65lUIOMLArFnEyUUluj66GSJ9vK6Y7Zb8U',
            'Host': 'vietnamesetextsummarizer.azurewebsites.net',
            'Origin': 'https://hcmusummarizer.azurewebsites.net',
            'Referer': 'https://hcmusummarizer.azurewebsites.net/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
        
        response = self.client.post("/summarize", data=json.dumps(data), headers=headers) 

        output_data = response.json()
        print(output_data.get('output-text'))
        if response.status_code == 200:
            logging.info("Summarized successfully!")
        else:
            logging.error("Failed to summarize. Status code: %d" % response.status_code)  

    

class MyLoadTest(HttpUser):
    host = "https://vietnamesetextsummarizer.azurewebsites.net"
    tasks = [Summarizer]
    wait_time = constant(1)
