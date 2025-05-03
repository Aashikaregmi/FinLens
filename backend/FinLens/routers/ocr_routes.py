from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import pytesseract
from PIL import Image
import io
import re
from datetime import datetime
import os
import logging

from dependencies import get_db, get_current_user
from models import User
from schemas import OCRResponse
import utils

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

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/scan-receipt", response_model=OCRResponse)
async def scan_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check file format
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are supported",
        )

    # Read the uploaded image
    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents))

        # Extract text from image using pytesseract
        extracted_text = pytesseract.image_to_string(image)
        logger.info(f"Extracted text from receipt: {extracted_text[:100]}...")

        # Process the extracted text to find receipt items and amounts
        categorized_expenses = process_receipt_text(extracted_text)

        return categorized_expenses
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}",
        )


def process_receipt_text(text: str) -> Dict[str, Any]:
    lines = text.split("\n")

    # Extract merchant name (usually at the top)
    merchant_name = lines[0] if lines and lines[0] else "Unknown Merchant"

    # Look for patterns like "Item $10.99"
    items = []
    categorized = {}
    uncategorized_lines = []

    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue

        # Clean line
        cleaned_line = utils.clean_line_start(line.strip())

        # Look for price patterns
        price_match = re.search(r"\$?(\d+\.\d{2})", cleaned_line)
        if price_match:
            price = float(price_match.group(1))

            # Extract item description (everything before the price)
            item_text = cleaned_line[: price_match.start()].strip()
            item_text = utils.strip_price(item_text)

            if item_text and price > 0:
                # Categorize the item
                try:
                    # First try local ML model
                    category = utils.categorize_text_local(item_text)

                    # If that fails or returns "Other", try Ollama API if configured
                    if (
                        category == "Other"
                        and os.getenv("USE_OLLAMA", "false").lower() == "true"
                    ):
                        category = utils.call_ollama_model(item_text)
                except Exception as e:
                    logger.error(f"Error categorizing text: {str(e)}")
                    category = "Other"

                # Add to categorized expenses
                if category in categorized:
                    categorized[category] += price
                else:
                    categorized[category] = price

                items.append(
                    {"description": item_text, "category": category, "amount": price}
                )
        else:
            # Lines without recognizable price pattern
            uncategorized_lines.append(cleaned_line)

    return {
        "merchant": merchant_name,
        "categorized": categorized,
        "line_items": items,
        "uncategorized_lines": uncategorized_lines,
    }
