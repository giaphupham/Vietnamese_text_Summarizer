from flask import Flask, request, jsonify, session, redirect, url_for
from flask_session import Session
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from model.textRank import load_model
from model.abstract_model import summarizer
from supabase import create_client, Client

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

url="https://aysbefqelgclhktauxfh.supabase.co"
key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5c2JlZnFlbGdjbGhrdGF1eGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MTY2NTYsImV4cCI6MjAyNTM5MjY1Nn0.4rIWcGGYhnvLX4O6VWnCH0hoYU_nbz-TKHk5QZb0OC0"
supabase: Client = create_client(url, key)


app.secret_key = 'supersecret'
app.permanent_session_lifetime = timedelta(minutes=60)


CORS(app)
bcrypt = Bcrypt(app)


@app.route('/summarize-long', methods=['POST'])
def summerize_long():
    if not request.json:
        return jsonify({'error': 'No JSON data received'}), 400
    
    data = request.json
    input_text = data.get('input-text')

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
            data, count = supabase.table('user').insert({"username": username, "password": hashed_password, "name": name}).execute()
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
                dtb_result = supabase.table('user').select('password').eq('username', username).execute()
                
                dtb_hased_password = dtb_result.data[0]["password"] # get the password from the tuple and remove the (' and ',)

                if bcrypt.check_password_hash(dtb_hased_password, password):
                    session.permanent = True
                    session['user'] = username
                    print("session " + session['user'])
                    return redirect('/home'), 200       
                else:
                    return jsonify({'error': 'Wrong username or password'}), 401
                
        except Exception as e:
            return jsonify({'Error while accessing database': str(e)}), 500
    
    else:
        return redirect(url_for('home'))
    

@app.route('/logout')
def log_out():
    #session.pop('user', None)
    return redirect(url_for('login')), 200

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
            data = supabase.table('user').update({"password": hashed_password}).eq('username', username).execute()
            return jsonify({'message': 'Password updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.register_blueprint(swaggerui_blueprint)
    app.run(debug=True)