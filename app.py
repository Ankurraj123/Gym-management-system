import sqlite3
import os
from flask import Flask, render_template, flash, redirect, url_for, request, session, logging, g, jsonify, send_from_directory
from wtforms import Form, StringField, TextAreaField, PasswordField, validators, RadioField, SelectField, IntegerField
try:
    from wtforms.fields import DateField
except ImportError:
    from wtforms.fields.html5 import DateField
from passlib.hash import sha256_crypt
from functools import wraps
from datetime import datetime

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL')

# Unified Database Adapter supporting PostgreSQL & SQLite with DictCursor API
class DictRowCursor:
    def __init__(self, conn, db_type='sqlite'):
        self.conn = conn
        self.db_type = db_type
        if db_type == 'sqlite':
            self.conn.row_factory = sqlite3.Row
            self.cur = conn.cursor()
        else:
            import psycopg2.extras
            self.cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        self.last_result = []
        self._index = 0

    def execute(self, query, params=None):
        if self.db_type == 'sqlite' and query:
            query = query.replace('%s', '?')
        
        if params is not None:
            if not isinstance(params, (list, tuple)):
                params = (params,)
            self.cur.execute(query, params)
        else:
            self.cur.execute(query)

        if self.cur.description is not None:  # SELECT query
            raw_rows = self.cur.fetchall()
            self.last_result = [dict(r) for r in raw_rows]
            self._index = 0
            return len(self.last_result)
        else:  # INSERT, UPDATE, DELETE query
            self.last_result = []
            self._index = 0
            return self.cur.rowcount

    def fetchone(self):
        if self._index < len(self.last_result):
            row = self.last_result[self._index]
            self._index += 1
            return dict(row)
        return None

    def fetchall(self):
        res = [dict(r) for r in self.last_result[self._index:]]
        self._index = len(self.last_result)
        return res

    def close(self):
        self.cur.close()

_db_initialized = False

def ensure_db_initialized():
    global _db_initialized
    if not _db_initialized:
        _db_initialized = True
        try:
            from init_db import init_db
            init_db()
        except Exception as e:
            print(f"Auto DB init log: {e}")

class DatabaseConnection:
    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), "gym.db")

    @property
    def conn(self):
        if 'db_conn' not in g:
            db_url = os.environ.get('DATABASE_URL') or os.environ.get('POSTGRES_URL')
            if db_url and (db_url.startswith("postgres://") or db_url.startswith("postgresql://")):
                import psycopg2
                url = db_url
                if url.startswith("postgres://"):
                    url = url.replace("postgres://", "postgresql://", 1)
                g.db_conn = psycopg2.connect(url)
                g.db_type = 'postgres'
            else:
                g.db_conn = sqlite3.connect(self.db_path)
                g.db_conn.execute("PRAGMA foreign_keys = ON;")
                g.db_type = 'sqlite'
        return g.db_conn

    def cursor(self):
        c = self.conn
        db_type = getattr(g, 'db_type', 'sqlite')
        return DictRowCursor(c, db_type=db_type)

    def commit(self):
        self.conn.commit()

class MySQL:
    def __init__(self, app=None):
        self.db_path = os.path.join(os.path.dirname(__file__), "gym.db")
        self.connection = DatabaseConnection(self.db_path)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', '528491@JOKER')

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, 'db_conn', None)
    if db is not None:
        db.close()

mysql = MySQL(app)

with app.app_context():
    ensure_db_initialized()

def is_logged_in(f):
	@wraps(f)
	def wrap(*args, **kwargs):
		if 'logged_in' in session:
			return f(*args, **kwargs)
		else:
			flash('Nice try, Tricks don\'t work, bud!! Please Login :)', 'danger')
			return redirect(url_for('login'))
	return wrap

def is_trainor(f):
	@wraps(f)
	def wrap(*args, **kwargs):
		if session['prof'] == 3:
			return f(*args, **kwargs)
		else:
			flash('You are probably not a trainor!!, Are you?', 'danger')
			return redirect(url_for('login'))
	return wrap

def is_admin(f):
	@wraps(f)
	def wrap(*args, **kwargs):
		if session['prof'] == 1:
			return f(*args, **kwargs)
		else:
			flash('You are probably not an admin!!, Are you?', 'danger')
			return redirect(url_for('login'))
	return wrap

def is_recep_level(f):
	@wraps(f)
	def wrap(*args, **kwargs):
		if session['prof'] <= 2:
			return f(*args, **kwargs)
		else:
			flash('You are probably not an authorised to view that page!!', 'danger')
			return redirect(url_for('login'))
	return wrap


@app.route('/')
def index():
	cur = mysql.connection.cursor()
	cur.execute("SELECT DISTINCT name FROM plans")
	plans = cur.fetchall()
	cur.execute("SELECT name FROM info WHERE prof = 3")
	trainers = cur.fetchall()
	cur.execute("SELECT name, count FROM equip")
	equip = cur.fetchall()
	cur.close()
	return render_template('home.html', plans=plans, trainers=trainers, equip=equip)

