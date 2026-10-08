import time
from collections import defaultdict

from errors import ApiError

REQUEST_LIMIT = 10
WINDOW_SECONDS = 60

recent_requests = defaultdict(list)


def client_address(request):
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def enforce_rate_limit(request):
    address = client_address(request)
    now = time.monotonic()
    still_in_window = [moment for moment in recent_requests[address] if now - moment < WINDOW_SECONDS]

    if len(still_in_window) >= REQUEST_LIMIT:
        recent_requests[address] = still_in_window
        raise ApiError(
            429,
            "rate_limited",
            f"That is more than {REQUEST_LIMIT} tickets in a minute. Wait a moment and try again.",
        )

    still_in_window.append(now)
    recent_requests[address] = still_in_window
