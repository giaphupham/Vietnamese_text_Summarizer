from flask import Flask, request, jsonify, session, redirect, url_for
from flask_session import Session
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from model.abstract_model import summarizer
from supabase import create_client, Client
from email.message import EmailMessage
from functools import wraps
# from concurrent.futures import ThreadPoolExecutor
from nltk.tokenize import sent_tokenize
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import ssl
import smtplib
import secrets
import base64
import os
import stripe
import json
import datetime
import math
from datetime import timedelta, datetime, timezone
import time
import anthropic
from model.summary import Summarizer
from model.evaluate import Evaluate
from dateutil.relativedelta import relativedelta

load_dotenv()

def load_model():
    s = Summarizer()
    e = Evaluate()
    return s, e
app = Flask(__name__)
SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.yaml'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Vietnamese Text Summarizer"
    }
)
otp_dict = {}
email_sender = os.getenv('EMAIL_SENDER')
email_password = os.getenv('EMAIL_PASSWORD')

url=os.getenv('DTB_URL')
key=os.getenv('DTB_KEY')
supabase: Client = create_client(url, key)
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=5)
Session(app)
client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key=os.getenv('CLAUDE_API_KEY'),
)
user_info = {}
stripe_keys = {
    "secret_key": os.getenv('STRIPE_SECRET_KEY'),
    "publishable_key": os.getenv('STRIPE_PUBLISHABLE_KEY'),
    "pro_plan_id" : os.getenv('STRIPE_PRO_PLAN_ID')
}
endpoint_secret = os.getenv('STRIPE_ENDPOINT_SECRET')
stripe.api_key = stripe_keys["secret_key"]
YOUR_DOMAIN = 'http://127.0.0.1:5000'
CLIENT_ORIGIN = 'http://localhost:5173' # https://vietnamese-text-summarizer.onrender.com/


CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "https://vietnamese-text-summarizer.onrender.com"]
    }
})
bcrypt = Bcrypt(app)
MAX_FILE_SIZE = 5 * 1024 * 1024
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print("session: ", session)
        if 'user' not in session:
            return redirect(url_for('login')), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'role' not in session or (session['role'] != 'admin' and session['role'] != 's_admin'):
            return jsonify(message="Admins only!"), 403
        return f(*args, **kwargs)
    return decorated_function

