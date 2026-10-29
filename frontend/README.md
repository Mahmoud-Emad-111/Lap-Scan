# React frontend

This standalone React 19, TypeScript, and Vite application contains the patient portal, doctor portal, and laboratory dashboard. Laravel remains the source of truth for API data, validation, authentication, and authorization.

## Requirements and setup

- Node.js 24 or later
- A running Laravel API for authenticated workflows

From this directory:

```shell
npm install
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

In another terminal, start Laravel from the repository root with `php artisan serve --host=127.0.0.1 --port=8000`. Configure the backend database and credentials in the root `.env` as described in the repository README.

## Environment and API authentication

| Variable            | Purpose                                                               | Local development value |
| ------------------- | --------------------------------------------------------------------- | ----------------------- |
| `VITE_API_BASE_URL` | API origin; the centralized client appends generated `/api/...` paths | `http://localhost:8000` |

Copy `.env.example` to `.env` and adjust the API origin for your environment. Use the API origin only, without an `/api` suffix. Leave `VITE_API_BASE_URL` empty for a same-origin production deployment.

The login flow uses Sanctum personal access tokens stored in `sessionStorage` and sent as bearer tokens by `src/lib/api-client.ts`. It does not use cross-origin cookies or the Sanctum CSRF cookie endpoint. For local cross-origin development, set `FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173` in the Laravel root `.env`; Laravel's CORS configuration allows these frontend origins and the required JSON and authorization headers without enabling credentialed requests. For a separate production frontend origin, set `FRONTEND_URL` to that origin on the API server.

## Commands

```shell
npm install
npm run dev
npm run types:check
npm run check
npm run build
```

`npm run build` writes the production site to `frontend/dist`. It can run independently from Laravel when dependencies are installed. Typed Laravel route/action helpers are generated source files; after changing API routes, regenerate them from the repository root:

```shell
php artisan wayfinder:generate --with-form --path=frontend/src --no-interaction
```

## Structure

```text
src/
├── app/                 # React Router configuration and route access rules
├── components/          # Shared UI and laboratory workflow components
├── lib/                 # Central API client and utilities
├── modules/             # Feature pages, API services, and domain types
├── pages/               # Existing portal composition
├── routes/              # Generated typed Laravel route helpers
├── actions/             # Generated typed Laravel controller actions
├── types/               # Shared API and domain types
├── wayfinder/           # Generated Wayfinder types
├── styles/              # Tailwind CSS entry point
└── main.tsx             # React application entry point
```

Feature-specific pages, services, hooks, and types belong in their owning `src/modules/<feature>/` directory. Shared UI belongs in `src/components/`; keep feature-only UI inside the feature. React Router definitions live in `src/app/`.

## Adding a page or API operation

1. Add the page and any feature-specific components or types under `src/modules/<feature>/`.
2. Register its path and access rule in `src/app/routes.ts` and `src/app/router.tsx`.
3. Add typed endpoint functions to the feature's `services/` file. Use `apiRequest` from `src/lib/api-client.ts`; do not call `fetch` from a page or hardcode endpoint URLs in UI.
4. For a new backend route, add the Laravel route/controller/request/resource, then run the Wayfinder generation command above. Import the generated helper from `@/actions/` or `@/routes/`.
5. Preserve Laravel's API Resource response shape and rely on backend validation and authorization as the security boundary.

## Production and direct navigation

The frontend's default build output is `dist/`. The repository's Nginx image serves that directory and falls back to `index.html` for React Router navigation and refreshes. It forwards `/api/*`, `/sanctum/*`, and `/up` to Laravel instead of the SPA fallback. A same-domain build can leave `VITE_API_BASE_URL` empty; configure it during the build if the API is hosted separately.
