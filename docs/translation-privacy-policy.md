# Translation Data Privacy Policy

## Purpose

This policy defines what text is allowed to be sent to external translation providers.

## Environment Controls

- `TRANSLATION_EXTERNAL_ENABLED`:
  - `true` (default): external translation route is enabled.
  - `false`: route is disabled and returns `503`.
- `TRANSLATION_ALLOW_PII`:
  - `false` (default): blocks translation of text that appears to contain personal/sensitive data.
  - `true`: allows such text when explicitly approved.

## Allowed External Translation Content

- Public, non-sensitive UI labels.
- Generic product copy and navigation text.
- Static hints/placeholders that do not contain personal data.

## Disallowed by Default

- User-entered free text that may include personal data.
- Contact details (emails, phone numbers, URLs tied to user identity).
- Credentials, tokens, secrets, or account metadata.
- Private support messages or conversations.

## Product Behavior

- If external translation is disabled, translation requests fail closed (`503`) and UI keeps original text.
- If sensitive patterns are detected and `TRANSLATION_ALLOW_PII=false`, the text is not sent externally.

## Ownership

- Security + Product approve any exceptions to this policy.
- Engineering must keep route safeguards aligned with this document.
