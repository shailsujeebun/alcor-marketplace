# Security Hardening Plan (2026-02-17)

## Purpose

This document turns the current security review into an implementation backlog with:

- clear owner per item
- clear priority (`P0`, `P1`, `P2`)
- explicit acceptance criteria
- explicit verification tests

## Priority Definitions

- `P0`: Must fix before production rollout or before opening public traffic.
- `P1`: High-value hardening for current milestone; complete right after `P0`.
- `P2`: Important defense-in-depth and maturity work.

## Security Backlog

| ID | Priority | Area | Owner | Status |
|---|---|---|---|---|
| SH-01 | P0 | Listing authorization (BOLA/IDOR) | Backend | DONE |
| SH-02 | P0 | Company authorization (BOLA/IDOR) | Backend | DONE |
| SH-03 | P0 | Lock public reference-data writes | Backend | DONE |
| SH-04 | P0 | Upload abuse hardening | Backend + DevOps | TODO |
| SH-05 | P0 | Remove sensitive token/code logs | Backend | TODO |
| SH-06 | P0 | Refresh token transport hardening | Backend + Frontend | TODO |
| SH-07 | P0 | Global throttling + endpoint rate limits | Backend | TODO |
| SH-08 | P1 | Secret management / fail-fast config | DevOps + Backend | TODO |
| SH-09 | P1 | Password + verification anti-bruteforce policy | Backend | TODO |
| SH-10 | P1 | HTTP security headers / CSP | Backend + Frontend | TODO |
| SH-11 | P1 | Dependency vulnerability remediation | DevOps + Backend | TODO |
| SH-12 | P1 | Translation data privacy controls | Frontend + Product + Security | TODO |
| SH-13 | P2 | Security CI gates (SAST/secret scan/audit) | DevOps | TODO |
| SH-14 | P2 | Security-focused automated test suite | QA + Backend + Frontend | TODO |

## Detailed Work Items

### SH-01 - Listing Authorization (BOLA/IDOR)

- **Risk**: Any authenticated user may mutate listings they do not own.
- **Affected paths**:
  - `api/src/listings/listings.controller.ts`
  - `api/src/listings/listings.service.ts`
- **Required changes**:
  - Pass current user identity into all mutating listing endpoints.
  - Enforce owner check in service layer for:
    - `PATCH /listings/:id`
    - `PUT /listings/:id/attributes`
    - `PUT /listings/:id/contact`
    - `POST /listings/:id/submit`
    - `POST /listings/:id/pause`
    - `POST /listings/:id/resume`
    - `POST /listings/:id/resubmit`
  - Allow bypass only for `ADMIN`/`MANAGER`.
- **Acceptance criteria**:
  - User A cannot modify User B listing on any endpoint above (`403`).
  - Owner and admins can perform allowed actions.
- **Verification tests**:
  - Integration tests for each endpoint with 3 users: owner, other user, admin.

### SH-02 - Company Authorization (BOLA/IDOR)

- **Risk**: Any authenticated user may update any company.
- **Affected paths**:
  - `api/src/companies/companies.controller.ts`
  - `api/src/companies/companies.service.ts`
- **Required changes**:
  - Require ownership/company membership (`OWNER` role) for `PATCH /companies/:id`.
  - Keep admin/manager override.
  - Resolve actor from JWT user id, not request payload.
- **Acceptance criteria**:
  - Non-member receives `403` for company update.
  - Member owner and admin paths still work.
- **Verification tests**:
  - Integration tests for member/non-member/admin update scenarios.

### SH-03 - Lock Public Reference Data Writes

- **Risk**: Public write endpoints enable spam/data poisoning.
- **Affected paths**:
  - `api/src/categories/categories.controller.ts`
  - `api/src/brands/brands.controller.ts`
  - `api/src/activity-types/activity-types.controller.ts`
  - `api/src/countries/countries.controller.ts`
  - `api/src/cities/cities.controller.ts`
- **Required changes**:
  - Restrict all create endpoints to `ADMIN`/`MANAGER` or admin-only as required.
  - Keep read endpoints public.
- **Acceptance criteria**:
  - Unauthenticated and normal authenticated users receive `401/403`.
  - Admin can still create.
- **Verification tests**:
  - Auth matrix tests (anonymous, user, manager/admin).

### SH-04 - Upload Abuse Hardening

- **Risk**: Unauthenticated uploads + public bucket can be abused for storage and malicious files.
- **Affected paths**:
  - `api/src/upload/upload.controller.ts`
  - `api/src/upload/upload.service.ts`
- **Required changes**:
  - Add access control for direct upload endpoint or issue short-lived guest upload tokens.
  - Validate by magic bytes (not MIME header only).
  - Enforce per-user/IP quotas and request burst limits.
  - Restrict allowed folder targets and extensions server-side.
  - Revisit public bucket policy; prefer private bucket + controlled delivery.
