from flask import request, jsonify, session, redirect, url_for
from init import supabase, ALLOW_ORIGINS
from functools import wraps

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
        if request_origin not in ALLOW_ORIGINS:
            response = jsonify({'error': 'Forbiden access!'})
            response.status_code = 403
            return response
        return f(*args, **kwargs)
    return decorated_function

