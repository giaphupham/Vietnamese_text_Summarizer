from init import *
from decorators import *
from model_loader import *
from flask import request, jsonify, session, redirect, url_for
from email.message import EmailMessage
from datetime import datetime, timezone
import ssl
import time
import math
import secrets
import smtplib


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
    return jsonify({'loggedIn': user_logged_in}), 200

MAX_FREE_SUMMARIES = 3

@app.route('/summarize-long', methods=['POST'])
@update_last_access
@require_origin
def summerize_long():
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
        max_words = 700
        if username!=None:
            dtb_result = supabase.table('user').select('subscription').eq('email', username).execute()    
            print(dtb_result.data)                   
            
            max_words = 1500
            subscription= dtb_result.data[0]["subscription"]
            if(subscription != 0):
                max_words = 3000

            if(words_amount > max_words and (subscription==0 or dtb_result.data==[])):
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
        max_words = 700
        if username!=None:
            dtb_result = supabase.table('user').select('subscription').eq('email', username).execute()
                    
            max_words = 1500
            subscription= dtb_result.data[0]["subscription"]
            if(subscription != 0):
                max_words = 3000
                
            if(words_amount > max_words and (subscription==0 or dtb_result.data==[])):
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

@app.route('/profile', methods=['POST', 'GET'])
@login_required
def profile():
    try:
        # print (session.get('user'))
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