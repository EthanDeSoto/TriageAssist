# Triage Assist

Turns a messy IT support request — pasted text, a screenshot, or a PDF — into a
structured triage ticket that a technician can correct before it goes out.

**AI suggests. You decide.**

<!-- Screenshot or GIF goes here -->

---

## The problem

Support requests arrive as a paragraph of frustration. "My computer keeps asking
for my password and I have a client call at 2." Before anyone can work it,
somebody has to read it and decide four things: what kind of problem it is, how
urgent it is, who should own it, and what to try first.

Triage Assist does that first pass. It reads the request — including the error
text inside a screenshot — and returns a filled-in ticket. Every field is
editable, because the model is a first draft, not the decision.

## What it produces

| Field | What it is |
|---|---|
| `summary` | A ticket title under 12 words |
| `category` | hardware, software, network, access, security, other |
| `priority` | critical, high, medium, low — based on business impact, not tone |
| `assigned_group` | service_desk, desktop_support, network, identity_access, security |
| `confidence` | The model's own read on how clear-cut the call was |
| `likely_cause` | One sentence, written as a theory rather than a diagnosis |
| `next_steps` | Three to five concrete actions, quickest likely fix first |
| `questions_for_user` | Only what's missing and would change the next steps |

## How it works

it's three pieces. The front end is React, built with Vite. When you hit Submit, it sends your text and any screenshot or PDF to a FastAPI back end. The back end validates the file type and size, and then sends everything to Claude Haiku. Instead of just asking the model for JSON and hoping, I use structured outputs with a Pydantic schema, so every response comes back in the exact shape the app expects: category, priority, assigned group, next steps, and questions for the user. Then the front end turns that into the ticket card you see here."
One request in, one ticket out. No queue, no database, no agent loop.

## Repo layout

```
backend/
  main.py       routes, CORS, error handlers, request size limit
  triage.py     the Claude call and the system prompt
  models.py     Pydantic schemas - the contract for the model's output
  uploads.py    file type, size, and PDF page validation
  ratelimit.py  per-IP request limiting
frontend/
  src/
    App.jsx       state and the submit flow
    api.js        the one fetch call, with timeout and error mapping
    components/   InputPanel, ResultPanel, TicketCard, FileDropZone, Stubby
notes.md        running log of prompt changes and why
```

## Run it locally

You need Python 3.11+, Node 20+, and an [Anthropic API key](https://console.anthropic.com/).

**Backend**

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env           # then fill in the values
uvicorn main:app --reload
```

`backend/.env` needs:

```
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:5173
```

The server refuses to start if `ANTHROPIC_API_KEY` is missing, so a missing key
fails at startup instead of on the first request.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env           # VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

Open http://localhost:5173.

## The API

| Endpoint | What it does |
|---|---|
| `GET /api/health` | Returns `{"status": "ok"}` |
| `POST /api/triage` | Multipart form: `text` and `file`, both optional but at least one required |

Errors all come back as `{"error": "...", "message": "..."}`:

| Status | When |
|---|---|
| 413 | Upload over 5 MB |
| 415 | Not a PNG, JPEG, WEBP, or PDF, or an unreadable PDF |
| 422 | Nothing submitted, text too short or too long, PDF over 10 pages |
| 429 | More than 10 requests a minute from one IP |
| 502 | The model call failed, refused, or got cut off |

## Key decisions

**Structured outputs, not "please return JSON."** `models.py` defines the ticket
as a Pydantic model and `client.messages.parse()` hands that schema to the API,
so `category` can only ever be one of six values. No hand-written JSON parsing
or repair.

**Haiku 4.5.** Triage is classification against a written rubric plus a short
list of steps. A small model handles that quickly and cheaply. Swapping models
is one line in `triage.py`.

**Most of the logic lives in the prompt.** The system prompt defines each
category, priority, and group in plain service-desk terms. User text is wrapped
in `<ticket>` tags and treated as data, so instructions inside a ticket or
screenshot are ignored. Prompt changes are logged in `notes.md`.

**The server validates too.** The browser checks file type and size for quick
feedback, but the server checks again using the file's actual bytes, not the
filename.

**Stubby.** A draggable cartoon technician who reacts to what the app is doing.
He can be switched off in the header.

## Limits

- 10 requests per minute per IP
- 5 MB upload cap
- 10 pages per PDF
- 5,000 characters of pasted text

## Known limitations

- **Corrections don't save.** You can edit every field and copy the result, but
  nothing is stored.
- **`confidence` is self-reported** by the model, not a measured score.
- **The rate limiter is in memory** and resets when the server restarts.
- **No login.** Anyone who can reach the server can use your API key.
- **No accuracy numbers yet.** The prompt has been tuned by hand against fake
  tickets.

## What's next

1. SQLite for ticket history and corrections, to track how often techs change
   the AI's answer.
2. An evaluation set of labeled fake tickets to measure accuracy per field.

## About the data

Every ticket in this repo is invented. The sample tickets in
`frontend/src/sampleTickets.js` resemble real service desk requests but are not
real ones.
