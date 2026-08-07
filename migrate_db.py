import sqlite3
conn = sqlite3.connect('gym.db')
cur = conn.cursor()

# --- member_details: stores extended info for members ---
cur.execute("""
CREATE TABLE IF NOT EXISTS member_details (
    username TEXT PRIMARY KEY,
    gender TEXT DEFAULT 'Not Set',
    age INTEGER DEFAULT 0,
    height REAL DEFAULT 0,
    weight REAL DEFAULT 0,
    blood_group TEXT DEFAULT 'N/A',
    emergency_contact TEXT DEFAULT 'N/A',
    medical_conditions TEXT DEFAULT 'None',
    allergies TEXT DEFAULT 'None',
    injuries TEXT DEFAULT 'None',
    doctor_notes TEXT DEFAULT 'None',
    goal TEXT DEFAULT 'General Fitness',
    goal_weight REAL DEFAULT 0,
    body_fat REAL DEFAULT 0,
    bmi REAL DEFAULT 0,
    FOREIGN KEY(username) REFERENCES info(username)
)
""")

# --- payments: stores payment history ---
cur.execute("""
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Paid',
    description TEXT DEFAULT 'Monthly Subscription',
    FOREIGN KEY(username) REFERENCES info(username)
)
""")

# --- trainer_sessions: stores PT session bookings ---
cur.execute("""
CREATE TABLE IF NOT EXISTS trainer_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_username TEXT NOT NULL,
    trainer_username TEXT NOT NULL,
    session_date TEXT NOT NULL,
    session_time TEXT NOT NULL,
    status TEXT DEFAULT 'Booked',
    FOREIGN KEY(member_username) REFERENCES info(username)
)
""")

# --- membership: stores plan details per member ---
cur.execute("""
CREATE TABLE IF NOT EXISTS membership (
    username TEXT PRIMARY KEY,
    plan_name TEXT DEFAULT 'Basic',
    price REAL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'Active',
    auto_renewal INTEGER DEFAULT 1,
    FOREIGN KEY(username) REFERENCES info(username)
)
""")

# --- attendance: daily check-in records ---
cur.execute("""
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'Present',
    UNIQUE(username, date),
    FOREIGN KEY(username) REFERENCES info(username)
)
""")

conn.commit()

# --- Seed sample data for member_1 and member_1@gmail.com ---
for uname in ['member_1', 'member_1@gmail.com']:
    # member_details
    cur.execute("""
    INSERT OR IGNORE INTO member_details(username, gender, age, height, weight, blood_group, emergency_contact, goal, goal_weight, body_fat, bmi)
    VALUES(?, 'Male', 25, 178, 72, 'O+', '+1-999888777', 'Weight Loss / Muscle Gain', 75, 14.0, 22.7)
    """, (uname,))

    # payments
    cur.execute("SELECT COUNT(*) FROM payments WHERE username = ?", (uname,))
    if cur.fetchone()[0] == 0:
        cur.execute("INSERT INTO payments(username, amount, date, status, description) VALUES(?, 3000, '2026-07-01', 'Paid', 'Monthly Subscription')", (uname,))
        cur.execute("INSERT INTO payments(username, amount, date, status, description) VALUES(?, 3000, '2026-06-01', 'Paid', 'Monthly Subscription')", (uname,))
        cur.execute("INSERT INTO payments(username, amount, date, status, description) VALUES(?, 3000, '2026-05-01', 'Paid', 'Monthly Subscription')", (uname,))

    # membership
    cur.execute("""
    INSERT OR IGNORE INTO membership(username, plan_name, price, start_date, end_date, status, auto_renewal)
    VALUES(?, 'Premium', 15000, '2025-12-01', '2026-12-01', 'Active', 1)
    """, (uname,))

    # trainer session
    cur.execute("SELECT COUNT(*) FROM trainer_sessions WHERE member_username = ?", (uname,))
    if cur.fetchone()[0] == 0:
        cur.execute("""
        INSERT INTO trainer_sessions(member_username, trainer_username, session_date, session_time, status)
        VALUES(?, 'trainer_1', '2026-08-02', '5:00 PM', 'Booked')
        """, (uname,))

    # attendance (last 30 days, miss 4 random days)
    from datetime import date, timedelta
    import random
    missed = {5, 10, 18, 24}
    today = date.today()
    for i in range(30, 0, -1):
        d = today - timedelta(days=i)
        status = 'Absent' if (i in missed) else 'Present'
        cur.execute("INSERT OR IGNORE INTO attendance(username, date, status) VALUES(?, ?, ?)", (uname, d.isoformat(), status))

conn.commit()
conn.close()
print("Database migration and seeding complete!")