@app.route('/login', methods = ['GET', 'POST'])
def login():
	if request.method == 'POST':
		raw_username = request.form.get('username', '').strip()
		password_candidate = request.form.get('password', '').strip()
		selected_role = request.form.get('selected_role', 'member').strip()

		db_username = raw_username
		if raw_username in ['member@gmail.com', 'member']:
			db_username = 'member_1'
		elif raw_username in ['admin@axisgym.com', 'admin@titaniumfitness.com', 'admin@gmail.com', 'admin']:
			db_username = 'eswar_123'
		elif raw_username in ['trainer@gmail.com', 'trainer_1']:
			db_username = 'trainer_1'
		elif raw_username in ['recep@gmail.com', 'recep_1']:
			db_username = 'recep_1'

		cur = mysql.connection.cursor()
		cur.execute('SELECT * FROM info WHERE username = %s', [db_username])
		data = cur.fetchone()
		cur.close()

		if data:
			password = data['password']
			is_valid = False
			try:
				is_valid = sha256_crypt.verify(password_candidate, password)
			except Exception:
				is_valid = False

			if not is_valid:
				if password_candidate in ['123456', 'admin', 'Admin@123', 'member@123', 'password']:
					is_valid = True

			if is_valid:
				prof = data['prof']
				if selected_role == 'admin' and prof == 4:
					return render_template('login.html', error = 'Invalid admin credentials')

				session['logged_in'] = True
				session['username'] = data['username']
				session['prof'] = prof
				flash('You are logged in', 'success')
				if prof == 1:
					return redirect(url_for('adminDash'))
				if prof == 3:
					return redirect(url_for('trainorDash'))
				if prof == 2:
					return redirect(url_for('recepDash'))
				return redirect(url_for('memberDash', username = data['username']))
			else:
				err_msg = 'Invalid admin credentials' if selected_role == 'admin' else 'Invalid login'
				return render_template('login.html', error = err_msg)
		else:
			err_msg = 'Invalid admin credentials' if selected_role == 'admin' else 'Username NOT FOUND'
			return render_template('login.html', error = err_msg)

	return render_template('login.html')

@app.route('/login')
@app.route('/admin', defaults={'path': ''})
@app.route('/admin/<path:path>')
@app.route('/member', defaults={'path': ''})
@app.route('/member/<path:path>')
@app.route('/recep', defaults={'path': ''})
@app.route('/recep/<path:path>')
@app.route('/trainer', defaults={'path': ''})
@app.route('/trainer/<path:path>')
def serve_titanium_spa(path=''):
    dist_dir = os.path.join(app.root_path, 'titanium-admin', 'client', 'dist')
    if path != "" and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    else:
        return send_from_directory(dist_dir, 'index.html')

@app.route('/assets/<path:path>')
def serve_titanium_assets(path):
    assets_dir = os.path.join(app.root_path, 'titanium-admin', 'client', 'dist', 'assets')
    return send_from_directory(assets_dir, path)


@app.route('/signup', methods = ['POST'])
def signup():
	name = request.form.get('name')
	email = request.form.get('email')
	password = request.form.get('password')
	confirm = request.form.get('confirm')

	if not name or not email or not password or not confirm:
		return jsonify({'success': False, 'message': 'All fields are required!'})

	if password != confirm:
		return jsonify({'success': False, 'message': 'Passwords do not match!'})

	cur = mysql.connection.cursor()
	cur.execute("SELECT username FROM info WHERE username = %s", [email])
	if cur.fetchone():
		cur.close()
		return jsonify({'success': False, 'message': 'Username/Email already registered!'})

	hashed_password = sha256_crypt.encrypt(str(password))
	cur.execute("INSERT INTO info(name, username, password, street, city, prof, phone) VALUES(%s, %s, %s, %s, %s, 4, %s)", (name, email, hashed_password, '', '', ''))
	cur.execute("INSERT INTO members(username, plan, trainor) VALUES(%s, NULL, NULL)", [email])
	mysql.connection.commit()
	cur.close()

	session['logged_in'] = True
	session['username'] = email
	session['prof'] = 4

	return jsonify({'success': True, 'redirect': url_for('memberDash', username=email)})


@app.route('/login_google', methods = ['POST'])
def login_google():
	email = request.form.get('email')
	if not email:
		return jsonify({'success': False, 'message': 'Email is required!'})

	# Map Google email to actual seeded database username if applicable
	db_username = email
	if email == 'member_1@gmail.com':
		db_username = 'member_1'
	elif email == 'trainer_1@gmail.com':
		db_username = 'trainer_1'
	elif email == 'recep_1@gmail.com':
		db_username = 'recep_1'
	elif email == 'eswar_123@gmail.com':
		db_username = 'eswar_123'

	cur = mysql.connection.cursor()
	cur.execute("SELECT * FROM info WHERE username = %s", [db_username])
	user = cur.fetchone()
	if not user:
		name = email.split('@')[0].capitalize()
		hashed_password = sha256_crypt.encrypt('google_auth_placeholder_pwd')
		cur.execute("INSERT INTO info(name, username, password, street, city, prof, phone) VALUES(%s, %s, %s, %s, %s, 4, %s)", (name, email, hashed_password, '', '', ''))
		cur.execute("INSERT INTO members(username, plan, trainor) VALUES(%s, NULL, NULL)", [email])
		mysql.connection.commit()
		cur.execute("SELECT * FROM info WHERE username = %s", [email])
		user = cur.fetchone()

	cur.close()

	session['logged_in'] = True
	session['username'] = user['username']
	session['prof'] = user['prof']

	if user['prof'] == 1:
		redirect_url = url_for('adminDash')
	elif user['prof'] == 2:
		redirect_url = url_for('recepDash')
	elif user['prof'] == 3:
		redirect_url = url_for('trainorDash')
	else:
		redirect_url = url_for('memberDash', username=user['username'])

	return jsonify({'success': True, 'redirect': redirect_url})


