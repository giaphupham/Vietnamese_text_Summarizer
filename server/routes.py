from init import *
from decorators import *
from datetime import timedelta, datetime, timezone
from model_loader import load_model
from model.abstract_model import summarizer
from nltk.tokenize import sent_tokenize
from email.message import EmailMessage
from dateutil.relativedelta import relativedelta
import ssl
import smtplib
import secrets
import time
import math


@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Content-Security-Policy'] = "frame-ancestors 'self'"
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Server'] = 'VietnameseTextSummarizer_SERVER'
    return response

@app.route('/admin_get_feedback', methods=['GET'])
@login_required
@admin_required
@require_origin
@update_last_access
def admin_get_feedback():
    try:
        feedbacks = (supabase
                .table('feedback')
                .select('id','star','comment','created_at','user')
                .order('created_at', desc=True)
                .execute())
        return jsonify(feedbacks.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/check_subscription', methods=['GET'])
@login_required
@admin_required
@require_origin
@update_last_access
def check_subscription():
    user_email = session.get('user')
    if not user_email:
        return jsonify({'notify': False, 'error': 'User not logged in'}), 401

    today = datetime.today().date()
    response = supabase.table('subscriptions').select('expired_time','type').eq('user_email', user_email).eq('status','active').execute()
    print(response.data[0]['expired_time'])
    if response.data[0]['expired_time'] != None:
        end_date_str = response.data[0]['expired_time']
        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00')).date()
        print(today, end_date)
        if today == end_date:
            return jsonify({'notify': False})
    else:
        return jsonify({'notify': True})
    return jsonify({'notify': True})


@app.route('/remaining_days', methods=['GET'])
@login_required
@admin_required
@require_origin
@update_last_access
def get_remaining_days():
    user_email = session.get('user')
    
    # Fetch the user's subscription data from Supabase
    response = supabase.table('subscriptions').select('expired_time').eq('user_email', user_email).eq('status','active').execute()
    
    if response.data:
        end_date_str = response.data[0]['expired_time']
        if end_date_str is None:
            return jsonify({"remaining_days": "Unlimited"})
        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        remaining_days = (end_date - now).days
        return jsonify({"remaining_days": remaining_days})
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/admin_ban_user', methods=['PUT'])
@login_required
@admin_required
@require_origin
@update_last_access
def admin_ban_user():
    try:
        data = request.get_json()
        user_id = data.get('email')
        
        user_response = supabase.table('user').select('role').eq('email', user_id).execute()
        print(user_response.data[0]['role'])
        if not user_response.data or user_response.data[0]['role'] == 's_admin':
            return jsonify({"error": "Cannot ban super admin"}), 403
        
        if user_id == session.get('user'):
            return jsonify({"error": "Cannot ban yourself"}), 403
        
        response = supabase.table('user').update({"banned": 'Banned'}).eq('email', user_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/admin_unban_user', methods=['PUT'])
@login_required
@admin_required
@require_origin
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
@login_required
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

@require_origin
@app.route('/status', methods=['GET'])
def user_status():
    user_logged_in = session.get('logged_in')
    return jsonify({'loggedIn': user_logged_in}), 200

MAX_FREE_SUMMARIES = 3

@app.route('/summarize', methods=['POST'])
@update_last_access
@require_origin
def summerize():
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
        return jsonify({'error': 'Free summary limit reached. Please login or register.'}), 403
    elif session.get('logged_in', True) and session['summary_count'] > 5 and session['subscription'] == 0:
        return jsonify({'error': 'Free summary limit reached. Please upgrade to Pro or Premium plan'}), 403
    elif session.get('logged_in', True) and session['summary_count'] > 20 and session['subscription'] == 1:
        return jsonify({'error': 'Free summary limit reached. Pro summary limit reached. Please upgrade to Premium plan'}), 403
    
    data = request.json
    input_text = data.get('input-text')
    words_amount = len(input_text.split())
    sentences = int(data.get('sentences'))  

    if not input_text:
        return jsonify({'error': 'Missing input text '}), 400
    
    if sentences> math.ceil(len(sent_tokenize(input_text))/2):
        return jsonify({'error': 'Number of input sentences cannot be too large.'}), 400
    username = session.get('user')

    try:
        max_words = 700
        if username!=None:

            max_words = 1500
            subscription= session['subscription']
            if(subscription != 0):
                max_words = 3000

            if(words_amount > max_words and (subscription==0)):
                return jsonify({'error': 'Only subscription user can summarize more than 1500 words'}), 403
        else:
            if(words_amount > max_words):
                return jsonify({'error': 'Only user can summarize more than 700 words, please login'}), 403

        output_text = summarizer(input_text)
        output_words = len(output_text.split())
        output_sentences = len(sent_tokenize(output_text))
    

        r, evaluate = load_model()
        
        session['summary_count'] += 1
        session['last_summary_time'] = current_time

        msg_result=''
        if output_sentences >= sentences and sentences > 0:
            result = r.summarize(output_text, mode="lsa", keep_sentences= sentences)
            output_text_new = result[0]
        elif sentences == 0:
            output_text_new = output_text
        else:
            output_text_new = output_text
            msg_result='Your number of sentences you input cannot be too large'
        
        output_sentences_new = len(sent_tokenize(output_text_new))
        score = evaluate.content_based(output_text_new, input_text)
        return jsonify({
            'message': msg_result,
            'output-text': output_text_new,
            'words': output_words,
            'sentences': output_sentences_new,
            'max-words': max_words,
            'score': round(score * 100)
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
@app.route('/home')
@login_required
@require_origin
@update_last_access
def home():
    sub = session.get('subscription')
    return jsonify({'message': 'At home: Logged in successfully', 'plan':sub}), 200

@app.route('/register', methods=['POST'])
@require_origin
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
            return jsonify({'error': str(e), 'code': str(e.code)}), 500
  
@app.route('/login', methods=['POST', 'GET'])
@require_origin
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
                        return jsonify({'user': username, "role":role, 'plan': subscription})
                    else:
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
@require_origin
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
@require_origin
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
@require_origin
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
@require_origin
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
@require_origin
@update_last_access
def admin_get_users():
    try:
        users = (supabase
                .table('user')
                .select('id','email','name','role','subscription','created_at',"last_access", "banned")
                .order('last_access', desc=True)
                .execute())
        return jsonify(users.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/admin_report_sales', methods=['GET'])
@login_required
@admin_required
@require_origin
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
@require_origin
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
@require_origin
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
@require_origin
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
@require_origin
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
@require_origin
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
@require_origin
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

    # Calculate the start day and end day
    start_day = datetime.now(timezone.utc)
    end_day = start_day + timedelta(days=30)

    try:
        supabase.table('subscriptions').update({'status': 'none'}).eq('user_email', user).execute()

        supabase.table('user').update({"subscription": plan}).eq('email', user).execute()
        if (plan == 0):
            supabase.table('subscriptions').insert({
                'user_email': user,
                'payment menthod': 'card',
                'created_at': start_day.isoformat(),
                'expired_time': None,
                'type': plan,
                'status': 'active'
            }).execute()
        else:
            supabase.table('subscriptions').insert({
                'user_email': user,
                'payment menthod': 'card',
                'created_at': start_day.isoformat(),
                'expired_time': end_day.isoformat(),
                'type': plan,
                'status': 'active'
            }).execute()

        return jsonify({'message': 'Plan upgraded successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/login_by_acc', methods=['POST'])
@require_origin
def login_and_register_by_3rd_party():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    user_ = supabase.table('user').select('email','role', 'subscription', 'banned').eq('email', email).execute()
    role = user_.data[0]["role"]
    user_email = user_.data[0]["email"]
    subscription = user_.data[0]["subscription"]
    if user_.data[0]['banned'] == 'Banned':
        return jsonify({"error": "This account has been banned"}), 403
    elif user_email == []:
        supabase.table('user').insert({"email": email, "password": "null", "name": name}).execute()
        session.permanent = True
        session['user'] = email
        session['role'] = role
        session['logged_in'] = True
        session['summary_count'] = 3
        if role == 'admin' or role == 's_admin':
            return jsonify({'user': email, "role":role, 'plan': subscription})
        else:
            return redirect(url_for('home'))
    else:
        session.permanent = True
        session['user'] = email
        session['role'] = role
        session['logged_in'] = True
        session['summary_count'] = 3
        session['subscription'] = subscription
        if role == 'admin' or role == 's_admin':
            return jsonify({'user': email, "role":role, 'plan': subscription})
        else:
            return redirect(url_for('home'))
    

@app.route('/change_password', methods=['POST'])
@require_origin
def change_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')
    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    supabase.table('user').update({"password": hashed_password}).eq('email', email).execute()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@app.route('/notify_upgrade', methods=['POST'])
@require_origin
def notify_upgrade():
    data = request.json
    email = data.get('email')
    subscription = data.get('subscription')
    try:
        subject = "Your subscription on Vietnamese Text Summarizer has been changed to "+subscription
        body = "Dear my lovely user!\nWe are pleased to inform you that your subscription has been successfully upgraded to "+subscription+" plan.\nThank you for choosing Vietnamese Text Summarizer. We hope you enjoy your new subscription!" 
        em = EmailMessage()
        em['From'] = email_sender
        em['To'] = email
        em['Subject']= subject
        em.set_content(body)
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com',465, context=context) as smtp:
            smtp.login(email_sender, email_password)
            smtp.sendmail(email_sender, email, em.as_string())
        
        return jsonify({'message': "OTP sent successfully!"}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500