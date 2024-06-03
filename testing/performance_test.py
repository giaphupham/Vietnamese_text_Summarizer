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
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Cookie': 'session=qW7Gqkdq9t4A3sz6zS94_ptTNKf8azc5Tp5bjh9NW8c',
            'Host': '127.0.0.1:5000', # replace this with hosted backend server
            'Origin': 'http://localhost:5173',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
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
            'Connection': 'close',
            'Cookie': 'session=qW7Gqkdq9t4A3sz6zS94_ptTNKf8azc5Tp5bjh9NW8c',
            'Host': '127.0.0.1:5000', # replace this with hosted backend server
            'Origin': 'http://localhost:5173',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        
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
            'sentences': 4,
            'withCredentials':'true'
        }
        headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '3507',
            'Content-Type': 'application/json',
            'Cookie': 'session=qW7Gqkdq9t4A3sz6zS94_ptTNKf8azc5Tp5bjh9NW8c',
            'Host': '127.0.0.1:5000', # replace this with hosted backend server
            'Origin': 'https://localhost:5173',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
        
        response = self.client.post("/summarize", data=json.dumps(data), headers=headers) 

        output_data = response.json()
        print(output_data.get('output-text'))
        if response.status_code == 200:
            logging.info("Summarized long mode successfully!")
        else:
            logging.error("Failed to summarize long mode. Status code: %d" % response.status_code)  

    

class MyLoadTest(HttpUser):
    host = "https://vietnamesetextsummarizer.azurewebsites.net"
    tasks = [Summarizer]
    wait_time = constant(1)