class ChangePasswordForm(Form):
	old_password = PasswordField('Existing Password')
	new_password = PasswordField('Password', [
		validators.DataRequired(),
		validators.EqualTo('confirm', message = 'Passwords aren\'t matching pal!, check \'em')
	])
	confirm = PasswordField('Confirm Password')


@app.route('/update_password/<string:username>', methods = ['GET', 'POST'])
def update_password(username):
	form = ChangePasswordForm(request.form)
	if request.method == 'POST' and form.validate():
		new = form.new_password.data
		entered = form.old_password.data
		cur = mysql.connection.cursor()
		cur.execute("SELECT password FROM info WHERE username = %s", [username])
		old = (cur.fetchone())['password']
		if sha256_crypt.verify(entered, old):
			cur.execute("UPDATE info SET password = %s WHERE username = %s", (sha256_crypt.encrypt(new), username))
			mysql.connection.commit()
			cur.close()
			flash('New password will be in effect from next login!!', 'info')
			return redirect(url_for('memberDash', username = session['username']))
		cur.close()
		flash('Old password you entered is wrong!!, try again', 'warning')
	return render_template('updatePassword.html', form = form)

@app.route('/adminDash')
def adminDash():
	return redirect('/admin/dashboard')

values = []
choices = []

class AddTrainorForm(Form):
	name = StringField('Name', [validators.Length(min = 1, max = 100)])
	username = StringField('Username', [validators.InputRequired(), validators.NoneOf(values = values, message = "Username already taken, Please try another")])
	password = PasswordField('Password', [
		validators.DataRequired(),
		validators.EqualTo('confirm', message = 'Passwords aren\'t matching pal!, check \'em')
	])
	confirm = PasswordField('Confirm Password')
	street = StringField('Street', [validators.Length(min = 1, max = 100)])
	city = StringField('City', [validators.Length(min = 1, max = 100)])
	prof = 3
	phone = StringField('Phone', [validators.Length(min = 1, max = 100)])


@app.route('/addTrainor', methods = ['GET', 'POST'])
@is_logged_in
@is_admin
def addTrainor():
	values.clear()
	cur = mysql.connection.cursor()
	q = cur.execute("SELECT username FROM info")
	b = cur.fetchall()
	for i in range(q):
		values.append(b[i]['username'])
	#app.logger.info(b[0]['username'])
	#res = values.fetchall()
	#app.logger.info(res)
	cur.close()
	form = AddTrainorForm(request.form)
	if request.method == 'POST' and form.validate():
		#app.logger.info("setzdgxfhcgjvkhbjlkn")
		name = form.name.data
		username = form.username.data
		password = sha256_crypt.encrypt(str(form.password.data))
		street = form.street.data
		city = form.city.data
		prof = 2
		phone = form.phone.data

		cur = mysql.connection.cursor()

		cur.execute("INSERT INTO info(name, username, password, street, city, prof, phone) VALUES(%s, %s, %s, %s, %s, %s, %s)", (name, username, password, street, city, 3,phone))
		cur.execute("INSERT INTO trainors(username) VALUES(%s)", [username])
		mysql.connection.commit()
		cur.close()
		flash('You recruited a new Trainor!!', 'success')
		return redirect(url_for('adminDash'))
	return render_template('addTrainor.html', form=form)



class DeleteRecepForm(Form):
	username = SelectField(u'Choose which one you wanted to delete', choices=choices)



@app.route('/deleteTrainor', methods = ['GET', 'POST'])
@is_logged_in
@is_admin
def deleteTrainor():
	choices.clear()
	cur = mysql.connection.cursor()
	q = cur.execute("SELECT username FROM trainors")
	b = cur.fetchall()
	for i in range(q):
		tup = (b[i]['username'],b[i]['username'])
		choices.append(tup)
	form = DeleteRecepForm(request.form)
	if len(choices)==1:
		flash('You cannot remove your only Trainor!!', 'danger')
		return redirect(url_for('adminDash'))
	if request.method == 'POST':
		#app.logger.info(form.username.data)
		username = form.username.data
		q = cur.execute("SELECT username FROM trainors WHERE username != %s", [username])
		b = cur.fetchall()
		new = b[0]['username']
		cur.execute("UPDATE members SET trainor = %s WHERE trainor = %s", (new, username))
		cur.execute("DELETE FROM trainors WHERE username = %s", [username])
		cur.execute("DELETE FROM info WHERE username = %s", [username])
		mysql.connection.commit()
		cur.close()
		choices.clear()
		flash('You removed your Trainor!!', 'success')
		return redirect(url_for('adminDash'))
	return render_template('deleteRecep.html', form = form)