def update_last_access(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return f(*args, **kwargs)
        supabase.table('user').update({'last_access': 'now()'}).eq('email', session.get('user')).execute()
        return f(*args, **kwargs)
    return decorated_function

def require_origin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        request_origin = request.headers.get('Origin')
        if not request_origin:
            response = jsonify({'error': 'Forbiden access!'})
            response.status_code = 403
            return response
        if request_origin != CLIENT_ORIGIN:
            response = jsonify({'error': 'Forbiden access!'})
            response.status_code = 403
            return response
        return f(*args, **kwargs)
    return decorated_function

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Content-Security-Policy'] = "frame-ancestors 'self'"
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Server'] = 'VietnameseTextSummarizer_SERVER'
    return response

@app.route('/admin_ban_user', methods=['PUT'])
@login_required
@admin_required
@update_last_access
def admin_ban_user():
    try:
        data = request.get_json()
        user_id = data.get('email')
        
        user_response = supabase.table('user').select('role').eq('email', user_id).execute()
        print(user_response.data[0]['role'])
        if not user_response.data or user_response.data[0]['role'] == 's_admin':
            return jsonify({"error": "Cannot ban super admin"}), 403
        
        response = supabase.table('user').update({"banned": 'Banned'}).eq('email', user_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/admin_unban_user', methods=['PUT'])
@login_required
@admin_required
@update_last_access
def admin_unban_user():
    try:
        data = request.get_json()
        user_id = data.get('email')
        
        # Fetch the user to check their role
        user_response = supabase.table('user').select('role').eq('email', user_id).execute()
        if not user_response.data:
            return jsonify({"error": "User not found"}), 404
        
        response = supabase.table('user').update({"banned": 'None'}).eq('email', user_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/sub', methods=['POST'])
def sub():
    email = request.json.get('email', None)
    payment_method = request.json.get('payment_method', None)
    price_id = request.json.get('price_id', None)
    print(email, payment_method, price_id)
    if not email:
        return 'You need to send an Email!', 400
    if not payment_method:
        return 'You need to send an payment_method!', 400
    # This creates a new Customer and attaches the default PaymentMethod in one API call.
    customer = stripe.Customer.create(
        payment_method=payment_method,
        email=email,
        invoice_settings={
            'default_payment_method': payment_method,
        },
    )
    # Creates a subscription and attaches the customer to it
    subscription = stripe.Subscription.create(
        customer=customer['id'],
        items=[
            {
            'price': price_id,
            },
        ],
        expand=['latest_invoice.payment_intent'],
    )
    status = subscription['latest_invoice']['payment_intent']['status'] 
    client_secret = subscription['latest_invoice']['payment_intent']['client_secret']
    user_info['customer_id'] = customer['id']
    user_info['email'] = email
    
    return {'status': status, 'client_secret': client_secret}, 200

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe_Signature', None)
    if not sig_header:
        return 'No Signature Header!', 400
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return 'Invalid signature', 400
    if event['type'] == 'payment_intent.succeeded':
        email = event['data']['object']['receipt_email'] # contains the email that will recive the recipt for the payment (users email usually)
        
        user_info['paid_50'] = True
        user_info['email'] = email
    if event['type'] == 'invoice.payment_succeeded':
        email = event['data']['object']['customer_email'] # contains the email that will recive the recipt for the payment (users email usually)
        customer_id = event['data']['object']['customer'] # contains the customer id
        
        user_info['paid'] = True
    else:
        return 'Unexpected event type', 400
    return '', 200

@app.route('/status', methods=['GET'])
def user_status():
    user_logged_in = session.get('logged_in')
    return jsonify({'loggedIn': user_logged_in})

MAX_FREE_SUMMARIES = 3

@app.route('/summarize-long', methods=['POST'])
@update_last_access
@require_origin
def summerize_long():
    ts = time.time()
    current_time = datetime.datetime.fromtimestamp(ts, tz=None)
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400


    if 'summary_count' not in session:
        session['summary_count'] = 0
        session['last_summary_time'] = current_time
    else:
        last_summary_time = session.get('last_summary_time', current_time)
        if current_time - last_summary_time >= timedelta(days=1):
            session['summary_count'] = 0
            session['last_summary_time'] = current_time
    if not session.get('logged_in', None) and session['summary_count'] >= MAX_FREE_SUMMARIES:
        return jsonify({'error': 'Free summary limit reached. Please choose a plan and register.'}), 403
    elif session.get('logged_in', True) and session['summary_count'] > 5 and session['subscription'] == 0:
        return jsonify({'error': 'Free summary limit reached. Please upgrade to Pro or Premium plan'}), 403
    elif session.get('logged_in', True) and session['summary_count'] > 20 and session['subscription'] == 1:
        return jsonify({'error': 'Free summary limit reached. Pro summary limit reached. Please upgrade to Premium plan'}), 403
    data = request.json
    input_text = data.get('input-text')
    words_amount = len(input_text.split())
    output_sentences = math.ceil(data.get('sentences') / 2)

    if not input_text or not output_sentences:
        return jsonify({'error': 'Missing input text or number of sentences'}), 400
    username = session.get('user')
    
    try:
        dtb_result = supabase.table('user').select('subscription').eq('email', username).execute()    
        print(dtb_result.data)                   
        
        max_words = 1500
        if(dtb_result.data[0]["subscription"] != 0 and dtb_result.data[0]["subscription"] != []):
            max_words = 3000
        if(words_amount > max_words and (dtb_result.data[0]["subscription"]==0 or dtb_result.data==[])):
            return jsonify({'error': 'Only subscription user can summarize more than 1500 words'}), 403
        
        summarizer, evaluate = load_model()
        result = summarizer.summarize(input_text, mode="lsa", keep_sentences= output_sentences)
        output_text = result[0]
        score = evaluate.content_based(output_text, input_text)
        
        output_words = len(output_text.split())
        output_sentences = output_text.count('.') + output_text.count('!') + output_text.count('?')
        + output_text.count(':') - 2* output_text.count('...')
        session['summary_count'] += 1
        session['last_summary_time'] = current_time
        print(session)
        return jsonify({
            'message': 'Input text received successfully',
            'output-text': output_text,
            'words': output_words,
            'sentences': output_sentences,
            'max-words': max_words,
            'score': round(score * 100)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/summarize-short', methods=['POST'])
@update_last_access
def summerize_short():
    ts = time.time()
    current_time = datetime.fromtimestamp(ts, tz=None)
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    
    if 'summary_count' not in session:
        session['summary_count'] = 0
        session['last_summary_time'] = current_time
    else:
        last_summary_time = session.get('last_summary_time', current_time)
        if current_time - last_summary_time >= timedelta(days=1):
            session['summary_count'] = 0
            session['last_summary_time'] = current_time
    if not session.get('logged_in', None) and session['summary_count'] >= MAX_FREE_SUMMARIES:
        return jsonify({'error': 'Free summary limit reached. Please Login or Register.'}), 403
    elif session.get('logged_in', True) and session['summary_count'] > 5 and session['subscription'] == 0:
        return jsonify({'error': 'Free summary limit reached. Free summary limit reached. Please upgrade to Pro or Premium plan'}), 403
    elif session.get('logged_in', True) and session['summary_count'] > 20 and session['subscription'] == 1:
        return jsonify({'error': 'Free summary limit reached. Pro summary limit reached. Please upgrade to Premium plan'}), 403
    
    print(session.get('user'))
    data = request.json
    input_text = data.get('input-text')
    words_amount = len(input_text.split())
    username = session.get('user')
    try:
        dtb_result = supabase.table('user').select('subscription').eq('email', username).execute()
                
        max_words = 1500
        if(dtb_result.data[0]["subscription"] != 0 and dtb_result.data[0]["subscription"] != []):
            max_words = 3000
        if(words_amount > max_words and (dtb_result.data[0]["subscription"]==0 or dtb_result.data==[])):
            return jsonify({'error': 'Only subscription user can summarize more than 1500 words'}), 403
        output_text = summarizer(input_text)
        output_words = len(output_text.split())
        output_sentences = len(sent_tokenize(output_text))
        r, evaluate = load_model()
        score = evaluate.content_based(output_text, input_text)
        session['summary_count'] += 1
        session['last_summary_time'] = current_time
        return jsonify({
            'message': 'Input text received successfully',
            'output-text': output_text,
            'words': output_words,
            'sentences': output_sentences,
            'max-words': max_words,
            'score': round(score * 100)
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
# @app.route('/summarize-number', methods=['POST'])
# @update_last_access
# def summarize_number():
#     ts = time.time()
#     current_time = datetime.datetime.fromtimestamp(ts, tz=None)
#     if not request.json:
#         return jsonify({'error': 'No JSON data received'}), 400
    
#     if 'summary_count' not in session:
#         session['summary_count'] = 0
#         session['last_summary_time'] = current_time
#     else:
#         last_summary_time = session.get('last_summary_time', current_time)
#         if current_time - last_summary_time >= datetime.timedelta(days=1):
#             session['summary_count'] = 0
#             session['last_summary_time'] = current_time
#     if not session.get('logged_in', False) and session['summary_count'] >= MAX_FREE_SUMMARIES:
#         return jsonify({'error': 'Free summary limit reached. Please choose a plan and register.'}), 403
    
#     data = request.json
#     input_text = data.get('input-text')
#     output_sentences = data.get('sentences')
#     words_amount = len(input_text.split())
#     if not input_text or not output_sentences:
#         return jsonify({'error': 'Missing input text or number of sentences'}), 400
#     username = session.get('user')
#     try:
#         dtb_result = supabase.table('user').select('subscription').eq('email', username).execute()
                
#         max_words = 1500
#         if(dtb_result.data[0]["subscription"] != 0 and dtb_result.data[0]["subscription"] != []):
#             max_words = 3000
#         if(words_amount > max_words and (dtb_result.data[0]["subscription"]==0 or dtb_result.data==[])):
#             return jsonify({'error': 'Only subscription user can summarize more than 1500 words'}), 403
#         print("flag1")
#         # Chia đoạn input thành các đoạn nhỏ
#         input_chunks = sent_tokenize(input_text) # array các câu
#         chunk_size = len(input_chunks) // output_sentences # số câu mỗi đoạn
        
#         # Tạo các đoạn input_segments tương ứng với số lượng output_sentences
#         input_segments = [' '.join(input_chunks[i * chunk_size: (i + 1) * chunk_size]) 
#                           for i in range(output_sentences)]
        
#         if len(input_segments) < output_sentences:
#             input_segments.append(' '.join(input_chunks[output_sentences * chunk_size:]))
        
#         print(input_segments)
#         with ThreadPoolExecutor(max_workers=output_sentences) as executor:
#             results = list(executor.map(summarizer, input_segments))
        
#         print(results)
#         output_text = ' '.join(results)
#         print(output_text)
#         output_words = len(output_text.split())
#         session['summary_count'] += 1
#         session['last_summary_time'] = current_time
#         return jsonify({
#             'message': 'Input text received successfully',
#             'output-text': output_text,
#             'words': output_words,
#             'sentences': output_sentences,
#             'max-words': max_words
#         }), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
@app.route('/summarize-claude', methods=['POST'])
@update_last_access
@login_required
def summerize_claude():
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    
    data = request.json
    input_text = data.get('input-text')
    sentences = data.get('sentences')

    if not input_text or not sentences:
        return jsonify({'error': 'Missing input text or number of sentences'}), 400
    username = session.get('user')
    if(sentences>= len(sent_tokenize(input_text))-2):
        return jsonify({'error':"Amount of output sentences cannot too big >= input sentences -2"})
    
    # handle the response
    try:
        dtb_result = supabase.table('user').select('subscription').eq('email', username).execute()
                
        subscription = dtb_result.data[0]["subscription"]
        if(subscription != 2):
            return jsonify({'error': 'Only level 2 subscription user can summarize using this tool'}), 403
        
        message = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": "Tóm tắt văn bản sau thành chính xác "+ str(sentences) +" câu, đưa tôi trực tiếp văn bản đầu ra mà không cần câu dẫn dắt của AI: "+input_text}
            ]
        )
        summarizer, evaluate = load_model()
        output_text = message.content[0].text
        output_words = len(output_text.split())
        output_sentences = len(sent_tokenize(output_text))
        score = evaluate.content_based(output_text, input_text)
        return jsonify({
            'message': 'Input text received successfully',
            'output-text': output_text,
            'words': output_words,
            'sentences': output_sentences,
            'score': score
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/')
@app.route('/home')
@login_required
@update_last_access
def home():
    return jsonify({'message': 'At home: Logged in successfully'}), 200
@app.route('/register', methods=['POST'])
def register():
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    data = request.json
    username = data.get('username')
    password = data.get('password')
    name = data.get('name')
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    print(username, password, hashed_password)
    if username and password:
        try:
            supabase.table('user').insert({"email": username, "password": hashed_password, "name": name}).execute()
            return jsonify({'message': 'User created successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
  
@app.route('/login', methods=['POST', 'GET'])
@update_last_access
def login():
    
    if request.method == 'POST':
        if not request.json:
            return jsonify({'error': 'No JSON data received'}), 400
        
        
        data = request.json
        username = data.get('username')
        password = data.get('password')
        try:
            if username and password:
                # get user from database !!!
                dtb_result = supabase.table('user').select('password', 'role', 'subscription', 'banned').eq('email', username).execute()
                if dtb_result.data[0]['banned'] == 'Banned':
                    return jsonify({"error": "This account has been banned"}), 403
                
                dtb_hased_password = dtb_result.data[0]["password"] # get the password from the tuple and remove the (' and ',)
                role = dtb_result.data[0]["role"] 
                subscription = dtb_result.data[0]["subscription"]
                
                if bcrypt.check_password_hash(dtb_hased_password, password):
                    session.permanent = True
                    session['user'] = username
                    session['role'] = role
                    session['logged_in'] = True
                    session['summary_count'] = 0
                    session['subscription'] = subscription

                    if role == 'admin' or role == 's_admin':
                        return jsonify(dtb_result.data[0])
                    else:
                        print("ở đây")
                        return redirect(url_for('home'))
                else:
                    return jsonify({'error': 'Wrong username or password'}), 401
                
        except Exception as e:
            return jsonify({'Error while accessing database': str(e)}), 500
    
    else:
        if "user" in session:
            return redirect(url_for('home'))
        return jsonify({'message': 'You are at the login page'}), 200
    
@app.route('/logout')
@update_last_access
def log_out():
    session.pop('user', None)
    session.pop('role', None)
    session.pop('logged_in', None)
    session.pop('subscription', None)
    return redirect(url_for('login'))
@app.route('/resetpassword', methods=['POST'])
def reset_password():
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    data = request.json
    username = data.get('username')
    new_password = data.get('new-password')
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    if username and new_password:
        try:
            data = supabase.table('user').update({"password": hashed_password}).eq('email', username).execute()
            return jsonify({'message': 'Password updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
def generate_otp():
    return secrets.token_hex(3)
@app.route('/send_otp_email', methods=['POST'])
def send_otp_email():
    data = request.json
    email_receiver = data.get('email')
    otp = generate_otp()
    
    # Store OTP in dictionary
    otp_dict[email_receiver] = otp
    
    # Send OTP email
    try:
        subject = "Your verification code from Vietnamese Text Summarizer"
        body = "This is your OTP code: " + otp
        em = EmailMessage()
        em['From'] = email_sender
        em['To'] = email_receiver
        em['Subject']= subject
        em.set_content(body)
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com',465, context=context) as smtp:
            smtp.login(email_sender, email_password)
            smtp.sendmail(email_sender, email_receiver, em.as_string())
        
        return jsonify({'message': "OTP sent successfully!"}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/verify_otp', methods=['POST'])
def verify_email():
    try:
        data = request.json
        email = data.get('email')
        user_otp = data.get('otp')
        # print(email)
        # print(otp_dict[email])
        if email in otp_dict and user_otp == otp_dict[email]:
            del otp_dict[email]  # Remove OTP from dictionary after verification
            return jsonify({'message': 'Email verification successful!'}), 200
    except Exception as e:
        return jsonify({'error': 'Wrong OTP'}), 500
@app.route('/save-text', methods=['POST'])
@login_required
def save_text():
    try:
        data = request.json
        input = data.get('input')
        output = data.get('output')
        mode = data.get('mode')
        user_id = data.get('user_id')
        supabase.table('text').insert({"userId": user_id, "input": input, "output": output, "mode": mode}).execute()
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'message':"Saved successfully"}), 200

@app.route('/admin_get_users', methods=['GET'])
@login_required
@admin_required
@update_last_access
def admin_get_users():
    try:
        users = (supabase
                .table('user')
                .select('id','email','name','role','subscription','created_at',"last_access", "banned")
                .order('last_access', desc=True)
                .limit(50)
                .execute())
        return jsonify(users.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/admin_report_sales', methods=['GET'])
@login_required
@admin_required
@update_last_access
def admin_report_sales():
    try:
        # Calculate the first and last day of the current month
        today = datetime.now(timezone.utc)
        first_day_of_month = today.replace(day=1)
        last_day_of_month = first_day_of_month + relativedelta(months=1, days=-1)
        
        # Fetch the count of users with each subscription type
        response_1 = supabase.table('user').select('id', count='exact').eq('subscription', 1).execute()
        count_type_1 = response_1.count
        response_2 = supabase.table('user').select('id', count='exact').eq('subscription', 2).execute()
        count_type_2 = response_2.count
        
        # Fetch active subscriptions for the current month
        response_subs = supabase.table('subscriptions').select('*').gte('created_at', first_day_of_month.isoformat()).lte('expired_time', last_day_of_month.isoformat()).execute()
        subscriptions = response_subs.data
        
        # Calculate the revenue for the current month
        monthly_revenue_pro = sum(0.99 for sub in subscriptions if sub['type'] == 1)
        monthly_revenue_premium = sum(9.99 for sub in subscriptions if sub['type'] == 2)

        monthly_revenues = []
        for i in range(12):
            month_start = first_day_of_month - relativedelta(months=i)
            month_end = month_start + relativedelta(months=1, days=-1)
            response_subs = supabase.table('subscriptions').select('*').gte('created_at', month_start.isoformat()).lt('created_at', month_end.isoformat()).execute()
            subscriptions = response_subs.data

            monthly_revenue_pro = sum(0.99 for sub in subscriptions if sub['type'] == 1)
            monthly_revenue_premium = sum(9.99 for sub in subscriptions if sub['type'] == 2)

            monthly_revenues.append({
                'month': month_start.strftime('%B %Y'),
                'revenue_pro': monthly_revenue_pro,
                'revenue_premium': monthly_revenue_premium,
            })
        
        return jsonify({
            "count_type_1": count_type_1,
            "count_type_2": count_type_2,
            "revenue_pro": count_type_1 * 0.99,
            "revenue_premium": count_type_2 * 9.99,
            "revenue_total": count_type_1 * 0.99 + count_type_2 * 9.99,
            "monthly_revenues": monthly_revenues,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def verify_admin_password(admin_id, password):
    # Fetch admin's hashed password from the database
    admin_response = supabase.table('user').select('password').eq('email', admin_id).execute()
    if not admin_response.data:
        return False  # Admin not found
    hashed_password = admin_response.data[0].get('password')
    return bcrypt.check_password_hash(hashed_password, password)

@app.route('/admin_delete_admin', methods=['POST'])
@login_required
@admin_required
@update_last_access
def admin_delete_admin():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        admin = data.get('admin')

        if not username or not password:
            return jsonify({"error": "Missing admin email"}), 400

        # Check if the current user is a super admin
        # current_user_role = supabase.table('user').select('role').eq('email', admin_email).execute().data[0].get('role')
        # if current_user_role != 's_admin':
        #     return jsonify({"error": "Only super admins can delete admins"}), 403

        # # Ensure the admin being deleted is not a super admin
        # admin_to_delete = supabase.table('user').select('role').eq('email', user_email).execute().data[0]
        # if admin_to_delete.get('role') == 's_admin':
        #     return jsonify({"error": "Cannot delete a super admin"}), 403

        if not verify_admin_password(admin, password):
            return jsonify({"error": "Incorrect password"}), 401

        # Perform the deletion
        supabase.table('user').update({'role': 'user'}).eq('email', username).execute()

        return jsonify({"message": "Admin deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin_approve_admin', methods=['POST'])
@login_required
@admin_required
@update_last_access
def admin_approve_admin():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        admin = data.get('admin')
        print(username, password, admin)
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
        # Verify admin's password
        if not verify_admin_password(admin, password):
            return jsonify({"error": "Incorrect password"}), 401
        
        supabase.table('user').update({'role': 'admin'}).eq('email', username).execute()
        return jsonify({"message": "User role updated to admin successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/profile', methods=['POST', 'GET'])
@login_required
def profile():
    try:
        print (session.get('user'))
        data = request.json
        username = data.get('username')
        dtb_result = supabase.table('user').select('name', 'subscription', 'created_at').eq('email', username).execute()
        name = dtb_result.data[0]["name"]
        subscription = dtb_result.data[0]["subscription"]
        created_at = dtb_result.data[0]["created_at"]
        
        return jsonify({'name':name, 'subscription': subscription, 'created_at': created_at}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/feedback', methods=['POST','GET'])
@login_required
def feedback():
    try:
        data = request.json
        star = data.get('star')
        comment = data.get('comment')
        user = data.get('user')
        supabase.table('feedback').insert({"user":user, "star": star, "comment": comment}).execute()
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'message':"Saved feedback successfully"}), 200
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Các đuôi tệp hợp lệ
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST']) # gửi value là file ng dùng up vào key 'file' trong json request
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file in request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file in request"}), 400
    
    if file and allowed_file(file.filename):
        content = file.read().decode('utf-8', errors='ignore')
        return jsonify({"message": "File upload successfully","content":content}), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400

@app.route('/change_name', methods=['POST'])
def change_name():
    data = request.json
    email = data.get('email')
    new_name = data.get('new_name')
    print(email, new_name)
    supabase.table('user').update({"name": new_name}).eq('email', email).execute()
    
    return jsonify({'message': 'Name changed successfully'}), 200

@app.route('/upgrade', methods=['POST', 'GET'])
@login_required
def upgrade_plan():
    data = request.json
    plan = data.get('plan')
    user = data.get('user') 

    user_id = supabase.table('user').select('id').eq('email', user).execute()

    # Calculate the start day and end day
    start_day = datetime.now(timezone.utc)
    end_day = start_day + timedelta(days=30)
    print(user_id)
    try:
        supabase.table('user').update({"subscription": plan}).eq('email', user).execute()
        supabase.table('subscriptions').insert({
            'user_id': 1,
            'payment menthod': 'card',
            'created_at': start_day.isoformat(),
            'expired_time': end_day.isoformat(),
            'type': plan,
        }).execute()

        return jsonify({'message': 'Plan upgraded successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/login_by_acc', methods=['POST'])
def login_and_register_by_3rd_party():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    user_ = supabase.table('user').select('email','role', 'subscription').eq('email', email).execute()
    role = user_.data[0]["role"]
    user_email = user_.data[0]["email"]
    subscription = user_.data[0]["subscription"]
    if user_email == []:
        supabase.table('user').insert({"email": email, "password": "null", "name": name}).execute()
        session.permanent = True
        session['user'] = email
        session['role'] = role
        session['logged_in'] = True
        session['summary_count'] = 3
        return redirect(url_for('home'))
    else:
        session.permanent = True
        session['user'] = email
        session['role'] = role
        session['logged_in'] = True
        session['summary_count'] = 3
        session['subscription'] = subscription
        return redirect(url_for('home'))
@app.route('/change_password', methods=['POST'])
def change_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    supabase.table('user').update({"password": hashed_password}).eq('email', email).execute()
    
    return jsonify({'message': 'Password changed successfully'}), 200
if __name__ == "__main__":
    app.register_blueprint(swaggerui_blueprint)
    app.run(debug=True) # , threaded=True)
