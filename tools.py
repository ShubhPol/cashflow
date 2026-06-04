import pdfplumber
import pandas as pd
import re
import os

from pdf2image import convert_from_path
import pytesseract


# ---------------------------------------------------
# TESSERACT PATH
# ---------------------------------------------------

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


# ==================================================
# 1. PDF TEXT EXTRACTION
# ==================================================

def extract_text_tool(file_path):

    text = ""

    # ---------------------------------------------
    # TRY PDFPLUMBER
    # ---------------------------------------------

    try:

        with pdfplumber.open(file_path) as pdf:

            for page_no, page in enumerate(pdf.pages):

                page_text = page.extract_text()

                if page_text and len(page_text.strip()) > 20:

                    print(f"pdfplumber extracted page {page_no+1}")

                    text += page_text + "\n"

    except Exception as e:

        print("pdfplumber error:", e)

    # ---------------------------------------------
    # OCR FALLBACK
    # ---------------------------------------------

    if not text.strip():

        print("Using OCR...")

        images = convert_from_path(file_path)

        for i, img in enumerate(images):

            print(f"OCR page {i+1}")

            ocr_text = pytesseract.image_to_string(
                img,
                config="--psm 6"
            )

            text += ocr_text + "\n"

    # ---------------------------------------------
    # DEBUG
    # ---------------------------------------------

    print("\n===== OCR SAMPLE =====\n")

    print(text[:5000])

    print("\n======================\n")

    return text


# ==================================================
# 2. SAVE OCR TEXT
# ==================================================

def save_text_tool(text):

    os.makedirs("output", exist_ok=True)

    text_path = "output/ocr_output.txt"

    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)

    return text_path


# ==================================================
# 3. TRANSACTION EXTRACTION
# ==================================================

# ==================================================
# TRANSACTION EXTRACTION + CATEGORY
# ==================================================

def extract_transactions_tool(text):

    import pandas as pd
    import re
    import os

    os.makedirs("output", exist_ok=True)

    transactions = []

    lines = text.split("\n")

    for line in lines:

        line = line.strip()

        if len(line) < 5:
            continue

        # -----------------------------------------
        # DATE
        # -----------------------------------------

        date_match = re.search(
            r"\d{1,2}[/-]?\s?[A-Za-z]{3}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}",
            line
        )

        # -----------------------------------------
        # AMOUNTS
        # -----------------------------------------

        amount_match = re.findall(
            r"-?\d+(?:,\d{3})*(?:\.\d{2})?",
            line
        )

        if amount_match:

            try:

                amount = amount_match[-1]

                amount = amount.replace(",", "")

                # -----------------------------------------
                # CATEGORY DETECTION
                # -----------------------------------------

                lower_line = line.lower()

                category = "Others"

                if any(word in lower_line for word in [
                    "amazon", "flipkart", "shopping"
                ]):
                    category = "Shopping"

                elif any(word in lower_line for word in [
                    "swiggy", "zomato", "restaurant",
                    "food", "cafe"
                ]):
                    category = "Food"

                elif any(word in lower_line for word in [
                    "uber", "ola", "fuel", "petrol",
                    "travel", "irctc"
                ]):
                    category = "Travel"

                elif any(word in lower_line for word in [
                    "salary", "credited", "deposit"
                ]):
                    category = "Income"

                elif any(word in lower_line for word in [
                    "rent", "house"
                ]):
                    category = "Rent"

                elif any(word in lower_line for word in [
                    "electricity", "water", "gas",
                    "bill", "recharge"
                ]):
                    category = "Utilities"

                elif any(word in lower_line for word in [
                    "upi", "imps", "neft", "rtgs"
                ]):
                    category = "Bank Transfer"

                transactions.append({

                    "Date":
                        date_match.group()
                        if date_match else "",

                    "Description": line,

                    "Amount": float(amount),

                    "Category": category

                })

            except:
                continue

    # -----------------------------------------
    # DATAFRAME
    # -----------------------------------------

    df = pd.DataFrame(transactions)

    df.drop_duplicates(inplace=True)

    print("\n===== TRANSACTION SAMPLE =====\n")

    print(df.head(20))

    print("\nTOTAL TRANSACTIONS:", len(df))

    csv_path = "output/transactions.csv"

    df.to_csv(csv_path, index=False)

    return csv_path