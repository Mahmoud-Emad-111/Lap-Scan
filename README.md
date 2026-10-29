# Medical Laboratory Management

Arabic RTL laboratory management system for one organization and its branches. The React/Inertia interface uses the versioned Laravel API for authentication, patient records, orders, samples, results, and operational reports.

The backend follows a lightweight modular-monolith structure: domain operations live in focused `app/Modules/*/Actions` classes, with Laravel models, policies, form requests, and API resources at the application boundary.

## Requirements

- PHP 8.3 or later with the PDO driver for the configured database
- Composer
- MySQL 8.4 for the Docker Compose setup, or another supported Laravel database

## Local setup

1. Install PHP dependencies with `composer install`.
2. Copy `.env.example` to `.env`, configure the database connection, and set `APP_KEY` by running `php artisan key:generate`.
3. Run `php artisan migrate`.
4. Seed the local demo accounts and clearly labeled sample catalog/order with `php artisan db:seed`.

The demo seeder is blocked in production. It creates:

| Role | Email |
| --- | --- |
| Lab administrator | `admin@lab.test` |
| Lab staff | `staff@lab.test` |
| Doctor | `doctor@lab.test` |
| Patient | `patient@lab.test` |

The default local password is `password`. Set `LAB_DEMO_PASSWORD` in `.env` to use a different local password. Demo catalog and order records are explicitly marked as examples and contain no clinical result values.

## Docker Compose

Set `DB_CONNECTION=mysql`, `DB_HOST=mysql`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_ROOT_PASSWORD` in `.env` before starting the Compose services. Database passwords must be non-empty. Compose waits for MySQL's health check before starting Laravel.

```shell
docker compose up -d --build
docker compose exec laravel php artisan migrate --force
docker compose exec laravel php artisan db:seed --force
```

Do not run `migrate:fresh` against a database containing data.

The demo seeder is intentionally unavailable in production. Provision production users and credentials through a trusted administrative process. The API does not expose public registration or unrestricted role assignment. Supported roles are `patient`, `doctor`, `lab_staff`, and `lab_admin`.

## Frontend development

The interface is a React + TypeScript Inertia application. Keep the existing Inertia entry point and role-aware shared layout; do not add a second client router. The current feature-oriented locations are:

| Purpose | Location |
| --- | --- |
| Inertia page entry points | `resources/js/pages/` |
| Shared laboratory UI and layout components | `resources/js/components/laboratory/` |
| Doctor feature pages, API service, and types | `resources/js/modules/doctors/` |
| Referral discount administration, API service, and types | `resources/js/modules/referral-discounts/` |
| Central HTTP client and response normalization | `resources/js/lib/api-client.ts` |
| Generated typed Laravel routes/actions | `resources/js/actions/` and `resources/js/routes/` |

Install JavaScript dependencies with `npm install`. Run the development server with `npm run dev`, check types with `npm run types:check`, check formatting with `npm run check`, and create a production build with `npm run build`.

`VITE_API_BASE_URL` is optional and defaults to same-origin requests. Set it to the API origin only when the API is hosted separately. The current login uses Sanctum bearer tokens sent by the centralized API client; it does not use cookie-based SPA authentication. For a cross-origin deployment, allow the frontend origin and the `Authorization`, `Accept`, and `Content-Type` headers in the API's CORS configuration. Do not enable credentialed cross-origin cookies unless the authentication architecture is intentionally changed.

To add a doctor feature page, place its page/component and domain types under `resources/js/modules/doctors/`, add typed API operations to `modules/doctors/services/doctorApi.ts`, and connect the page through the existing role-aware Inertia shell. For a new Laravel API endpoint, add the route/controller/request/resource, regenerate Wayfinder helpers with `php artisan wayfinder:generate --with-form --no-interaction`, then call the generated route through the feature API service. Keep page components free of direct network requests.

## Authentication

All endpoints are under `/api/v1`. Obtain a Sanctum bearer token with:

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password",
  "device_name": "api-client"
}
```

Send the returned token as `Authorization: Bearer <token>`. Login is limited to six attempts per minute. Tokens expire after 14 days by default; configure `SANCTUM_EXPIRATION` in minutes to change the lifetime.

