# Triage Assist

Turns a messy IT support request — pasted text, a screenshot, or a PDF — into a
structured triage ticket that a technician can correct before it goes out.

**AI suggests. You decide.**

> **Live demo:** _add your Netlify URL here after deploying_

<!-- Add a screenshot or GIF here -->

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

## Architecture

```mermaid
flowchart LR
    A[React + Vite<br/>Netlify] -->|POST /api/triage<br/>form data| B[FastAPI<br/>Render]
    B -->|text + image/PDF block<br/>structured output| C[Claude Haiku 4.5]
    C -->|validated TriageResult| B
    B -->|JSON ticket| A
```

One request in, one ticket out. No queue, no database, no agent loop.

## Repo layout

```
backend/
  main.py       routes, CORS, error handlers, request size limit
  triage.py     the Claude call and the system prompt
  models.py     Pydantic schemas - the contract for the model's output
  uploads.py    file type, size, and PDF page validation
  ratelimit.py  per-IP request limiting
  render.yaml   Render service definition
frontend/
  netlify.toml  Netlify build settings
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

The server refuses to start if `ANTHROPIC_API_KEY` is missing. That is on
purpose — a missing key should fail loudly at boot, not on the first request.

Check it at http://127.0.0.1:8000/api/health, and try requests by hand at
http://127.0.0.1:8000/docs.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env           # VITE_API_URL=http://127.0.0.1:8000
npm run dev
```

Open http://localhost:5173.

## Deploying

**Backend — Render.** `backend/render.yaml` defines the service. Set
`ANTHROPIC_API_KEY` and `FRONTEND_URL` (your Netlify URL,
no trailing slash) in the dashboard.

**Frontend — Netlify.** Base directory `frontend`, which picks up
`frontend/netlify.toml`. Set `VITE_API_URL` to the Render URL. Vite bakes
`VITE_` variables in at build time, so changing one means triggering a redeploy.

## The API

| Endpoint | What it does |
|---|---|
| `GET /api/health` | Returns `{"status": "ok"}`. Open, so Render's health check can reach it. |
| `POST /api/triage` | Multipart form: `text` and `file`, both optional but at least one required. |

Errors come back in one shape — `{"error": "...", "message": "..."}` — so the
front end can show the server's own wording instead of inventing its own:

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
so `category` can only ever be one of six values. Asking for JSON in the prompt
and parsing the reply means writing a parser, a retry, and a repair path for
markdown fences and trailing prose. The schema removes that whole class of bug.
When the model refuses or hits the token cap, `stop_reason` says so and the
request fails cleanly as a 502 rather than returning half a ticket.

**Haiku 4.5, not a bigger model.** Triage is classification against a written
rubric plus a short list of steps. That is a small model's job. Haiku answers in
about a second for a fraction of a cent, which matters for a demo anyone can
open. If accuracy on the harder judgment calls turned out to be the limit, the
fix is a model swap on one line in `triage.py` — worth measuring before
spending, which is what the evaluation phase is for.

**Almost all the logic lives in the prompt.** The system prompt is long and
specific on purpose: it defines each category, each priority tier, and each
group in the words a service desk would actually use, because "high priority"
means nothing without a rule. It also tells the model to ignore instructions
found inside the ticket or a screenshot — user text arrives wrapped in `<ticket>`
tags and is explicitly labeled as data, not commands. Every change to it is
logged in `notes.md` with the ticket that caused it.

**Validation on the server, even though the browser checks too.** The front end
checks file type and size so users get an instant answer. The server checks
again, and it checks the file's magic bytes rather than trusting the filename or
the `Content-Type` header, because anyone can post straight to the endpoint with
curl. The browser check is a convenience; the server check is the rule.

**No agent loop.** One request, one model call, one response. There is nothing
here for a model to decide about tool order or retries, and an agent layer would
add latency, cost, and failure modes in exchange for nothing.

**A mascot.** Stubby is a draggable cartoon technician who reacts to what the
app is doing and reads a newspaper when the queue is quiet. He can be switched
off in the header. He does nothing functional, and that is fine — internal tools
are allowed to be pleasant.

## Cost and abuse controls

- 10 requests per minute per IP, in memory
- 5 MB upload cap, enforced by a middleware that reads `Content-Length` before
  the body is ever buffered, and again after the file is read
- 10-page cap on PDFs, since pages are tokens
- 5,000-character cap on pasted text
- A hard monthly spend limit set in the Anthropic Console, which is the backstop
  for everything the code fails to catch

## Known limitations

- **Corrections don't persist.** You can edit every field and copy the result
  out, but nothing is saved. The database phase is next.
- **`confidence` is self-reported.** It is the model's own estimate, not a
  measured accuracy score, and the UI says so on hover.
- **The rate limiter is per process and in memory.** It resets on restart and
  wouldn't hold across multiple instances. Real traffic wants Redis.
- **No access control.** It runs locally, so anyone who can reach the server
  can spend API credits through it. Deploying it publicly would need a gate first.
- **Free-tier cold starts.** The first request after an idle period can take up
  to a minute. The UI watches for this and says so instead of just spinning.
- **No accuracy numbers yet.** The prompt has been tuned by hand against fake
  tickets. Nothing has been measured.

## What's next

1. **SQLite for history and corrections** — store the AI's answer and the saved
   answer side by side, so "techs changed the AI's answer on X of Y tickets"
   becomes a number instead of a feeling. That number is the whole point of an
   AI-suggests-human-decides tool.
2. **An evaluation set** — 20 to 25 labeled fake tickets, accuracy per field, and
   a before-and-after on one prompt change.
3. **Corrections fed back into the prompt** — the disagreements are the signal
   for the next revision of the rubric.
4. **Postgres over SQLite** if this ever outlived a demo, since free hosting
   wipes local files on restart.

## About the data

Every ticket in this repo is invented. Nothing comes from a real company, a real
ticketing system, or a real person. The sample tickets in
`frontend/src/sampleTickets.js` are written to resemble the kinds of requests a
service desk actually sees, which is not the same as being real ones.
