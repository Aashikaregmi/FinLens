import os
import re
import joblib
import requests
import logging
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.naive_bayes import MultinomialNB
from train_model import model as trained_model
from preprocess import preprocess_line

# Load environment variables
load_dotenv()

# Setup logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    ch.setFormatter(formatter)
    logger.addHandler(ch)


# --- Line Cleaning ---
def clean_line_start(text: str) -> str:
    """Remove leading non-alphanumeric characters from a line."""
    return text.lstrip("=-~*")


# --- Strip price and noise from item description ---
def strip_price(text: str) -> str:
    """
    Clean trailing prices, units, and symbols from item descriptions.
    Example: 'Pepsi 500ml 45.00' -> 'Pepsi'
    """
    # Remove prices at end
    text = re.sub(r"[\s:=~-]*[\$₹€]?\s?\d{1,3}(?:[.,]\d{1,7})?\s*$", "", text)

    # Remove trailing quantity units (e.g., 1L, 3 pcs)
    text = re.sub(
        r"\b\d+\s*(kg|g|lbs|oz|ml|l|pcs|pack|packs|tablet|tabs|bottle|box)\b",
        "",
        text,
        flags=re.IGNORECASE,
    )

    # Remove decorative characters
    text = re.sub(r"[-=~*]+", "", text)

    # Remove common non-categorization terms
    text = re.sub(r"(?i)(Tax|Total|Payment Method)", "", text)

    # Remove trailing timestamps (like 15:27)
    text = re.sub(r"\b\d{1,2}:\d{2}(?:\s*[ap]m)?\b", "", text, flags=re.IGNORECASE)

    # Remove street suffixes (common in addresses)
    text = re.sub(
        r"\b(st|rd|road|ave|avenue|blvd|street)\b", "", text, flags=re.IGNORECASE
    )

    return text.strip()


# --- Local Model Categorization ---
def categorize_text_local(text: str) -> str:
    """
    Predict category using a locally trained ML model.
    """
    try:
        cleaned = preprocess_line(strip_price(text).lower())
        if not cleaned:
            return "Other"
        return trained_model.predict([cleaned])[0]
    except Exception as e:
        logger.error(f"Local model prediction failed: {e}")
        return "Other"


# --- Fallback AI Categorization via Ollama ---
valid_categories = {
    "Food",
    "Groceries",
    "Entertainment",
    "Transportation",
    "Shopping",
    "Utilities",
    "Personal Care",
    "Health",
    "Taxes",
    "Other",
}


def call_ollama_model(text: str) -> str:
    """
    Fallback categorization using Ollama local model with prompt.
    """
    try:
        prompt = f"""
        Classify the following receipt item into exactly one of these categories:

        Food, Groceries, Entertainment, Transportation, Shopping, Utilities, Personal Care, Health, Taxes, Other.

        Item: "{text}"

        Respond with only one category name, no explanation.
        """

        payload = {
            "model": os.getenv("OLLAMA_MODEL", "llama3"),
            "prompt": prompt.strip(),
            "stream": False,
        }

        response = requests.post("http://localhost:11434/api/generate", json=payload)
        if response.ok:
            raw = response.json().get("response", "").strip()
            logger.info(f"Ollama raw response for '{text}': '{raw}'")

            # Validate and normalize category
            category = raw.title()
            if category in valid_categories:
                return category
            else:
                logger.warning(
                    f"Ollama returned invalid category: '{raw}' (normalized: '{category}')"
                )
        else:
            logger.error(f"Ollama API error {response.status_code}: {response.text}")

    except Exception as e:
        logger.error(f"Exception calling Ollama for '{text}': {e}")

    return "Other"


# --- Budget Helper Functions ---
def calculate_budget_usage(spent, budget):
    """Calculate what percentage of budget has been used"""
    if budget <= 0:
        return 100  # Avoid division by zero

    return (spent / budget) * 100


def get_month_range():
    """Get the start and end date for the current month"""
    from datetime import datetime

    now = datetime.utcnow()
    start_of_month = datetime(now.year, now.month, 1)

    # Calculate end of month
    if now.month == 12:
        end_of_month = datetime(now.year + 1, 1, 1)
    else:
        end_of_month = datetime(now.year, now.month + 1, 1)

    return start_of_month, end_of_month


def extract_merchant_name(text: str) -> str:
    """
    Extract a potential merchant name from receipt text.
    Usually the first or second line contains the merchant name.
    """
    lines = text.strip().split("\n")

    # Skip empty lines
    non_empty_lines = [line.strip() for line in lines if line.strip()]

    if not non_empty_lines:
        return "Unknown Merchant"

    # Try first line, which often contains the merchant name
    potential_name = non_empty_lines[0]

    # If first line is very short, it might be a logo or header
    # In that case, try the second line
    if len(potential_name) < 3 and len(non_empty_lines) > 1:
        potential_name = non_empty_lines[1]

    # Clean up common prefixes/suffixes in merchant names
    potential_name = re.sub(
        r"(?i)(welcome to|receipt from|thank you for shopping at|store:)",
        "",
        potential_name,
    )

    # Remove any trailing/leading punctuation
    potential_name = potential_name.strip(".,;:-*_#")

    return potential_name if potential_name else "Unknown Merchant"


def format_date(date):
    """Format a date for display"""
    return date.strftime("%Y-%m-%d")


def format_amount(amount):
    """Format a monetary amount for display"""
    return f"${float(amount):.2f}"