- **Acceptance criteria**:
  - MIME spoofed files are rejected.
  - Upload quota exceeded returns `429`.
  - Anonymous abusive upload attempts are blocked.
- **Verification tests**:
  - Negative tests for spoofed content, oversize, burst upload, and folder traversal.

### SH-05 - Remove Sensitive Token/Code Logging

- **Risk**: Password reset tokens and verification codes are exposed in logs.
- **Affected paths**:
  - `api/src/auth/auth.service.ts`
- **Required changes**:
  - Remove plaintext logs for reset tokens and verification codes.
  - Add log redaction policy for sensitive auth fields.
- **Acceptance criteria**:
  - No logs contain raw reset tokens or verification codes.
- **Verification tests**:
  - `rg "reset token|verification code|Password reset token|Email verification code" api/src` returns no sensitive logging lines.

### SH-06 - Refresh Token Transport Hardening

- **Risk**: Refresh token is JS-readable and sent in JSON body (high impact under XSS).
- **Affected paths**:
  - `web/src/stores/auth-store.ts`
  - `web/src/lib/auth-api.ts`
  - `api/src/auth/auth.controller.ts`
  - `api/src/auth/auth.service.ts`
- **Required changes**:
  - Store refresh token in `HttpOnly`, `Secure`, `SameSite=Strict` cookie set by backend.
  - Remove refresh token from frontend JS storage and API JSON responses where possible.
  - Keep refresh-token rotation on each refresh and revoke old session.
  - Add CSRF protection for cookie-based refresh/logout endpoints.
- **Acceptance criteria**:
  - Frontend JS cannot read refresh token.
  - Refresh flow still works across reloads.
  - Replay of an old refresh token fails.
- **Verification tests**:
  - Browser/E2E test confirms no refresh token in `document.cookie`.
  - Integration test confirms one-time refresh token rotation.

### SH-07 - Global Throttling and Endpoint-Specific Rate Limits

- **Risk**: Auth and public submission endpoints are brute-force/spam targets.
- **Affected paths**:
  - `api/src/app.module.ts`
  - `api/src/auth/auth.controller.ts`
  - `api/src/dealer-leads/dealer-leads.controller.ts`
  - `api/src/upload/upload.controller.ts`
- **Required changes**:
  - Register `ThrottlerGuard` globally (`APP_GUARD`).
  - Add tighter route-specific limits for:
    - `/auth/login`
    - `/auth/verify-email`
    - `/auth/forgot-password`
    - `/auth/resend-verification`
    - `/dealer-leads`
    - `/upload/images`
- **Acceptance criteria**:
  - Exceeding limits returns `429` with consistent response shape.
- **Verification tests**:
  - Load test scripts triggering threshold behavior per endpoint.

### SH-08 - Secrets and Fail-Fast Configuration

- **Risk**: Weak defaults (`dev-secret`, `minioadmin`) could leak into production.
- **Affected paths**:
  - `api/src/config/configuration.ts`
- **Required changes**:
  - Remove insecure production defaults for JWT/S3 credentials.
  - Add environment validation schema and fail startup on missing prod secrets.
  - Create secret rotation runbook.
- **Acceptance criteria**:
  - Production startup fails when required secrets are absent/weak.
  - No production config path uses fallback secret literals.
- **Verification tests**:
  - Startup validation tests with invalid/missing env variables.

### SH-09 - Password and Verification Policy

- **Risk**: Current minimum password and verification flow are susceptible to weak credential usage/bruteforce.
- **Affected paths**:
  - `api/src/auth/dto/register.dto.ts`
  - `api/src/auth/auth.service.ts`
- **Required changes**:
  - Increase password policy strength (length + entropy checks).
  - Add failed verification-attempt counters and temporary lockouts.
  - Add resend cooldown per account and IP.
- **Acceptance criteria**:
  - Weak passwords rejected with clear error.
  - Excessive code attempts/resends are blocked.
- **Verification tests**:
  - Integration tests for lockout and cooldown behavior.

### SH-10 - HTTP Security Headers and CSP

- **Risk**: Missing baseline hardening against common browser attacks.
- **Affected paths**:
  - `api/src/main.ts`
  - `web/next.config.ts`
- **Required changes**:
  - Apply `helmet` in API with tuned policy.
  - Add strict response headers in Next app (CSP, frame-ancestors, referrer-policy, X-Content-Type-Options).
  - Enable HSTS in production.
- **Acceptance criteria**:
  - Security headers present for API and web responses.
- **Verification tests**:
  - Automated header assertions in integration tests.

### SH-11 - Dependency Vulnerability Remediation

- **Risk**: Known vulnerabilities in production dependency tree (notably `qs`; Prisma chain advisories).
- **Affected scope**:
  - `api/package.json`
  - lockfiles and dependency overrides
