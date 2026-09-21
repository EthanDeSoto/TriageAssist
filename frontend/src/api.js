const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const TIMEOUT_MS = 90000;
const COLD_START_MS = 8000;

export class TriageRequestError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

function buildRequestBody(description, file) {
  const formData = new FormData();
  formData.append("text", description);
  if (file) {
    formData.append("file", file);
  }
  return formData;
}

const FALLBACK_MESSAGES = {
  validation: "The server could not accept this request. Check the description and try again.",
  unauthorized: "That access code is not right. Enter it again.",
  rate_limited: "That is a lot of tickets at once. Wait a minute and try again.",
  ai: "The AI couldn't triage this one. Try rewording or try again.",
  unknown: "Something went wrong on the server. Try again in a moment.",
};

function readServerMessage(payload, kind) {
  if (payload && typeof payload.message === "string" && payload.message) {
    return payload.message;
  }
  return FALLBACK_MESSAGES[kind];
}

async function readJsonBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function triageTicket({ description, file, accessCode, onColdStart }) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutTimer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  const coldStartTimer = setTimeout(() => {
    if (onColdStart) {
      onColdStart();
    }
  }, COLD_START_MS);

  let response;
  try {
    response = await fetch(`${API_URL}/api/triage`, {
      method: "POST",
      body: buildRequestBody(description, file),
      headers: { "X-Access-Code": accessCode },
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) {
      throw new TriageRequestError(
        "timeout",
        "This took longer than 90 seconds, so it was stopped. The server may still be waking up.",
      );
    }
    throw new TriageRequestError(
      "network",
      "Can't reach the server. Check your connection or try again in a minute.",
    );
  } finally {
    clearTimeout(timeoutTimer);
    clearTimeout(coldStartTimer);
  }

  if (response.ok) {
    const result = await readJsonBody(response);
    if (!result) {
      throw new TriageRequestError(
        "unknown",
        "The server replied with something this app could not read. Try again.",
      );
    }
    return result;
  }

  const payload = await readJsonBody(response);

  if (response.status === 422 || response.status === 413 || response.status === 415) {
    throw new TriageRequestError("validation", readServerMessage(payload, "validation"));
  }

  if (response.status === 401) {
    throw new TriageRequestError("unauthorized", readServerMessage(payload, "unauthorized"));
  }

  if (response.status === 429) {
    throw new TriageRequestError("rate_limited", readServerMessage(payload, "rate_limited"));
  }

  if (response.status === 502) {
    throw new TriageRequestError("ai", readServerMessage(payload, "ai"));
  }

  throw new TriageRequestError("unknown", readServerMessage(payload, "unknown"));
}
