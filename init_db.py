import os
import sqlite3
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

def get_db():
    if DATABASE_URL and (DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://")):
        import psycopg2
        url = DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        conn = psycopg2.connect(url)
        return conn, "postgres"
    else:
        db_path = os.path.join(os.path.dirname(__file__), "gym.db")
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn, "sqlite"

def init_db():
    conn, db_type = get_db()
    cursor = conn.cursor()
    print(f"Initializing database ({db_type})...")

    auto_id_type = "SERIAL" if db_type == "postgres" else "INTEGER PRIMARY KEY AUTOINCREMENT"
    pk_auto_id = "id SERIAL PRIMARY KEY" if db_type == "postgres" else "id INTEGER PRIMARY KEY AUTOINCREMENT"
    param = "%s" if db_type == "postgres" else "?"

    # 1. info table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS info (
        username VARCHAR(200) PRIMARY KEY,
        password VARCHAR(500),
        name VARCHAR(100),
        prof INT,
        street VARCHAR(100),
        city VARCHAR(50),
        phone VARCHAR(32),
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. plans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS plans (
        name VARCHAR(100),
        exercise VARCHAR(100),
        sets INT,
        reps INT,
        PRIMARY KEY (name, exercise)
    );
    """)

    # 3. receps table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS receps (
        username VARCHAR(200) PRIMARY KEY REFERENCES info(username) ON DELETE CASCADE
    );
    """)

    # 4. trainors table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trainors (
        username VARCHAR(200) PRIMARY KEY REFERENCES info(username) ON DELETE CASCADE
    );
    """)

    # 5. members table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS members (
        username VARCHAR(200) PRIMARY KEY REFERENCES info(username) ON DELETE CASCADE,
        plan VARCHAR(100),
        trainor VARCHAR(200) REFERENCES trainors(username) ON DELETE SET NULL
    );
    """)

    # 6. progress table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS progress (
        username VARCHAR(200) REFERENCES members(username) ON DELETE CASCADE,
        date DATE,
        daily_result VARCHAR(200),
        rate INT,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (username, date)
    );
    """)

    # 7. equip table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS equip (
        name VARCHAR(100) PRIMARY KEY,
        count INT
    );
    """)

    # 8. member_details table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS member_details (
        username VARCHAR(200) PRIMARY KEY REFERENCES info(username) ON DELETE CASCADE,
        gender VARCHAR(50) DEFAULT 'Not Set',
        age INT DEFAULT 0,
        height NUMERIC DEFAULT 0,
        weight NUMERIC DEFAULT 0,
        blood_group VARCHAR(20) DEFAULT 'N/A',
        emergency_contact VARCHAR(100) DEFAULT 'N/A',
        medical_conditions TEXT DEFAULT 'None',
        allergies TEXT DEFAULT 'None',
        injuries TEXT DEFAULT 'None',
        doctor_notes TEXT DEFAULT 'None',
        goal VARCHAR(200) DEFAULT 'General Fitness',
        goal_weight NUMERIC DEFAULT 0,
        body_fat NUMERIC DEFAULT 0,
        bmi NUMERIC DEFAULT 0
    );
    """)

    # 9. payments table
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS payments (
        {pk_auto_id},
        username VARCHAR(200) NOT NULL REFERENCES info(username) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        date VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Paid',
        description VARCHAR(200) DEFAULT 'Monthly Subscription'
    );
    """)

    # 10. trainer_sessions table
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS trainer_sessions (
        {pk_auto_id},
        member_username VARCHAR(200) NOT NULL REFERENCES info(username) ON DELETE CASCADE,
        trainer_username VARCHAR(200) NOT NULL,
        session_date VARCHAR(50) NOT NULL,
        session_time VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Booked'
    );
    """)

    # 11. membership table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS membership (
        username VARCHAR(200) PRIMARY KEY REFERENCES info(username) ON DELETE CASCADE,
        plan_name VARCHAR(100) DEFAULT 'Basic',
        price NUMERIC DEFAULT 0,
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Active',
        auto_renewal INT DEFAULT 1
    );
    """)

    # 12. attendance table
    cursor.execute(f"""
    CREATE TABLE IF NOT EXISTS attendance (
        {pk_auto_id},
        username VARCHAR(200) NOT NULL REFERENCES info(username) ON DELETE CASCADE,
        date VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Present',
        UNIQUE(username, date)
    );
    """)

    conn.commit()

    # Helper function to insert if missing
    def insert_if_missing(query_check, check_params, query_insert, insert_params):
        if db_type == "postgres":
            q_check = query_check.replace("?", "%s")
            q_ins = query_insert.replace("?", "%s")
        else:
            q_check = query_check
            q_ins = query_insert
            
        cursor.execute(q_check, check_params)
        if not cursor.fetchone():
            cursor.execute(q_ins, insert_params)
            conn.commit()

    # Seed Admin User
    insert_if_missing(
        "SELECT username FROM info WHERE username = ?", ('eswar_123',),
        "INSERT INTO info(username, password, name, prof, street, city, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ('eswar_123', '$5$rounds=535000$ajR8hAzSoSF.NhEs$MaLn1dbnXq9eu2W5Ge3c1ScAS9960yLBFv3aU9zaxc0', 'Parameswar K', 1, 'Adarshnagar', 'Anantapur', '9666585361')
    )

    # Seed Trainer User
    insert_if_missing(
        "SELECT username FROM info WHERE username = ?", ('trainer_1',),
        "INSERT INTO info(username, password, name, prof, street, city, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ('trainer_1', '$5$rounds=535000$10dJceUs5O15T8Ip$vt8cv8pGih9RRNOAkWoUbAbcBD9i4u/y.WP1XrGwdUB', 'Trainer One', 3, 'Gym Street', 'Fitness City', '9876543210')
    )
    insert_if_missing(
        "SELECT username FROM trainors WHERE username = ?", ('trainer_1',),
        "INSERT INTO trainors(username) VALUES (?)",
        ('trainer_1',)
    )

    # Seed Receptionist User
    insert_if_missing(
        "SELECT username FROM info WHERE username = ?", ('recep_1',),
        "INSERT INTO info(username, password, name, prof, street, city, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ('recep_1', '$5$rounds=535000$10dJceUs5O15T8Ip$vt8cv8pGih9RRNOAkWoUbAbcBD9i4u/y.WP1XrGwdUB', 'Receptionist One', 2, 'Counter Desk', 'Fitness City', '9876543211')
    )
    insert_if_missing(
        "SELECT username FROM receps WHERE username = ?", ('recep_1',),
        "INSERT INTO receps(username) VALUES (?)",
        ('recep_1',)
    )

    # Seed Plans
    insert_if_missing(
        "SELECT name FROM plans WHERE name = ? AND exercise = ?", ('Gold Plan', 'Squats'),
        "INSERT INTO plans(name, exercise, sets, reps) VALUES (?, ?, ?, ?)",
        ('Gold Plan', 'Squats', 3, 12)
    )
    insert_if_missing(
        "SELECT name FROM plans WHERE name = ? AND exercise = ?", ('Gold Plan', 'Bench Press'),
        "INSERT INTO plans(name, exercise, sets, reps) VALUES (?, ?, ?, ?)",
        ('Gold Plan', 'Bench Press', 3, 10)
    )
    insert_if_missing(
        "SELECT name FROM plans WHERE name = ? AND exercise = ?", ('Silver Plan', 'Pushups'),
        "INSERT INTO plans(name, exercise, sets, reps) VALUES (?, ?, ?, ?)",
        ('Silver Plan', 'Pushups', 3, 15)
    )

    # Seed Member User
    insert_if_missing(
        "SELECT username FROM info WHERE username = ?", ('member_1',),
        "INSERT INTO info(username, password, name, prof, street, city, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ('member_1', '$5$rounds=535000$10dJceUs5O15T8Ip$vt8cv8pGih9RRNOAkWoUbAbcBD9i4u/y.WP1XrGwdUB', 'Member One', 4, 'User Lane', 'Fitness City', '9876543212')
    )
    insert_if_missing(
        "SELECT username FROM members WHERE username = ?", ('member_1',),
        "INSERT INTO members(username, plan, trainor) VALUES (?, ?, ?)",
        ('member_1', 'Gold Plan', 'trainer_1')
    )

    # Seed member_details
    insert_if_missing(
        "SELECT username FROM member_details WHERE username = ?", ('member_1',),
        "INSERT INTO member_details(username, gender, age, height, weight, blood_group, emergency_contact, goal, goal_weight, body_fat, bmi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ('member_1', 'Male', 25, 178, 72, 'O+', '+1-999888777', 'Weight Loss / Muscle Gain', 75, 14.0, 22.7)
    )

    # Seed membership
    insert_if_missing(
        "SELECT username FROM membership WHERE username = ?", ('member_1',),
        "INSERT INTO membership(username, plan_name, price, start_date, end_date, status, auto_renewal) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ('member_1', 'Premium', 15000, '2025-12-01', '2026-12-01', 'Active', 1)
    )

    # Seed Equipment
    insert_if_missing(
        "SELECT name FROM equip WHERE name = ?", ('Treadmill',),
        "INSERT INTO equip(name, count) VALUES (?, ?)",
        ('Treadmill', 5)
    )
    insert_if_missing(
        "SELECT name FROM equip WHERE name = ?", ('Dumbbells',),
        "INSERT INTO equip(name, count) VALUES (?, ?)",
        ('Dumbbells', 10)
    )
    insert_if_missing(
        "SELECT name FROM equip WHERE name = ?", ('Stationary Bike',),
        "INSERT INTO equip(name, count) VALUES (?, ?)",
        ('Stationary Bike', 3)
    )

    cursor.close()
    conn.close()
    print("Database initialization and seeding complete!")

if __name__ == "__main__":
    init_db()
