# Security Production Sign-Off Evidence

Date: 2026-02-17
Branch: `testing`
Reference commit: `a547d91`

## Purpose

This document captures the evidence required by `docs/security-hardening.md` for production security sign-off.

## Evidence Matrix

| Item | Requirement | Status | Evidence |
|---|---|---|---|
| E-01 | Authorization tests proving no cross-account mutation paths | DONE | `api/src/listings/listings.security.spec.ts`, `pnpm -C api test:security` |
| E-02 | Upload abuse tests (spoofed file, quota, unauthenticated abuse) | DONE | `api/src/upload/upload.security.spec.ts`, `pnpm -C api test:security` |
| E-03 | Token handling evidence (refresh token inaccessible from JS) | DONE | `api/src/auth/auth.controller.ts` (`httpOnly: true`, `sameSite: 'strict'`, secure cookie policy), SH-06 refresh flow tests |
| E-04 | Dependency audit report attached to release | DONE | `pnpm -C api audit:prod` (no high/critical vulnerabilities) |
| E-05 | Security header validation report | DONE | `api/src/main.ts` (`helmet`), `web/next.config.ts` (`CSP`, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`) |
| E-06 | Incident response notes for credential rotation and rollback | DONE | `docs/secret-rotation-runbook.md` |

## Verification Run (2026-02-17)

1. `pnpm -C api test:security`
   - Result: PASS (4 suites, 16 tests).
2. `pnpm -C api audit:prod`
   - Result: PASS (`No known vulnerabilities found`).
3. `rg "Content-Security-Policy|Referrer-Policy|X-Content-Type-Options|X-Frame-Options|Permissions-Policy|poweredByHeader" web/next.config.ts`
   - Result: headers and `poweredByHeader: false` confirmed.
4. `rg "httpOnly|sameSite|secure" api/src/auth/auth.controller.ts`
   - Result: refresh cookie security attributes confirmed.
5. `rg "rollback|incident|Evidence to Store" docs/secret-rotation-runbook.md`
   - Result: rollback and incident handling guidance confirmed.

## Notes

- Re-run this verification block before each release candidate and attach command outputs to the release artifact.