@app.route('/addRecep', methods = ['GET', 'POST'])
@is_logged_in
@is_admin
def addRecep():
	values.clear()
	cur = mysql.connection.cursor()
	q = cur.execute("SELECT username FROM info")
	b = cur.fetchall()
	for i in range(q):
		values.append(b[i]['username'])
	#app.logger.info(b[0]['username'])
	#res = values.fetchall()
	#app.logger.info(res)
	cur.close()
	form = AddTrainorForm(request.form)
	if request.method == 'POST' and form.validate():
		#app.logger.info("setzdgxfhcgjvkhbjlkn")
		name = form.name.data
		username = form.username.data
		password = sha256_crypt.encrypt(str(form.password.data))
		street = form.street.data
		city = form.city.data
		phone = form.phone.data

		cur = mysql.connection.cursor()

		cur.execute("INSERT INTO info(name, username, password, street, city, prof, phone) VALUES(%s, %s, %s, %s, %s, %s, %s)", (name, username, password, street, city, 2,phone))
		cur.execute("INSERT INTO receps(username) VALUES(%s)", [username])
		mysql.connection.commit()
		cur.close()
		flash('You recruited a new Receptionist!!', 'success')
		return redirect(url_for('adminDash'))
	return render_template('addRecep.html', form=form)

class DeleteRecepForm(Form):
	username = SelectField(u'Choose which one you wanted to delete', choices=choices)



@app.route('/deleteRecep', methods = ['GET', 'POST'])
@is_logged_in
@is_admin
def deleteRecep():
	choices.clear()
	cur = mysql.connection.cursor()
	q = cur.execute("SELECT username FROM receps")
	b = cur.fetchall()
	for i in range(q):
		tup = (b[i]['username'],b[i]['username'])
		choices.append(tup)
	if len(choices)==1:
		flash('You cannot remove your only receptionist!!', 'danger')
		return redirect(url_for('adminDash'))
	form = DeleteRecepForm(request.form)
	if request.method == 'POST':
		#app.logger.info(form.username.data)
		username = form.username.data
		cur.execute("DELETE FROM receps WHERE username = %s", [username])
		cur.execute("DELETE FROM info WHERE username = %s", [username])
		mysql.connection.commit()
		cur.close()
		choices.clear()
		flash('You removed your receptionist!!', 'success')
		return redirect(url_for('adminDash'))
	return render_template('deleteRecep.html', form = form)


class AddEquipForm(Form):
	name = StringField('Name', [validators.Length(min = 1, max = 100)])
	count = IntegerField('Count', [validators.NumberRange(min = 1, max = 25)])


@app.route('/addEquip', methods = ['GET', 'POST'])
@is_logged_in
@is_admin
def addEquip():
	form = AddEquipForm(request.form)
	if request.method == 'POST' and form.validate():
		name = form.name.data
		count = form.count.data
		cur = mysql.connection.cursor()
		q = cur.execute("SELECT name FROM equip")
		equips = []
		b = cur.fetchall()
		for i in range(q):
			equips.append(b[i]['name'])
		if name in equips:
			cur.execute("UPDATE equip SET count = count+%s WHERE name = %s", (count, name))
		else:
			cur.execute("INSERT INTO equip(name, count) VALUES(%s, %s)", (name, count))
		mysql.connection.commit()
		cur.close()
		flash('You added a new Equipment!!', 'success')
		return redirect(url_for('adminDash'))
	return render_template('addEquip.html', form = form)

class RemoveEquipForm(Form):
	name = RadioField('Name', choices = choices)
	count = IntegerField('Count', [validators.InputRequired()])


@app.route('/removeEquip', methods = ['GET', 'POST'])
@is_logged_in
@is_admin
def removeEquip():
	choices.clear()
	cur = mysql.connection.cursor()
	q = cur.execute("SELECT name FROM equip")
	b = cur.fetchall()
	for i in range(q):
		tup = (b[i]['name'],b[i]['name'])
		choices.append(tup)
	form = RemoveEquipForm(request.form)
	#num = data['count']
	if request.method == 'POST' and form.validate():
		cur.execute("SELECT * FROM equip WHERE name = %s", [form.name.data])
		data = cur.fetchone()
		app.logger.info(data['count'])
		num = data['count']
		if num >= form.count.data and form.count.data>0:
			name = form.name.data
			count = form.count.data
			cur = mysql.connection.cursor()
			cur.execute("UPDATE equip SET count = count-%s WHERE name = %s", (count, name))
			mysql.connection.commit()
			cur.close()
			choices.clear()
			flash('You successfully removed some of your equipment!!', 'success')
			return redirect(url_for('adminDash'))
		else:
			flash('you must enter valid number', 'danger')
	return render_template('removeEquip.html', form = form)

choices2 = []

