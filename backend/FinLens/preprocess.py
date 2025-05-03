def preprocess_line(text):
    """
    Preprocess a line of text for receipt categorization
    """
    text = text.lower()
    # Remove common receipt prefixes/suffixes and numbers
    text = " ".join(
        [word for word in text.split() if not (word.isdigit() or word.startswith("$"))]
    )
    return text.strip()
