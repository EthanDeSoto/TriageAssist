# Triage Assist

A FastAPI backend that turns a messy IT support request into a structured triage
ticket using the Claude API, plus a React front end. Built solo as a portfolio
project. Work follows the phases in `TriageAssistRoadmap.md`; do not build ahead
of the current phase.

## Code style

- Beginner-friendly and functional. No comments in the code.
- No extra abstractions, config classes, logging setup, or retry logic.

## Rules

- Never open, print, or modify `.env`.
- Do not commit anything. The user makes every commit.
- All test data is fake. Nothing from real company systems.
- When done, verify with FastAPI's `TestClient` using a fake `ANTHROPIC_API_KEY`
  set only in the test process. Do not leave a test file in the repo.
- Finish with a short plain-English explanation of each file and each design
  decision, so the user can explain every line in an interview.
