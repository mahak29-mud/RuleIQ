import fitz
from pathlib import Path


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from every page of a PDF.
    """

    pdf_file = Path(pdf_path)

    if not pdf_file.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    document = fitz.open(pdf_path)

    pages = []

    for page_number, page in enumerate(document, start=1):
        text = page.get_text("text")

        if text.strip():
            pages.append(
                f"\n--- PAGE {page_number} ---\n{text.strip()}"
            )

    document.close()

    return "\n".join(pages)
