import os
import traceback
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.formparsers import MultiPartParser

from access import enforce_access_code
from errors import ApiError
from models import TriageResponse
from ratelimit import enforce_rate_limit
from triage import TriageError, triage_ticket
from uploads import MAX_FILE_BYTES, check_upload

MIN_TEXT_LENGTH = 10
MAX_TEXT_LENGTH = 5000
MAX_REQUEST_BYTES = MAX_FILE_BYTES + 64 * 1024

MultiPartParser.spool_max_size = MAX_FILE_BYTES + 1024

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = list(dict.fromkeys([FRONTEND_URL, "http://localhost:5173"]))


@asynccontextmanager
async def lifespan(app):
    if not os.getenv("ANTHROPIC_API_KEY"):
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set. Copy backend/.env.example to backend/.env "
            "and add your key, or set it in the Render dashboard."
        )
    if not os.getenv("DEMO_ACCESS_CODE"):
        raise RuntimeError(
            "DEMO_ACCESS_CODE is not set. Pick any phrase and put it in backend/.env "
            "or in the Render dashboard. Without it the endpoint is open to anyone."
        )
    yield


app = FastAPI(title="Triage Assist", lifespan=lifespan)


@app.middleware("http")
async def reject_oversized_requests(request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit() and int(content_length) > MAX_REQUEST_BYTES:
        return JSONResponse(
            status_code=413,
            content={
                "error": "file_too_large",
                "message": "That upload is over the 5 MB limit.",
            },
        )
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ApiError)
async def handle_api_error(request, error):
    return JSONResponse(
        status_code=error.status_code,
        content={"error": error.error, "message": error.message},
    )


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(request, error):
    return JSONResponse(
        status_code=422,
        content={
            "error": "invalid_input",
            "message": "The request was not in the expected format. Send the description as a text field and any attachment as a file field.",
        },
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(request, error):
    known_messages = {
        404: "That address does not exist on this API.",
        405: "That request method is not allowed here.",
    }
    return JSONResponse(
        status_code=error.status_code,
        content={
            "error": "request_rejected",
            "message": known_messages.get(error.status_code, str(error.detail)),
        },
    )


@app.exception_handler(Exception)
async def handle_unexpected_error(request, error):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "error": "server_error",
            "message": "Something went wrong on our side. Try again in a moment.",
        },
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/triage", response_model=TriageResponse)
async def triage(
    request: Request,
    text: str | None = Form(None),
    file: UploadFile | None = File(None),
):
    enforce_rate_limit(request)
    enforce_access_code(request)

    description = (text or "").strip()
    file_bytes = await file.read() if file is not None and file.filename else None

    if not description and not file_bytes:
        raise ApiError(
            422,
            "empty_request",
            "Describe the problem, attach a screenshot or PDF, or both.",
        )

    if len(description) > MAX_TEXT_LENGTH:
        raise ApiError(
            422,
            "text_too_long",
            f"That description is {len(description)} characters. Keep it under {MAX_TEXT_LENGTH}.",
        )

    if not file_bytes and len(description) < MIN_TEXT_LENGTH:
        raise ApiError(
            422,
            "text_too_short",
            f"That description is too short to work with. Write at least {MIN_TEXT_LENGTH} characters or attach a screenshot.",
        )

    media_type = check_upload(file_bytes) if file_bytes else None

    try:
        outcome = triage_ticket(description, file_bytes, media_type)
    except TriageError as error:
        raise ApiError(502, "triage_failed", str(error))

    print(
        f"triage ok latency_ms={outcome.latency_ms} "
        f"input_tokens={outcome.input_tokens} output_tokens={outcome.output_tokens} "
        f"attachment={media_type or 'none'}"
    )

    return TriageResponse(
        id=str(uuid.uuid4()),
        result=outcome.result,
        model=outcome.model,
        latency_ms=outcome.latency_ms,
    )
