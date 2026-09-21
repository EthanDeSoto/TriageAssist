# Triage Assist — Notes

Python version: 3.14.7

## Decisions

## Prompt changes
2026-09-11 — iPhone mail ticket came back high/access/identity_access.
Cause: "time-sensitive" in the priority definition let a user's timing preference inflate priority; no guidance on mobile mail routing.
Change: defined high as a real business deadline, added workaround → medium rule, routed mobile mail to service_desk/software.
Result: [fill in after retest]

Log 9-19 Restructured prompt by field; added question rules, confidence definitions, recent-change rule.
## Ship prep (2026-09-20)

Access code: backend checks X-Access-Code against DEMO_ACCESS_CODE using
secrets.compare_digest. Rejected full auth as days of work guarding a demo with
no user data. The app now refuses to boot without the code set, so a
misconfigured deploy fails loudly instead of quietly serving an open endpoint.
Rate limit runs before the code check so guessing the code is rate limited too.

Frontend keeps the code in React state only, not localStorage. A refresh asks
again. Traded convenience for not leaving a shared secret on disk.

Removed the Save button. It logged to the console and toasted "database coming
soon", which is a button that lies. Editing plus Copy as text / Copy JSON stays.
Save comes back when the database phase lands.

Deleted the empty db.py and dropped the unused triageId state in App.jsx.
