from flask import Flask, request, jsonify, session, redirect, url_for
from flask_session import Session
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from model.abstract_model import summarizer
from supabase import create_client, Client
from email.message import EmailMessage
import ssl
import smtplib
import secrets
import base64
import os

import anthropic
from model.summary import Summarizer
from model.evaluate import Evaluate


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
email_sender ="vietnamesetextsummarizer@gmail.com"
email_password = "xjbh hilu ypsr fyfm"


url="https://aysbefqelgclhktauxfh.supabase.co"
key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5c2JlZnFlbGdjbGhrdGF1eGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MTY2NTYsImV4cCI6MjAyNTM5MjY1Nn0.4rIWcGGYhnvLX4O6VWnCH0hoYU_nbz-TKHk5QZb0OC0"
supabase: Client = create_client(url, key)


app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=5)
Session(app)

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="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",
)

CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

MAX_FILE_SIZE = 5 * 1024 * 1024

@app.route('/summarize-long', methods=['POST'])
def summerize_long():
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    
    data = request.json
    input_text = data.get('input-text')
    print(input_text)
    try:
        summarizer, evaluate = load_model()

        output_text = summarizer.summarize(input_text, mode="lsa")
        score = evaluate.content_based(output_text[0], input_text)

        return jsonify({
            'message': 'Input text received successfully',
            'output-text': output_text[0],
            'score': score
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/summarize-short', methods=['POST'])
def summerize_short():
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    
    data = request.json
    input_text = data.get('input-text')

    try:
        output_text = summarizer(input_text)
        return jsonify({
            'message': 'Input text received successfully',
            'output-text': output_text
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/summarize-claude', methods=['POST'])
def summerize_claude():
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    
    data = request.json
    input_text = data.get('input-text')
    percent = data.get('percent')


    input_length= len(input_text.split())
    output_length = int(input_length * percent / 100)

    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Tóm tắt văn bản sau còn khoảng "+str(output_length)+" từ: "+input_text}
        ]
    )
    # handle the response
    try:
        summarizer, evaluate = load_model()
        output_text = message.content[0].text.split(":\n")[1]
        score = evaluate.content_based(output_text, input_text)

        return jsonify({
            'message': 'Input text received successfully',
            'output-text': output_text,
            'score': score
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/')
@app.route('/home')
def home():
    print(session.get('user'))
    if "user" in session:
        return jsonify({'message': 'At home: Logged in successfully'}), 200
    else:
        return jsonify({'message': 'You have to log in first'}), 401

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
                dtb_result = supabase.table('user').select('password').eq('email', username).execute()
                
                dtb_hased_password = dtb_result.data[0]["password"] # get the password from the tuple and remove the (' and ',)

                if bcrypt.check_password_hash(dtb_hased_password, password):
                    session.permanent = True
                    session['user'] = username
                    print("session " + session['user'])
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
def log_out():
    session.pop('user', None)
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
    
@app.route('/profile', methods=['POST'])
def profile():
    try:
        data = request.json
        username = data.get('username')

        dtb_result = supabase.table('user').select('name', 'subscription', 'created_at').eq('email', username).execute()
        name = dtb_result.data[0]["name"]
        subscription = dtb_result.data[0]["subscription"]
        created_at = dtb_result.data[0]["created_at"]
        
        return jsonify({'name':name, 'subscription': subscription, 'created_at': created_at}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/feedback', methods=['POST'])
def feedback():
    try:
        data = request.json
        text_id = data.get('text_id')
        star = data.get('star')
        comment = data.get('comment')

        supabase.table('feedback').insert({"textId": text_id, "star": star, "comment": comment}).execute()
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify({'message':"Saved feedback successfully"}), 200

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    
@app.route('/upload', methods=['POST'])
def upload_file():
    
    # Extract file data from JSON payload
    json_data = request.get_json()
    if 'file' not in json_data:
        return jsonify({"error": "File data not found in JSON payload"}), 400
    
    data = request.json
    file_data = data.get('file')

    #file_data = json_data['file']
    
    # Decode base64 data
    file_content = base64.b64decode(file_data)
    
    # Save file to upload folder
    filename = 'uploaded_file.txt'  # You can define your own filename logic here
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(file_path, 'wb') as f:
        f.write(file_content)
    
    return jsonify({"message": "File uploaded successfully"}), 200


if __name__ == "__main__":
    app.register_blueprint(swaggerui_blueprint)
    app.run(debug=True)

    # test commit