import os
from secrets import compare_digest

from errors import ApiError


def enforce_access_code(request):
    expected = os.getenv("DEMO_ACCESS_CODE", "")
    provided = request.headers.get("x-access-code", "")

    if not compare_digest(provided, expected):
        raise ApiError(
            401,
            "invalid_access_code",
            "That access code is not right. Ask whoever shared this demo for the current one.",
        )