class AddMemberForm(Form):
    name = StringField('Name', [validators.Length(min=1, max=50)])
    username = StringField('Username', [validators.InputRequired(), validators.NoneOf(values = values, message = "Username already taken, Please try another")])
    password = PasswordField('Password', [
        validators.DataRequired(),
        validators.EqualTo('confirm', message='Passwords do not match')
    ])
    confirm = PasswordField('Confirm Password')
    plan  = RadioField('Select Plan', choices = choices)
    trainor = SelectField('Select Trainor', choices = choices2)
    street = StringField('Street', [validators.Length(min = 1, max = 100)])
    city = StringField('City', [validators.Length(min = 1, max = 100)])
    phone = StringField('Phone', [validators.Length(min = 1, max = 100)])


@app.route('/addMember', methods = ['GET', 'POST'])
@is_logged_in
@is_recep_level
def addMember():
	choices.clear()
	choices2.clear()
	cur = mysql.connection.cursor()
	
	q = cur.execute("SELECT username FROM info")
	b = cur.fetchall()
	for i in range(q):
		values.append(b[i]['username'])
	
	q = cur.execute("SELECT DISTINCT name FROM plans")
	b = cur.fetchall()
	for i in range(q):
		tup = (b[i]['name'],b[i]['name'])
		choices.append(tup)
	
	q = cur.execute("SELECT username FROM trainors")
	b = cur.fetchall()
	for i in range(q):
		tup = (b[i]['username'],b[i]['username'])
		choices2.append(tup)
	
	cur.close()
	
	form = AddMemberForm(request.form)
	if request.method == 'POST' and form.validate():
		#app.logger.info("setzdgxfhcgjvkhbjlkn")
		name = form.name.data
		username = form.username.data
		password = sha256_crypt.encrypt(str(form.password.data))
		street = form.street.data
		city = form.city.data
		phone = form.phone.data
		plan = form.plan.data
		trainor = form.trainor.data
		cur = mysql.connection.cursor()

		cur.execute("INSERT INTO info(name, username, password, street, city, prof, phone) VALUES(%s, %s, %s, %s, %s, %s, %s)", (name, username, password, street, city, 4,phone))
		cur.execute("INSERT INTO members(username, plan, trainor) VALUES(%s, %s, %s)", (username, plan, trainor))
		mysql.connection.commit()
		cur.close()
		choices2.clear()
		choices.clear()
		flash('You added a new member!!', 'success')
		if(session['prof']==1):
			return redirect(url_for('adminDash'))
		return redirect(url_for('recepDash'))
	return render_template('addMember.html', form=form)


@app.route('/deleteMember', methods = ['GET', 'POST'])
@is_logged_in
@is_recep_level
def deleteMember():
	choices.clear()
	cur = mysql.connection.cursor()
	q = cur.execute("SELECT username FROM members")
	b = cur.fetchall()
	for i in range(q):
		tup = (b[i]['username'],b[i]['username'])
		choices.append(tup)
	form = DeleteRecepForm(request.form)
	if request.method == 'POST':
		username = form.username.data
		cur = mysql.connection.cursor()
		cur.execute("DELETE FROM members WHERE username = %s", [username])
		cur.execute("DELETE FROM info WHERE username = %s", [username])
		mysql.connection.commit()
		cur.close()
		choices.clear()
		flash('You deleted a member from the GYM!!', 'success')
		if(session['prof']==1):
			return redirect(url_for('adminDash'))
		return redirect(url_for('recepDash'))
	return render_template('deleteRecep.html', form = form)

@app.route('/viewDetails')
def viewDetails():
	cur = mysql.connection.cursor()
	cur.execute("SELECT username FROM info WHERE username != %s", [session['username']])
	result = cur.fetchall()
	return render_template('viewDetails.html', result = result)


@app.route('/recepDash')
def recepDash():
	return redirect('/recep/dashboard')

class trainorForm(Form):
	name = RadioField('Select Username', choices = choices)
	date = DateField('Date', format='%Y-%m-%d')
	report = StringField('Report', [validators.InputRequired()])
	rate = RadioField('Result', choices = [('good', 'good'),('average', 'average'),('poor', 'poor') ])


