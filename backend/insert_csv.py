import pandas as pd
import psycopg2

# ==========================================
# LOAD CLEANED CSV
# ==========================================

df = pd.read_csv("output/cleaned_transactions.csv")

print("Total rows to insert:", len(df))

# ==========================================
# CONNECT TO POSTGRESQL
# ==========================================

conn = psycopg2.connect(
    host="localhost",
    database="cashflow",
    user="postgres",
    password="shubh123",   # change this
    port="5432"
)

cur = conn.cursor()

# ==========================================
# CREATE TABLE (IF NOT EXISTS)
# ==========================================

cur.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    date DATE,
    description TEXT,
    amount FLOAT,
    category TEXT
);
""")

conn.commit()

# ==========================================
# INSERT DATA
# ==========================================

insert_query = """
INSERT INTO transactions (date, description, amount, category)
VALUES (%s, %s, %s, %s);
"""

for _, row in df.iterrows():

    cur.execute(insert_query, (
        row["Date"],
        row["Description"],
        row["Amount"],
        row["Category"]
    ))

conn.commit()

print("✅ Data inserted successfully into PostgreSQL!")

# ==========================================
# CLOSE CONNECTION
# ==========================================

cur.close()
conn.close()