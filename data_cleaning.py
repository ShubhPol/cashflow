# ==========================================
# BANK TRANSACTION CSV CLEANING SYSTEM
# OUTPUT SAVED IN "output/" FOLDER
# ==========================================

import pandas as pd
import numpy as np
import os

# ==========================================
# LOAD CSV FILE
# ==========================================

input_file = "output/transactions.csv"
df = pd.read_csv(input_file)

# ==========================================
# ORIGINAL DATA
# ==========================================

print("\n================ ORIGINAL DATA ================\n")
print(df.head())
print("\nTOTAL ROWS BEFORE CLEANING:", len(df))

# ==========================================
# REMOVE EMPTY & DUPLICATES
# ==========================================

df.dropna(how='all', inplace=True)
df.drop_duplicates(inplace=True)

# ==========================================
# CLEAN COLUMN NAMES
# ==========================================

df.columns = df.columns.str.strip()

# ==========================================
# CLEAN STRING VALUES
# ==========================================

for col in df.select_dtypes(include='object'):
    df[col] = df[col].astype(str).str.strip()

# ==========================================
# OPTIONAL COLUMN STANDARDIZATION
# ==========================================

df.rename(columns={
    "Txn Date": "Date",
    "Transaction Date": "Date",
    "Transaction Amount": "Amount",
    "Narration": "Description"
}, inplace=True)

# ==========================================
# DATE CLEANING
# ==========================================

if "Date" in df.columns:
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df[df["Date"].notna()]

# ==========================================
# AMOUNT CLEANING
# ==========================================

if "Amount" in df.columns:
    df["Amount"] = (
        df["Amount"]
        .astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("₹", "", regex=False)
        .str.replace("Rs.", "", regex=False)
        .str.replace("INR", "", regex=False)
        .str.strip()
    )

    df["Amount"] = pd.to_numeric(df["Amount"], errors="coerce")
    df = df[df["Amount"].notna()]

# ==========================================
# DESCRIPTION CLEANING
# ==========================================

if "Description" in df.columns:
    df = df[
        ~df["Description"].astype(str)
        .str.contains("description", case=False, na=False)
    ]

    df = df[df["Description"].astype(str).str.len() > 2]

    df["Description"] = df["Description"].astype(str).str.upper()

# ==========================================
# CATEGORY DETECTION
# ==========================================

def categorize(text):
    text = str(text).lower()

    if any(x in text for x in ["swiggy", "zomato", "food"]):
        return "Food"

    elif any(x in text for x in ["uber", "ola", "travel"]):
        return "Travel"

    elif any(x in text for x in ["amazon", "flipkart", "myntra"]):
        return "Shopping"

    elif "salary" in text:
        return "Income"

    elif "rent" in text:
        return "Rent"

    elif any(x in text for x in ["electricity", "bill", "recharge"]):
        return "Bills"

    elif any(x in text for x in ["atm", "withdrawal"]):
        return "Cash Withdrawal"

    elif any(x in text for x in ["upi", "neft", "imps"]):
        return "Bank Transfer"

    else:
        return "Others"

if "Description" in df.columns:
    df["Category"] = df["Description"].apply(categorize)

# ==========================================
# SORT DATA
# ==========================================

if "Date" in df.columns:
    df = df.sort_values(by="Date")

df.reset_index(drop=True, inplace=True)

# ==========================================
# CREATE OUTPUT FOLDER
# ==========================================

output_folder = "output"

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# ==========================================
# SAVE CLEANED CSV IN OUTPUT FOLDER
# ==========================================

output_file = os.path.join(output_folder, "cleaned_transactions.csv")
df.to_csv(output_file, index=False)

# ==========================================
# FINAL OUTPUT
# ==========================================

print("\n================ CLEANED DATA ================\n")
print(df.head(20))

print("\nTOTAL ROWS AFTER CLEANING:", len(df))

print("\n================ CATEGORY SUMMARY ================\n")
if "Category" in df.columns:
    print(df["Category"].value_counts())

print("\nTOTAL AMOUNT:", df["Amount"].sum() if "Amount" in df.columns else "N/A")

print("\n✅ CSV CLEANING COMPLETED SUCCESSFULLY!")
print("📁 FILE SAVED AT:", output_file)