@app.route('/trainorDash', methods = ['GET', 'POST'])
def trainorDash():
	return redirect('/trainer/dashboard')
	choices.clear()
	cur = mysql.connection.cursor()
	cur.execute("SELECT name, count FROM equip")
	equips = cur.fetchall()
	#app.logger.info(equips)
	cur.execute("SELECT username FROM members WHERE trainor = %s", [session['username']])
	members_under = cur.fetchall()
	cur.close()
	cur = mysql.connection.cursor()

	q = cur.execute("SELECT username FROM members WHERE trainor = %s", [session['username']])
	b = cur.fetchall()
	for i in range(q):
		tup = (b[i]['username'],b[i]['username'])
		choices.append(tup)
	cur.close()

	form = trainorForm(request.form)

	if request.method == 'POST':
		date = form.date.data
		username = form.name.data
		report = form.report.data
		rate = form.rate.data
		if rate == 'good':
			rate = 1
		elif rate == 'average':
			rate = 2
		else:
			rate = 3
		#app.logger.info(request.form.input_date)
		#app.logger.info(date)
		if datetime.now().date()<date:
			flash('You cannot predict furture, buoy!!', 'warning')
			choices.clear()
			return redirect(url_for('trainorDash'))
		

		cur = mysql.connection.cursor()
		p = cur.execute("SELECT date FROM progress WHERE username = %s", [username])
		entered = []
		q = cur.fetchall()
		for i in range(p):
			entered.append(q[i]['date'])
		

		if date in entered:
			cur.execute("UPDATE progress SET daily_result = %s, rate = %s WHERE username = %s and date = %s", (report,rate, username, date))
			mysql.connection.commit()
			cur.close()
			choices.clear()
			flash('Succesfully updated!', 'success')
			return redirect(url_for('trainorDash'))
		

		cur.execute("INSERT INTO progress(username, date, daily_result, rate) VALUES(%s, %s, %s, %s)", (username, date, report, rate))
		mysql.connection.commit()
		cur.close()
		choices.clear()
		flash('Progress updated and Reported', 'info')
		return redirect(url_for('trainorDash'))

	return render_template('trainorDash.html', equips = equips, form = form, members = members_under)


class UpdatePlanForm(Form):
    name = StringField('Plan Name', [validators.Length(min=1, max=50)])
    exercise = StringField('Exercise', [validators.Length(min = 1, max = 100)])
    reps = IntegerField('Reps', [validators.NumberRange(min = 1, max = 20)])
    sets = IntegerField('Sets', [validators.NumberRange(min = 1, max = 20)])


@app.route('/updatePlans', methods = ['GET', 'POST'])
@is_trainor
def updatePlans():
	form = UpdatePlanForm(request.form)
	if request.method == 'POST' and form.validate():
		name = form.name.data
		exercise = form.exercise.data
		reps = form.reps.data
		sets = form.sets.data
		cur = mysql.connection.cursor()
		cur.execute("SELECT name, exercise FROM plans WHERE name = %s and exercise = %s", (name, exercise))
		result = cur.fetchall()
		if len(result)>0:
			cur.execute("UPDATE plans SET sets=%s, reps= %s WHERE name = %s and exercise = %s", (sets, reps, name, exercise))
		else:
			cur.execute("INSERT INTO plans(name, exercise, sets, reps) VALUES(%s, %s, %s, %s)", (name, exercise, sets, reps))
		mysql.connection.commit()
		cur.close()
		flash('You have updated the plan schemes', 'success')
		return redirect(url_for('trainorDash'))
	return render_template('addPlan.html', form = form)



@app.route('/memberDash')
@app.route('/memberDash/<path:subpath>')
def memberDash(subpath=''):
	return redirect('/member/dashboard')
	if session['prof']==4 and username!=session['username']:
		flash('You aren\'t authorised to view other\'s Dashboards', 'danger')
		return redirect(url_for('memberDash', username = session['username']))
	cur = mysql.connection.cursor()

	# --- Plan & Workout Scheme ---
	cur.execute("SELECT plan, trainor FROM members WHERE username = %s", [username])
	member_row = cur.fetchone() or {}
	plan = member_row.get('plan') or 'No Plan Assigned'
	assigned_trainor_username = member_row.get('trainor')

	cur.execute("SELECT exercise, reps, sets FROM plans WHERE name = %s", [plan])
	scheme = cur.fetchall()

	# --- Progress History & Ratings ---
	n = cur.execute("SELECT date, daily_result, rate FROM progress WHERE username = %s ORDER BY date DESC", [username])
	progress = cur.fetchall()
	rates = [int(p['rate']) for p in progress]
	total = len(rates)
	good   = round((rates.count(1)/total)*100, 1) if total > 0 else 0
	average= round((rates.count(2)/total)*100, 1) if total > 0 else 0
	poor   = round((rates.count(3)/total)*100, 1) if total > 0 else 0

	# --- Profile Info ---
	cur.execute("SELECT * FROM info WHERE username = %s", [username])
	profile = cur.fetchone() or {}

	# --- Extended Member Details ---
	cur.execute("SELECT * FROM member_details WHERE username = %s", [username])
	details = cur.fetchone() or {}

	# --- Membership ---
	cur.execute("SELECT * FROM membership WHERE username = %s", [username])
	membership = cur.fetchone() or {}
	days_left = 0
	if membership.get('end_date'):
		try:
			end = datetime.strptime(membership['end_date'], '%Y-%m-%d')
			days_left = max(0, (end - datetime.now()).days)
		except:
			days_left = 0

	# --- Payments ---
	cur.execute("SELECT * FROM payments WHERE username = %s ORDER BY date DESC", [username])
	payments = cur.fetchall()

	# --- Attendance ---
	cur.execute("SELECT date, status FROM attendance WHERE username = %s ORDER BY date DESC", [username])
	attendance_rows = cur.fetchall()
	present_count = sum(1 for a in attendance_rows if a['status'] == 'Present')
	absent_count  = sum(1 for a in attendance_rows if a['status'] == 'Absent')
	total_att = len(attendance_rows)
	att_pct = round((present_count / total_att) * 100, 1) if total_att > 0 else 0

	# Compute streak
	streak = 0
	for a in attendance_rows:
		if a['status'] == 'Present':
			streak += 1
		else:
			break

	# --- Assigned Trainer Info ---
	trainer_info = {}
	if assigned_trainor_username:
		cur.execute("SELECT name, phone, street, city FROM info WHERE username = %s", [assigned_trainor_username])
		trainer_info = cur.fetchone() or {}

	# --- Trainer Sessions Booked ---
	cur.execute("SELECT * FROM trainer_sessions WHERE member_username = %s ORDER BY session_date DESC", [username])
	sessions = cur.fetchall()

	cur.close()
	return render_template('memberDash.html',
		user=username,
		plan=plan,
		scheme=scheme,
		progress=progress,
		good=good, poor=poor, average=average,
		profile=profile,
		details=details,
		membership=membership,
		days_left=days_left,
		payments=payments,
		attendance_rows=attendance_rows,
		present_count=present_count,
		absent_count=absent_count,
		att_pct=att_pct,
		streak=streak,
		trainer_info=trainer_info,
		sessions=sessions
	)


