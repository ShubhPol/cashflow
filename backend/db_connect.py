import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        database="cashflow",   # your database
        user="postgres",       # default username
        password="shubh123",  # change this
        port="5432"
    )

    cur = conn.cursor()
    cur.execute("SELECT version();")
    db_version = cur.fetchone()

    print("✅ Connected to PostgreSQL successfully!")
    print("Version:", db_version)

    cur.close()
    conn.close()

except Exception as e:
    print("❌ Connection failed")
    print(e)