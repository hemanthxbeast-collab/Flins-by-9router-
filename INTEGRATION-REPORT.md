# Flins functional UI integration report

## Delivered system

This delivery replaces the static Flins concept with a runnable full-stack application. The `client` directory contains a responsive React interface built with Vite. It authenticates a user, sends typed or browser-recognized voice commands to the REST API, displays task status and server responses, reads responses aloud where browser speech synthesis is available, and renders a private task history. The `server` directory contains an Express API, a SQLite persistence layer, authenticated task endpoints, an intent router, validation, rate limits, and automated API tests.

The component is deliberately functional while keeping unsupported third-party actions honest: Spotify, YouTube, and Outlook flows are routed and persisted as simulated provider actions. The system does not claim to control an external account until provider-specific OAuth credentials and a production adapter are configured.

## Integration flow

The client sends `POST /api/auth/register` or `POST /api/auth/login` with an email and password. The API hashes passwords with bcrypt and issues a signed, eight-hour JWT. The client stores only the access token in browser local storage for this local MVP; a production deployment should instead use secure, `HttpOnly`, `Secure`, `SameSite` cookies with CSRF protection or a platform-native secure credential store.

Authenticated users submit `POST /api/tasks` with a command. The API validates size and type with Zod, resolves an intent through `server/src/intent.js`, records the command, response, status, and JSON metadata in SQLite, and returns the task. `GET /api/tasks` returns only the requesting user's 50 newest tasks. The UI communicates success, clarification requirements, and network/authentication failures without requiring a page reload.

SQLite uses WAL mode and a user/time index for low-contention reads. It is appropriate for a local and single-instance MVP. For multi-instance production, replace it with a managed PostgreSQL or MySQL service, apply schema migrations, connection pooling, point-in-time recovery, and a read replica strategy where justified by observed load.

## Security controls

The API enables Helmet headers, explicit CORS origins and methods, a 16 KB JSON body limit, rate limiting, bcrypt password hashing, signed and expiring JWTs, authorization middleware on all task routes, parameterized SQL through `better-sqlite3`, and Zod validation. React escapes rendered text by default; the client does not inject task content as HTML. The command normalizer also strips angle brackets before processing.

Before real service integrations, add OAuth 2.0 Authorization Code + PKCE, encrypted server-side refresh-token storage backed by a managed KMS, least-privilege scopes, token rotation/revocation, audit events with transcript/message redaction, request IDs, outbound allowlists, and confirmation gates for consequential actions such as email delivery. Never put OAuth client secrets, refresh tokens, or provider API keys in the React bundle. Enforce HTTPS, HSTS, dependency scanning, secret scanning, and regular threat-model review in deployment pipelines.

## Error handling and edge cases

The API returns a consistent `{ error: { code, message } }` form for invalid input, expired/missing sessions, duplicate accounts, missing routes, rate limits, and internal failures. Browser microphone denial, unavailable speech recognition, unrecognized commands, and request failures are surfaced as actionable UI messages. Commands are capped at 500 characters, input bodies at 16 KB, and task listings at 50 records.

For production provider calls, use strict client timeouts, capped exponential backoff only for safe/idempotent operations, circuit breakers, queues for long-running work, and a fallback response that makes the interruption clear. Do not retry send-email requests without an idempotency key and user-visible confirmation state.

## Testing results

`server/test/api.test.js` is a Node test suite that starts the API against an in-memory database and covers health reporting, registration, JWT-authorized task execution, history persistence, unauthenticated access, and malformed credentials. The build verification runs the Vite production build. Run `npm test` and `npm run build` from the project root after dependencies are installed.

Recommended next tests are component tests with React Testing Library, contract tests against mocked provider APIs, browser tests using Playwright for registration and voice fallback paths, load tests with k6, OWASP ZAP/DAST scans in a staging environment, and UAT covering keyboard navigation, mobile layouts, screen-reader labels, consent wording, ambiguous voice instructions, offline recovery, and confirmation before any irreversible action.

## Performance and reliability plan

The UI immediately changes state before the API response to keep interaction feedback perceptibly fast. The local endpoint is intentionally small, indexed, and performs only deterministic routing, so the 500 ms service target is feasible locally and should be measured at p50/p95/p99 in production. Third-party API latency must be measured separately and presented as progress rather than blocking the UI.

For scalability, deploy stateless API instances behind a load balancer, replace local SQLite with managed relational storage, add Redis for rate-limit and ephemeral command-response caching only where privacy allows, put static frontend assets behind a CDN, and use asynchronous workers for slow provider calls. Track latency, error rates, queue depth, authentication failures, and provider availability with alerts tied to operational runbooks. A 99.99% uptime objective requires redundant multi-zone infrastructure, monitored dependency budgets, tested failover, backups, and recovery objectives; it cannot be guaranteed by the application code alone.

## Maintenance plan

Patch dependencies monthly and urgently for critical advisories, run automated lint/test/build/security checks on every pull request, require code review for production changes, rotate secrets on a defined schedule or incident, exercise backup restoration quarterly, test disaster recovery at least annually, and review access/audit logs regularly. Maintain a provider integration matrix documenting scopes, owners, rate limits, webhook policies, and failure fallbacks.
