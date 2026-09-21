from io import BytesIO

from pypdf import PdfReader

from errors import ApiError

MAX_FILE_BYTES = 5 * 1024 * 1024
MAX_PDF_PAGES = 10

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
JPEG_SIGNATURE = b"\xff\xd8\xff"
PDF_SIGNATURE = b"%PDF-"


def detect_media_type(data):
    if data.startswith(PNG_SIGNATURE):
        return "image/png"
    if data.startswith(JPEG_SIGNATURE):
        return "image/jpeg"
    if data[0:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if data.startswith(PDF_SIGNATURE):
        return "application/pdf"
    return None


def count_pdf_pages(data):
    try:
        return len(PdfReader(BytesIO(data)).pages)
    except Exception:
        raise ApiError(
            415,
            "unreadable_file",
            "That PDF could not be opened. It may be damaged or password protected.",
        )


def describe_size(byte_count):
    return f"{byte_count / (1024 * 1024):.1f} MB"


def check_upload(data):
    if len(data) == 0:
        raise ApiError(422, "empty_file", "That file is empty. Attach the screenshot or PDF again.")

    if len(data) > MAX_FILE_BYTES:
        raise ApiError(
            413,
            "file_too_large",
            f"That file is {describe_size(len(data))}. The limit is 5 MB.",
        )

    media_type = detect_media_type(data)
    if media_type is None:
        raise ApiError(
            415,
            "unsupported_file_type",
            "That file is not a PNG, JPEG, WEBP, or PDF. Renaming a file does not change what is inside it.",
        )

    if media_type == "application/pdf":
        pages = count_pdf_pages(data)
        if pages > MAX_PDF_PAGES:
            raise ApiError(
                422,
                "pdf_too_long",
                f"That PDF has {pages} pages. Attach one with {MAX_PDF_PAGES} pages or fewer.",
            )

    return media_type
