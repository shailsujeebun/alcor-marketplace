# Production Test Plan

Date: 2026-02-17
Owner: QA + Backend + Frontend + DevOps + Security

## Goal

Define the best practical way to validate production readiness before release:

- prove critical user flows work on production-like infrastructure
- prove security controls still hold under realistic usage
- prove performance, reliability, and recovery targets are met

## Best Way To Execute This

Use a staged, gate-based process where each phase must pass before the next phase starts.

1. Validate in CI first (`build`, `lint`, `unit`, `e2e`, `security tests`, `dependency audit`).
2. Deploy to staging that mirrors production (same services and network rules).
3. Run automated smoke/UAT + API authorization matrix tests.
4. Run performance tests (load + soak) with strict SLO thresholds.
5. Run security dynamic tests (DAST) and fix blocking findings.
6. Run resilience drills (dependency outage simulation).
7. Run backup/restore and migration rollback rehearsal.
8. Run canary deploy with post-deploy smoke checks and alert validation.

This is the best approach because it catches issues early, then validates real-world behavior before production exposure.

## Production Test Gates

## Gate 0 - CI Baseline

- Required:
  - `pnpm -C api build`
  - `pnpm -C api test`
  - `pnpm -C api test:e2e -- --runInBand`
  - `pnpm -C api test:security`
  - `pnpm -C api audit:prod`
  - `pnpm -C web lint`
  - `pnpm -C web build`
- Pass criteria:
  - all checks green
  - zero high/critical dependency vulnerabilities

## Gate 1 - Staging Smoke and UAT

- Scope:
  - login/register/refresh/logout
  - ad posting wizard and uploads
  - category/template-driven form flow
  - admin moderation actions
  - company listing/details pages
- Pass criteria:
  - critical flows succeed end-to-end
  - no P0/P1 defects open

## Gate 2 - Authorization and Data Protection

- Run role matrix tests for `guest`, `user`, `dealer`, `manager/admin`.
- Include explicit negative tests:
  - cross-account listing update attempts (`403`)
  - protected admin endpoints as non-admin (`403`)
  - invalid/expired token behavior (`401`)
- Pass criteria:
  - no BOLA/IDOR bypass
  - no privilege escalation path

## Gate 3 - Performance and Capacity

- Tooling: `k6` (or Locust).
- Endpoints:
  - `/listings` read/search
  - `/auth/*`
  - upload token and upload endpoints
- Suggested thresholds:
  - API `p95 < 300ms` for core reads
  - error rate `< 1%` under target load
  - no resource saturation (CPU/memory/DB pool)
- Include:
  - spike test
  - sustained soak test (6-24h)

## Gate 4 - Security Dynamic Testing

- Tooling: OWASP ZAP baseline/full scan against staging.
- Focus:
  - auth/session and cookie handling
  - missing/insecure headers
  - input validation issues
  - XSS/SQLi patterns
- Pass criteria:
  - zero unresolved high/critical findings
  - accepted medium findings tracked with remediation dates

## Gate 5 - Resilience and Recovery

- Failure drills:
  - Redis down
  - MinIO down
  - email provider unavailable
- Validate:
  - graceful degradation behavior
  - retry/backoff behavior
  - no data corruption
- Backup and restore:
  - restore DB and object storage into clean environment
  - run smoke flow on restored data
- Migration rehearsal:
  - `prisma migrate deploy` on production-like clone
  - rollback procedure verified

## Gate 6 - Release and Post-Deploy

- Deployment strategy:
  - canary or blue/green
- Required checks after deploy:
  - automated smoke tests
  - security header spot check
  - error and latency dashboard review
  - alert routing verification (on-call paging)
- Exit criteria:
  - all gates passed
  - sign-off evidence document updated

## Artifacts To Store Per Release

- CI run URL and commit SHA
- staging test report (smoke/UAT/auth matrix)
- load and soak test reports
- DAST report and risk exceptions
- backup/restore drill report
- migration/rollback rehearsal report
- production canary validation checklist

## Suggested Cadence

- Every PR: Gate 0
- Every release candidate: Gates 1-5
- Production release: Gate 6 + artifact archive