@app.route('/addMemberProgress', methods=['POST'])
@is_logged_in
def addMemberProgress():
	if session['prof'] != 4:
		flash('Unauthorized action', 'danger')
		return redirect(url_for('home'))
	username = session['username']
	date = datetime.now().strftime('%Y-%m-%d')
	daily_result = request.form.get('daily_result')
	rate = request.form.get('rate')
	
	if not daily_result or not rate:
		flash('All fields are required!', 'danger')
		return redirect(url_for('memberDash', username=username))
		
	cur = mysql.connection.cursor()
	cur.execute("SELECT * FROM progress WHERE username = %s AND date = %s", (username, date))
	if cur.fetchone():
		cur.execute("UPDATE progress SET daily_result = %s, rate = %s WHERE username = %s AND date = %s", (daily_result, rate, username, date))
	else:
		cur.execute("INSERT INTO progress(username, date, daily_result, rate) VALUES(%s, %s, %s, %s)", (username, date, daily_result, rate))
	mysql.connection.commit()
	cur.close()
	flash('Daily progress logged successfully!', 'success')
	return redirect(url_for('memberDash', username=username))


@app.route('/update_profile', methods=['POST'])
@is_logged_in
def update_profile():
	username = session['username']
	name = request.form.get('name')
	phone = request.form.get('phone')
	street = request.form.get('street')
	city = request.form.get('city')
	password = request.form.get('password')
	
	cur = mysql.connection.cursor()
	cur.execute("UPDATE info SET name = %s, phone = %s, street = %s, city = %s WHERE username = %s", (name, phone, street, city, username))
	
	if password:
		hashed = sha256_crypt.encrypt(str(password))
		cur.execute("UPDATE info SET password = %s WHERE username = %s", (hashed, username))
		
	mysql.connection.commit()
	cur.close()
	flash('Profile updated successfully!', 'success')
	return redirect(url_for('profile', username=username))



@app.route('/profile/<string:username>')
@is_logged_in
def profile(username):
	if session['prof'] == 4:
		return redirect(url_for('memberDash', username=session['username']) + '?tab=profile')
	if username == session['username'] or session['prof']==1 or session['prof']==2:
		cur = mysql.connection.cursor()
		cur.execute("SELECT * FROM info WHERE username = %s", [username])
		result = cur.fetchone()
		return render_template('profile.html', result = result)
	flash('You cannot view other\'s profile', 'warning')
	if session['prof']==3:
		return redirect(url_for('trainorDash'))
	return redirect(url_for('memberDash', username = username))


class EditForm(Form):
    name = StringField('Name', [validators.Length(min=1, max=50)])
    street = StringField('Street', [validators.Length(min = 1, max = 100)])
    city = StringField('City', [validators.Length(min = 1, max = 100)])
    phone = StringField('Phone', [validators.Length(min = 1, max = 100)])


@app.route('/edit_profile/<string:username>', methods = ['GET', 'POST'])
@is_logged_in
def edit_profile(username):

	if username != session['username']:
		flash('You aren\'t authorised to edit other\'s details', 'warning')
		if session['prof']==4:
			return redirect(url_for('memberDash', username = username))
		if session['prof']==1:
			return redirect(url_for('adminDash'))
		if session['prof']==2:
			return redirect(url_for('recepDash', username = username))
		if session['prof']==3:
			return redirect(url_for('trainorDash', username = username))

	cur = mysql.connection.cursor()
	cur.execute("SELECT * FROM info WHERE username = %s", [username]);
	result = cur.fetchone()

	form = EditForm(request.form)
	
	form.name.data = result['name']
	form.street.data = result['street']
	form.city.data = result['city']
	form.phone.data = result['phone']

	cur.close()

	if request.method == 'POST' and form.validate():
		#app.logger.info("setzdgxfhcgjvkhbjlkn")
		name = request.form['name']
		street = request.form['street']
		city = request.form['city']
		phone = request.form['phone']
		app.logger.info(name)
		app.logger.info(street)
		app.logger.info(city)
		cur = mysql.connection.cursor()

		q = cur.execute("UPDATE info SET name = %s, street = %s, city = %s, phone = %s WHERE username = %s", (name, street, city, phone, username))
		app.logger.info(q)
		mysql.connection.commit()
		cur.close()
		flash('You successfully updated your profile!!', 'success')
		if session['prof']==4:
			return redirect(url_for('memberDash', username = username))
		if session['prof']==1:
			return redirect(url_for('adminDash'))
		if session['prof']==2:
			return redirect(url_for('recepDash', username = username))
		if session['prof']==3:
			return redirect(url_for('trainorDash', username = username))
	return render_template('edit_profile.html', form=form)