## Available endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| `POST` | `/api/v1/login` | Public, rate-limited |
| `GET` | `/api/v1/me` | Authenticated |
| `DELETE` | `/api/v1/logout` | Authenticated |
| `GET`, `POST` | `/api/v1/branches` | Branch reads require staff access; create requires `lab_admin` |
| `GET`, `PUT/PATCH` | `/api/v1/branches/{branch}` | Branch reads require assigned staff access; updates require `lab_admin` |
| `GET`, `POST` | `/api/v1/patients` | `lab_staff` or `lab_admin` |
| `GET`, `PUT/PATCH` | `/api/v1/patients/{patient}` | `lab_staff` or `lab_admin` |
| `GET`, `POST` | `/api/v1/tests` | Authenticated catalog reads; create requires laboratory staff |
| `GET`, `PUT/PATCH` | `/api/v1/tests/{test}` | Active tests are visible to authenticated users; updates require laboratory staff |
| `GET`, `POST`, `PUT/PATCH` | `/api/v1/users` | `lab_admin` only; staff assignments are branch-scoped |
| `GET`, `POST` | `/api/v1/orders` | Laboratory staff on an assigned branch or `lab_admin` |
| `GET` | `/api/v1/orders/{order}` | Assigned laboratory staff or `lab_admin` |
| `GET` | `/api/v1/samples` | Laboratory staff on assigned branches or `lab_admin` |
| `POST` | `/api/v1/samples/{sample}/collection` | Records sample receipt for authorized staff |
| `GET` | `/api/v1/results` | Laboratory staff on assigned branches or `lab_admin` |
| `POST` | `/api/v1/order-items/{orderItem}/result` | Saves or updates an unapproved result draft |
| `POST` | `/api/v1/results/{result}/approval` | Approves a draft and makes it visible to the patient |
| `GET` | `/api/v1/results/{result}/revisions` | Authorized laboratory staff can review the immutable correction history |
| `POST` | `/api/v1/results/{result}/corrections` | Authorized branch staff or `lab_admin`; requires a reason and returns the corrected version to draft |
| `GET`, `PUT` | `/api/v1/doctor/profile` | Authenticated doctor; profile edits return verification to pending |
| `GET` | `/api/v1/doctors` | `lab_admin`; doctor verification queue |
| `PATCH` | `/api/v1/doctors/{doctor}/verification` | `lab_admin`; approve, reject, or suspend a doctor |
| `GET`, `POST` | `/api/v1/referral-discount-rules` | `lab_admin`; list and create patient referral discount rules |
| `PUT`, `PATCH` | `/api/v1/referral-discount-rules/{rule}` | `lab_admin`; update or deactivate a discount rule |
| `GET` | `/api/v1/doctor/branches`, `/api/v1/doctor/tests` | Verified doctor; active branch and test choices |
| `GET` | `/api/v1/doctor/patients?phone=...` | Verified doctor; exact-phone lookup with minimal patient fields |
| `GET`, `POST` | `/api/v1/doctor/orders` | Verified doctor; own referrals and referral creation |
| `GET` | `/api/v1/doctor/orders/{order}` | Only the referring doctor |
| `GET` | `/api/v1/doctor/results/{result}` | Verified referring doctor; approved results only |
| `GET` | `/api/v1/doctor/results/{result}/pdf` | Verified referring doctor; generated, authorized PDF download |
| `GET` | `/api/v1/dashboard` | Role-scoped dashboard counts |
| `GET` | `/api/v1/reports/operations` | Operational counts; laboratory staff or `lab_admin` |
| `GET` | `/api/v1/patient/orders` | Orders belonging to the authenticated patient |
| `GET` | `/api/v1/patient/results` | Approved results belonging to the authenticated patient |

Collections are paginated. Orders retain the test name, code, specimen type, and price at the time of registration. Each selected test creates a separately trackable sample. Results remain drafts until a laboratory user approves them; the patient portal returns approved results only. Correcting a released result stores its previous values and approval metadata in an immutable revision, records the correction reason and actor, and requires approval again before the corrected version is released. Staff access is limited to assigned branches, and patient access is limited to the account's linked patient profile.

Referral discounts are configured by `lab_admin` as a percentage or fixed amount, with optional minimum order value,
maximum discount, validity dates, doctor/branch targeting, and first-referral or all-referrals scope. “First referral”
means the patient's first doctor referral across all referring doctors. More-specific rules take precedence; rules
with equal precedence cannot overlap while active. New doctor referrals require exactly one applicable, currently
valid rule. The order stores its original subtotal, applied discount, final total, and a snapshot of the rule so later
rule edits do not change historical orders.
