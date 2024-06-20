from os.path import dirname
import requests
import os
from dotenv import load_dotenv
# from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

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

# def summarizer(sentences):
# 	tokenizer = AutoTokenizer.from_pretrained(f"{dirname(__file__)}/model_v2/")
# 	model = AutoModelForSeq2SeqLM.from_pretrained(f"{dirname(__file__)}/model_v2/")

# 	encoding = tokenizer(sentences, return_tensors="pt")
# 	input_ids, attention_masks = encoding["input_ids"], encoding["attention_mask"]
# 	outputs = model.generate(
# 		input_ids=input_ids, attention_mask=attention_masks,
# 		max_length=512,
# 		do_sample=True,
# 		top_k=70,
# 		top_p=0.95
# 	)
# 	for output in outputs:
# 		line = tokenizer.decode(output, skip_special_tokens=True, clean_up_tokenization_spaces=True)
# 		return line