- **Required changes**:
  - Upgrade/override vulnerable dependencies where patch exists.
  - Add policy: no unresolved high/critical vulnerabilities in prod deps.
- **Acceptance criteria**:
  - `pnpm -C api audit --prod` reports no high/critical vulnerabilities.
  - Exceptions documented with explicit compensating controls.
- **Verification tests**:
  - CI step for dependency audit with severity threshold.

### SH-12 - Translation Data Privacy Controls

- **Risk**: User text sent to third-party translation service may violate privacy/compliance expectations.
- **Affected paths**:
  - `web/src/app/api/translate/route.ts`
- **Required changes**:
  - Add environment switch to disable external translation in sensitive environments.
  - Add explicit product policy on what text may be translated externally.
  - Optionally move to approved provider with contractual data controls.
- **Acceptance criteria**:
  - Translation route can be fully disabled by config.
  - Privacy policy and product behavior are aligned.
- **Verification tests**:
  - Route test for disabled mode.
  - Documentation sign-off by product/security.

### SH-13 - Security CI Gates

- **Risk**: Security regressions can merge unnoticed.
- **Owner**: DevOps
- **Required changes**:
  - Add secret scanning in CI.
  - Add SAST checks (configurable baseline).
  - Keep dependency audit gating.
- **Acceptance criteria**:
  - PR fails on secret leak/high-risk findings.
- **Verification tests**:
  - CI dry-runs proving failed and passing scenarios.

### SH-14 - Security Test Suite Expansion

- **Risk**: Current test coverage is near-zero for real attack paths.
- **Required changes**:
  - Add API integration tests for authZ, authN abuse, rate limits, upload hardening.
  - Add E2E security flows for cross-account access attempts.
  - Add load-abuse tests for auth and public endpoints.
- **Acceptance criteria**:
  - Core security scenarios are automated and required in CI.
- **Verification tests**:
  - New test suite stats and CI checks visible in pipeline.

## Progress Log

### 2026-02-17 - SH-01 Completed

- **Implemented by**: Backend
- **Scope delivered**:
  - Enforced ownership/admin checks for all user-level listing mutation endpoints.
  - Controller now passes authenticated actor (`id`, `role`) to mutation service methods.
  - Service now blocks non-owner, non-admin/non-manager mutation attempts with `403`.
- **Updated files**:
  - `api/src/listings/listings.controller.ts`
  - `api/src/listings/listings.service.ts`
  - `docs/security-hardening.md`
- **Verification**:
  - `pnpm -C api build` passes after authorization changes.
  - `pnpm -C api test` passes after authorization changes.

### 2026-02-17 - SH-02 Completed

- **Implemented by**: Backend
- **Scope delivered**:
  - Enforced company update authorization on `PATCH /companies/:id`.
  - Only company `OWNER` or platform `ADMIN`/`MANAGER` can update company details.
  - Controller now passes authenticated actor (`id`, `role`) into update service.
- **Updated files**:
  - `api/src/companies/companies.controller.ts`
  - `api/src/companies/companies.service.ts`
  - `docs/security-hardening.md`
- **Verification**:
  - `pnpm -C api build` passes after authorization changes.
  - `pnpm -C api test` passes after authorization changes.

### 2026-02-17 - SH-03 Completed

- **Implemented by**: Backend
- **Scope delivered**:
  - Locked reference-data create endpoints to `ADMIN`/`MANAGER` roles.
  - Kept corresponding read endpoints public.
- **Endpoints protected**:
  - `POST /categories`
  - `POST /brands`
  - `POST /activity-types`
  - `POST /countries`
  - `POST /cities`
- **Updated files**:
  - `api/src/categories/categories.controller.ts`
  - `api/src/brands/brands.controller.ts`
  - `api/src/activity-types/activity-types.controller.ts`
  - `api/src/countries/countries.controller.ts`
  - `api/src/cities/cities.controller.ts`
  - `docs/security-hardening.md`
- **Verification**:
  - `pnpm -C api build` passes after authorization changes.
  - `pnpm -C api test` passes after authorization changes.

## Milestone Plan

### Milestone 1 (Target: 2026-02-24)

- SH-01, SH-02, SH-03, SH-04, SH-05, SH-06, SH-07

### Milestone 2 (Target: 2026-03-03)

- SH-08, SH-09, SH-10, SH-11, SH-12

### Milestone 3 (Target: 2026-03-10)

- SH-13, SH-14

## Required Evidence Before Production Sign-Off

1. Authorization tests proving no cross-account mutation paths.
2. Upload abuse tests (spoofed file, quota, unauthenticated abuse).
3. Token handling evidence (refresh token inaccessible from JS).
4. Dependency audit report attached to release.
5. Security header validation report.
6. Incident response notes for credential rotation and rollback procedure.
