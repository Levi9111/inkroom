# Security & Privacy Policy

Inkroom takes security and privacy seriously. As a tool designed for educational classrooms where participants may include children, our security and privacy model follows **Privacy by Default** and **Zero-Trust for Ephemeral Participants**.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within Inkroom, please do **NOT** open a public issue. Instead, report it privately:

1. **Email**: Send detailed disclosure information to `security@inkroom.org`.
2. **GitHub Security Advisory**: Open a draft advisory through [GitHub Security Advisories](https://github.com/Levi9111/inkroom/security/advisories/new).

Please include:
- A description of the issue and potential impact
- Steps to reproduce or proof-of-concept exploit
- Proposed remediation (if available)

We will acknowledge receipt within **48 hours** and provide a patch timeline within **7 days**.

## Threat Model & Privacy Principles

1. **Privacy for Minors (COPPA & GDPR-K Compliance)**:
   - Students join using ephemeral, short-lived room codes without creating accounts or supplying email addresses.
   - Display names are purely ephemeral in room presence awareness and are never retained for marketing or tracking.
   - No third-party tracking scripts, advertising trackers, or telemetry beacons are present in the core application.

2. **Room Code Guessing & Entropy**:
   - Room codes use an unambiguous 8-character alphabet (Crockford base32 excluding confusing glyphs `0`, `O`, `I`, `L`, `1`).
   - Rate limiting prevents brute force room code discovery on the server.
   - Teacher control tokens are placed in URL fragments (`#secret`) so they are never transmitted to server access logs.

3. **Content Security & Sanitization**:
   - Board content avoids `innerHTML` injection.
   - LaTeX mathematical expressions are parsed using KaTeX in strict mode with `trust: false`.
   - Uploaded media is restricted to strict MIME types (PNG, JPEG, WebP, PDF) and stripped of unnecessary EXIF metadata.

4. **Self-Hosting Transparency**:
   - All server persistence adapters and storage are under the self-hoster's direct infrastructure control.
