from os.path import dirname
import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv('API_URL')
headers = {
	"Accept" : "application/json",
	"Authorization": os.getenv('BEARER_KEY'),
	"Content-Type": "application/json" 
}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()

def summarizer(sentence):
    output = query({
        "inputs": sentence,
    })
    return output[0]['summary']



