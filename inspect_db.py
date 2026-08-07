import sqlite3
conn = sqlite3.connect('gym.db')
cur = conn.cursor()

print("=== ALL MEMBERS ===")
for r in cur.execute("SELECT * FROM members").fetchall():
    print(r)

print("\n=== ALL PROGRESS ===")
for r in cur.execute("SELECT * FROM progress ORDER BY date DESC").fetchall():
    print(r)

print("\n=== INFO FOR MEMBER_1 ===")
for r in cur.execute("SELECT * FROM info WHERE username LIKE '%member%'").fetchall():
    print(r)

print("\n=== TRAINORS TABLE ===")
for r in cur.execute("SELECT i.name, i.phone, i.street, i.city, t.username FROM info i JOIN trainors t ON i.username = t.username").fetchall():
    print(r)

conn.close()
