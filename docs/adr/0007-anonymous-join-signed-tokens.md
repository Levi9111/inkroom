# ADR 0007: Anonymous Join with Signed Room Tokens

## Status
Accepted

## Context
For classroom use, student onboarding must be instantaneous (under 10 seconds). Requiring student sign-up creates massive friction and exposes minor student personal data to privacy liabilities (COPPA, GDPR-K).

## Decision
Allow students to join anonymously with an 8-character room code and display name. Issue short-lived HMAC-signed JWT tokens containing `{ boardId, role, participantId }`. Teacher authority is established via a high-entropy secret kept in the URL hash fragment (`/t/<id>#<secret>`).

## Rationale
- Zero account registration overhead for students.
- URL fragments are never sent over HTTP request headers or logged in web server access logs.
- Server validates JWT claims on WebSocket connection upgrade before admitting participants.
