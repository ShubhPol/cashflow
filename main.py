# ==========================================
# PERSONAL CASHFLOW PREDICTOR API
# FASTAPI + LANGGRAPH + CSV DASHBOARD
# ==========================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

# ==========================================
# IMPORT LANGGRAPH
# ==========================================

from graph import app as cashflow_graph

# ==========================================
# CREATE FASTAPI APP
# ==========================================

api = FastAPI(
    title="Personal Cashflow Predictor API",
    version="1.0.0"
)

# ==========================================
# ENABLE CORS
# ==========================================

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# LOAD CSV
# ==========================================

CSV_FILE = "output/transactions.csv"

try:

    df = pd.read_csv(CSV_FILE)

    print("\n✅ CSV Loaded Successfully")

except Exception as e:

    print("\n❌ CSV Loading Error:", e)

    df = pd.DataFrame()

# ==========================================
# CLEAN COLUMN NAMES
# ==========================================

if not df.empty:

    # lowercase column names
    df.columns = df.columns.str.strip().str.lower()

    print("\n📌 CSV COLUMNS:")
    print(df.columns)

    # ==========================================
    # HANDLE DEBIT/CREDIT FORMAT
    # ==========================================

    if "debit" in df.columns and "credit" in df.columns:

        print("\n✅ Debit/Credit Columns Detected")

        # clean debit
        df["debit"] = (
            df["debit"]
            .astype(str)
            .str.replace(",", "")
            .str.replace("₹", "")
            .str.strip()
        )

        # clean credit
        df["credit"] = (
            df["credit"]
            .astype(str)
            .str.replace(",", "")
            .str.replace("₹", "")
            .str.strip()
        )

        # convert numeric
        df["debit"] = pd.to_numeric(
            df["debit"],
            errors="coerce"
        ).fillna(0)

        df["credit"] = pd.to_numeric(
            df["credit"],
            errors="coerce"
        ).fillna(0)

        # debit negative
        # credit positive
        df["amount"] = df["credit"] - df["debit"]

    else:

        print("\n✅ Single Amount Column Detected")

        # possible amount columns
        amount_col = None

        possible_amount_columns = [
            "amount",
            "amt",
            "value",
            "transaction_amount",
            "money"
        ]

        for col in possible_amount_columns:

            if col in df.columns:

                amount_col = col
                break

        if amount_col is None:

            raise Exception(
                f"\n❌ Amount column not found.\nAvailable columns: {list(df.columns)}"
            )

        print(f"\n✅ Amount Column: {amount_col}")

        # clean amount column
        df[amount_col] = (
            df[amount_col]
            .astype(str)
            .str.replace(",", "")
            .str.replace("₹", "")
            .str.strip()
        )

        # convert numeric
        df[amount_col] = pd.to_numeric(
            df[amount_col],
            errors="coerce"
        )

        # rename
        df.rename(
            columns={amount_col: "amount"},
            inplace=True
        )

    # remove nulls
    df = df.dropna(subset=["amount"])

    # ==========================================
    # CATEGORY COLUMN
    # ==========================================

    if "category" not in df.columns:

        df["category"] = "Unknown"

    df["category"] = df["category"].fillna("Unknown")

    # ==========================================
    # DEBUG OUTPUT
    # ==========================================

    print("\n📌 SAMPLE DATA:")
    print(df[["amount"]].head(20))

# ==========================================
# ROOT API
# ==========================================

@api.get("/")
def home():

    return {
        "message": "Personal Cashflow Predictor API Running"
    }

# ==========================================
# TOTAL INFLOW API
# ==========================================

@api.get("/api/total-inflow")
def total_inflow():

    inflow = df[df["amount"] > 0]["amount"].sum()

    return {
        "total_inflow": round(float(inflow), 2)
    }

# ==========================================
# TOTAL OUTFLOW API
# ==========================================

@api.get("/api/total-outflow")
def total_outflow():

    outflow = abs(
        df[df["amount"] < 0]["amount"].sum()
    )

    return {
        "total_outflow": round(float(outflow), 2)
    }

# ==========================================
# NET CASH FLOW API
# ==========================================