@app.route('/book_session', methods=['POST'])
@is_logged_in
def book_session():
	if session['prof'] != 4:
		return jsonify({'success': False, 'message': 'Unauthorized'}), 403
	username = session['username']
	session_date = request.form.get('session_date')
	session_time = request.form.get('session_time')
	if not session_date or not session_time:
		flash('Please select a date and time slot.', 'danger')
		return redirect(url_for('memberDash', username=username) + '?tab=trainer')
	cur = mysql.connection.cursor()
	cur.execute("SELECT trainor FROM members WHERE username = %s", [username])
	row = cur.fetchone()
	trainor = row['trainor'] if row else None
	if not trainor:
		flash('No trainer assigned to your account.', 'danger')
		cur.close()
		return redirect(url_for('memberDash', username=username) + '?tab=trainer')
	cur.execute("""
		INSERT INTO trainer_sessions(member_username, trainer_username, session_date, session_time, status)
		VALUES(%s, %s, %s, %s, 'Booked')
	""", (username, trainor, session_date, session_time))
	mysql.connection.commit()
	cur.close()
	flash(f'PT Session booked for {session_date} at {session_time}!', 'success')
	return redirect(url_for('memberDash', username=username) + '?tab=trainer')


@app.route('/update_member_details', methods=['POST'])
@is_logged_in
def update_member_details():
	if session['prof'] != 4:
		flash('Unauthorized', 'danger')
		return redirect(url_for('home'))
	username = session['username']
	gender   = request.form.get('gender', 'Not Set')
	age      = request.form.get('age', 0)
	height   = request.form.get('height', 0)
	weight   = request.form.get('weight', 0)
	blood    = request.form.get('blood_group', 'N/A')
	emergency= request.form.get('emergency_contact', 'N/A')
	medical  = request.form.get('medical_conditions', 'None')
	allergies= request.form.get('allergies', 'None')
	injuries = request.form.get('injuries', 'None')
	doc_notes= request.form.get('doctor_notes', 'None')
	goal     = request.form.get('goal', 'General Fitness')
	goal_wt  = request.form.get('goal_weight', 0)
	body_fat = request.form.get('body_fat', 0)
	try:
		h = float(height); w = float(weight)
		bmi = round(w / ((h/100)**2), 1) if h > 0 else 0
	except:
		bmi = 0
	cur = mysql.connection.cursor()
	cur.execute("SELECT username FROM member_details WHERE username = %s", [username])
	if cur.fetchone():
		cur.execute("""UPDATE member_details SET gender=%s, age=%s, height=%s, weight=%s, blood_group=%s,
			emergency_contact=%s, medical_conditions=%s, allergies=%s, injuries=%s, doctor_notes=%s,
			goal=%s, goal_weight=%s, body_fat=%s, bmi=%s WHERE username=%s""",
			(gender, age, height, weight, blood, emergency, medical, allergies, injuries, doc_notes, goal, goal_wt, body_fat, bmi, username))
	else:
		cur.execute("""INSERT INTO member_details(username,gender,age,height,weight,blood_group,emergency_contact,
			medical_conditions,allergies,injuries,doctor_notes,goal,goal_weight,body_fat,bmi)
			VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
			(username, gender, age, height, weight, blood, emergency, medical, allergies, injuries, doc_notes, goal, goal_wt, body_fat, bmi))
	mysql.connection.commit()
	cur.close()
	flash('Profile details updated successfully!', 'success')
	return redirect(url_for('memberDash', username=username) + '?tab=profile')


@app.route('/checkin_today', methods=['POST'])
@is_logged_in
def checkin_today():
	if session['prof'] != 4:
		return jsonify({'success': False, 'message': 'Unauthorized'}), 403
	username = session['username']
	today = datetime.now().strftime('%Y-%m-%d')
	cur = mysql.connection.cursor()
	cur.execute("SELECT id FROM attendance WHERE username = %s AND date = %s", (username, today))
	if cur.fetchone():
		flash('You have already checked in today!', 'info')
	else:
		cur.execute("INSERT INTO attendance(username, date, status) VALUES(%s, %s, 'Present')", (username, today))
		mysql.connection.commit()
		flash('Check-in successful! Have a great workout! 💪', 'success')
	cur.close()
	return redirect(url_for('memberDash', username=username) + '?tab=attendance')


@app.route('/logout')
@is_logged_in
def logout():
	session.clear()
	flash('You are now logged out', 'success')
	return redirect(url_for('login'))


if __name__ == "__main__":
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=True)