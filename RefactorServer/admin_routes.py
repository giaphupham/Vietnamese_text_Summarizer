from init import *
from decorators import *
from dateutil.relativedelta import relativedelta
from datetime import datetime, timezone

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
    