@api.get("/api/net-cash-flow")
def net_cash_flow():

    inflow = df[df["amount"] > 0]["amount"].sum()

    outflow = abs(
        df[df["amount"] < 0]["amount"].sum()
    )

    net = inflow - outflow

    return {
        "net_cash_flow": round(float(net), 2)
    }

# ==========================================
# SAVINGS RATE API
# ==========================================

@api.get("/api/savings-rate")
def savings_rate():

    inflow = df[df["amount"] > 0]["amount"].sum()

    outflow = abs(
        df[df["amount"] < 0]["amount"].sum()
    )

    net = inflow - outflow

    if inflow > 0:

        rate = (net / inflow) * 100

    else:

        rate = 0

    return {
        "savings_rate": round(float(rate), 2)
    }

# ==========================================
# PREDICTED AMOUNT API
# ==========================================

@api.get("/api/predicted-amount")
def predicted_amount():

    inflow = df[df["amount"] > 0]["amount"].sum()

    predicted = inflow * 0.8

    return {
        "predicted_amount": round(float(predicted), 2)
    }

# ==========================================
# INFLOW VS OUTFLOW API
# ==========================================

@api.get("/api/inflow-vs-outflow")
def inflow_vs_outflow():

    chart_data = [
        {
            "week": "Week 1",
            "inflow": 20000,
            "outflow": 5000
        },
        {
            "week": "Week 2",
            "inflow": 1000,
            "outflow": 10000
        },
        {
            "week": "Week 3",
            "inflow": 3000,
            "outflow": 7000
        },
        {
            "week": "Week 4",
            "inflow": 150000,
            "outflow": 60000
        }
    ]

    return chart_data

# ==========================================
# OUTFLOW BREAKDOWN API
# ==========================================

@api.get("/api/outflow-breakdown")
def outflow_breakdown():

    expense_df = df[df["amount"] < 0]

    grouped = (
        expense_df.groupby("category")["amount"]
        .sum()
        .abs()
        .reset_index()
    )

    result = []

    for _, row in grouped.iterrows():

        result.append({
            "category": str(row["category"]),
            "amount": round(float(row["amount"]), 2)
        })

    return result

# ==========================================
# TRANSACTIONS API
# ==========================================

@api.get("/api/transactions")
def transactions():

    clean_df = df.copy()

    # remove NaN
    clean_df = clean_df.fillna("")

    # datetime safe
    for col in clean_df.columns:

        if str(clean_df[col].dtype).startswith("datetime"):

            clean_df[col] = clean_df[col].astype(str)

    records = clean_df.to_dict(orient="records")

    return records

# ==========================================
# COMPLETE DASHBOARD API
# ==========================================

@api.get("/api/dashboard")
def dashboard():

    inflow = df[df["amount"] > 0]["amount"].sum()

    outflow = abs(
        df[df["amount"] < 0]["amount"].sum()
    )

    net = inflow - outflow

    if inflow > 0:

        savings = (net / inflow) * 100

    else:

        savings = 0

    predicted = inflow * 0.8

    # breakdown
    expense_df = df[df["amount"] < 0]

    grouped = (
        expense_df.groupby("category")["amount"]
        .sum()
        .abs()
        .reset_index()
    )

    breakdown = []

    for _, row in grouped.iterrows():

        breakdown.append({
            "category": str(row["category"]),
            "amount": round(float(row["amount"]), 2)
        })

    return {

        "summary": {

            "total_inflow": round(float(inflow), 2),

            "total_outflow": round(float(outflow), 2),

            "net_cash_flow": round(float(net), 2),

            "savings_rate": round(float(savings), 2),

            "predicted_amount": round(float(predicted), 2)
        },

        "outflow_breakdown": breakdown
    }

# ==========================================
# PROCESS PDF API
# ==========================================

@api.post("/api/process-pdf")
def process_pdf():

    pdf_path = "uploads/account_statements__latest.pdf"

    result = cashflow_graph.invoke({
        "file_path": pdf_path
    })

    return result

# ==========================================
# MAIN
# ==========================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:api",
        host="127.0.0.1",
        port=8000,
        reload=True
    )