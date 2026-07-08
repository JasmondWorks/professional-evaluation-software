PES SOFTWARE

Exhaustive Project Analysis

Security · Architecture · Remediation Roadmap



1. The "Write-Only" Black Hole Architecture

CAUTION — Major Architectural Discovery
For the majority of complex mathematical models, there is no way to retrieve the persisted values. The system acts as a write-only black hole.

How It Works Currently

• User navigates to a model form in app/(admin)/models/ (e.g. personnel-utilization, stress, org-structure, redundancy-index).
• User inputs parameters and hits Submit or Run Model.
• The frontend computes and/or calls a POST API route (e.g. /api/personnelUtilization/route.ts).
• The backend INSERTs the result into the database (e.g. personnel_utilization, personnel_redundancy, stress_analysis_results).
• The flow ends here.
The Missing Piece

There are zero GET API routes and no UI dashboard components built to retrieve, display, graph, or report on this persisted model data.
• Cannot view historical personnel_utilization data.
• Cannot see past stress_analysis_results.
• Cannot track personnel_redundancy over time.
The data is successfully saved to PostgreSQL, but the application provides no mechanism to view or use it after submission. The buttons simply run the math and store it in a void.

2. Gamification: Hall of Fame & Book of Records

To incentivise employees, the system includes a "Hall of Fame" and "Book of Records" (first-book-api, second-book-api).
Implementation Details

Component
Detail
Routes
app/api/hall-of-fame/route.ts, app/api/first-book-api/performance/route.ts
Logic
These are among the only functional GET routes. They retrieve data from the database and support basic pagination (page, limit, offset).
Security Flaw
Routes are completely unauthenticated. Anyone hitting /api/first-book-api/performance can retrieve all performance records, descriptions, and user achievements — no role check or JWT validation.

3. Subscription & Payment Flow (Paystack)

The application monetises via tiered subscriptions using Paystack and PayPal (app/api/paystack, app/api/paypal).
Webhook Implementation (paystack/webhook/route.ts)

The Good
• Webhook correctly verifies the Paystack signature using HMAC SHA-512 (crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)). This prevents attackers from spoofing payment success events.
• Handles upgrades correctly (marking previous plans as upgraded) and inserts new plans into subscriptions_info with an idempotency check (ON CONFLICT (reference) DO NOTHING).
Active Subscription Check (subscriptions/active/route.ts)

The Bad
• The GET route to check for an active subscription expects an email in the URL query string (?email=admin@org.com).
Security Flaw
There is no authentication check. An attacker can query the subscription status, plan name, and expiry date of any organisation simply by guessing their email address.

4. Frontend Architecture, State, and Routing

Role-Based Routing

Zone
Description
app/(admin)
Full dashboard — run mathematical models, goals, surveys, and billing.
app/employee
Limited view for self-appraisals and viewing goals.
app/(hod)
Folder does not exist. HOD logic is currently bundled into admin/employee views, or has not been built.
State Management (app/state/store.ts)

The frontend uses Redux Toolkit with 12+ slices (goal, notification, action, task, user, etc.). While the frontend state architecture is robust, it sends its data to a highly fragile backend.
IDOR in Data Fetching

When the dashboard (e.g. Quickstats.tsx) fetches stats, it decodes the JWT locally, extracts the user (org name), and sends it in the body of a POST request to /api/getStats.
Architectural Flaw — Insecure Direct Object Reference (IDOR)
The backend API routes blindly accept this string and fetch data based on it. Any user can fetch any organisation's top-level stats by changing the string in the payload.

5. Summary of Backend Security & Structural Debt

Even factoring in the gamification and payment flows, the core backend structural issues remain:

1. Dead Security Middleware
   app/middleware.ts (handling JWT verification and rate limiting) is ignored by Next.js. None of the API routes are actually protected by middleware.
2. Fake JWT Verification
   API routes use jwt.decode(token) instead of jwt.verify(token, secret). The server accepts any forged token.
3. Widespread SQL Injection
   45+ instances of prisma.$queryRawUnsafe exist, often interpolating user input directly.
4. Data Exposure
   Routes like /api/getUsers execute SELECT \* FROM pesuser and return password hashes to the frontend.

5. Updated Unified Action Plan

The following phased plan addresses all identified issues in priority order.

Phase
Timeline
Focus
Phase 1
Weeks 1–3
Complete the 'Black Hole' Loop — Build missing GET API routes and frontend dashboard components for all persisted model data.
Phase 2
Weeks 4–5
Stop the Security Bleeding — Fix JWT auth (jwt.verify), consolidate middleware, secure data-fetching routes.
Phase 3
Weeks 6–8
Eradicate SQL Injection — Audit all $queryRawUnsafe, convert to Prisma ORM or safe tagged templates; enforce Zod validation.
Phase 4
Weeks 9–12
Production Polish — Move model computations server-side, add Jest unit tests, purge backup.sql from Git history.

Phase 1 Detail: Complete the Black Hole Loop (Weeks 1–3)

• Build missing GET API routes for personnelUtilization, stress_analysis_results, personnel_redundancy, etc.
• Build corresponding frontend dashboard components in app/(admin)/dashboard/ or app/(admin)/models/ to display historical tables and charts of persisted model data.
Phase 2 Detail: Stop the Security Bleeding (Weeks 4–5)

• Fix JWT Auth: Replace all jwt.decode with jwt.verify. Consolidate app/middleware.ts into root middleware.
• Secure Data Fetching: Stop sending email or user strings in API request bodies or query params. The backend must extract identity from the cryptographically verified JWT.
Phase 3 Detail: Eradicate SQL Injection & Enforce Types (Weeks 6–8)

• Audit all uses of $queryRawUnsafe. Convert to Prisma ORM calls (e.g. prisma.pesuser.findMany()) or safe tagged templates ($queryRaw).
• Implement existing Zod validation schemas across all POST routes.
Phase 4 Detail: Production Polish (Weeks 9–12)

• Move all mathematical computations (e.g. Queuing Theory loops) off the frontend and strictly onto the backend.
• Implement Jest unit tests for core Operations Research models.
• Purge backup.sql from Git history.
