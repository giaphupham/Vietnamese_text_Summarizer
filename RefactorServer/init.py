from flask import Flask
from flask_bcrypt import Bcrypt
from flask_session import Session
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from datetime import timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import stripe

load_dotenv()

app = Flask(__name__)

# email sender
otp_dict = {}
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
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=5)
Session(app)

# password encrypt
bcrypt = Bcrypt(app)

# stripe
user_info = {}
stripe_keys = {
    "secret_key": os.getenv('STRIPE_SECRET_KEY'),
    "publishable_key": os.getenv('STRIPE_PUBLISHABLE_KEY')
}
endpoint_secret = os.getenv('STRIPE_ENDPOINT_SECRET')
stripe.api_key = stripe_keys["secret_key"]


# require origin
ALLOW_ORIGINS = ["http://localhost:5173","http://localhost:5000","https://vietnamesetextsummarizer.azurewebsites.net", "https://hcmusummarizer.azurewebsites.net"]
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:5173","http://localhost:5000","https://vietnamesetextsummarizer.azurewebsites.net", "https://hcmusummarizer.azurewebsites.net"]
    }
})

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

MAX_FILE_SIZE = 5 * 1024 * 1024