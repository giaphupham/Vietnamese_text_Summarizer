from flask import Flask
from flask_session import Session
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import timedelta
import os
import stripe
from datetime import timedelta
import anthropic

load_dotenv()

app = Flask(__name__)

# swagger
SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.yaml'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Vietnamese Text Summarizer"
    }
)
app.register_blueprint(swaggerui_blueprint)

# email sender
email_sender = os.getenv('EMAIL_SENDER')
email_password = os.getenv('EMAIL_PASSWORD')

# supabase
url=os.getenv('DTB_URL')
key=os.getenv('DTB_KEY')
supabase: Client = create_client(url, key)

# session
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
Session(app)

# ClaudeAI
client = anthropic.Anthropic(
    api_key=os.getenv('CLAUDE_API_KEY'),
)

# Stripe
stripe_keys = {
    "secret_key": os.getenv('STRIPE_SECRET_KEY'),
    "publishable_key": os.getenv('STRIPE_PUBLISHABLE_KEY'),
    "pro_plan_id" : os.getenv('STRIPE_PRO_PLAN_ID')
}
endpoint_secret = os.getenv('STRIPE_ENDPOINT_SECRET')
stripe.api_key = stripe_keys["secret_key"]

# Origin required
ALLOW_ORIGINS = ["http://localhost:5173","http://localhost:5000","https://vietnamesetextsummarizer.azurewebsites.net", "https://vietnamese-text-summarizer.onrender.com"]

# CORS Configuration
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:5173","http://localhost:5000","https://vietnamesetextsummarizer.azurewebsites.net", "https://vietnamese-text-summarizer.onrender.com"]
    }
})

# password encryption
bcrypt = Bcrypt(app)

# global variables
otp_dict = {}
user_info = {}
MAX_FILE_SIZE = 5 * 1024 * 1024
MAX_FREE_SUMMARIES = 3

