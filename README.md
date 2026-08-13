# ResiliCity 2026

ResiliCity 2026 is an interactive match-day event planning and climate-risk management dashboard centered around NRG Stadium in Houston, Texas. It combines scenario simulation, operational risk scoring, historical event signals, recommendations, and geospatial planning into one responsive command-center interface.

The application is implemented with **TypeScript**, **React**, **Tailwind CSS**, **Express**, **tRPC**, **Drizzle ORM**, **MySQL/TiDB**, **Recharts**, and the scaffolded **Google Maps** integration.

> ResiliCity is a planning and decision-support interface. Its simulation values are model outputs for planning exploration and should be calibrated against authoritative event, weather, traffic, and emergency-management data before operational use.

## Product capabilities

The dashboard provides KPI cards for crowd density, heat index, traffic congestion, and composite risk. Risk indicators use the required three-level color system: **green** for lower risk, **yellow** for watch conditions, and **red** for high-risk conditions.

The Scenario Lab lets planners configure attendance, start time, weather profile, temperature, and humidity. Each guest-mode simulation is calculated by the backend and saved to the database with its inputs, derived metrics, risk classifications, recommendations, carbon-saving estimate, and travel-time estimate.

Scenario History lists saved runs with timestamps and outcome summaries. Planners can select runs and compare their attendance, heat, congestion, and risk results. The recommendations panel translates the current model output into concrete resilience actions such as cooling-station deployment, EV shuttle lanes, staggered arrivals, overflow queuing zones, and pedestrian staffing.

The Live Risk Map is designed around the NRG Stadium area and uses the provided Google Maps wrapper for map rendering and geospatial overlays. The UI also includes a visible retry/fallback state when the external Google Maps script or API configuration is unavailable.

Historical event signals are visualized with **Recharts**, including temperature, attendance, and congestion trends. The layout is responsive: the desktop view uses a command-center grid, while the mobile view stacks the dashboard into a vertical planning workflow.

## Current access model

The current product experience is intentionally **guest-accessible**. The visible Sign in, Sign up, and Login controls have been removed, and the dashboard, Scenario Lab, history, and comparison workflows do not prompt for authentication.

The project template still contains the Manus authentication foundation and the `users` table because they are part of the full-stack scaffold. They are not required to use the current public planning workspace. If private planner accounts are introduced later, authentication and scenario ownership should be reintroduced deliberately with an explicit data-retention and access policy.

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + TypeScript | Interactive dashboard UI |
| Styling | Tailwind CSS 4 + shadcn/ui primitives | Design system, layout, controls, responsive styling |
| Routing | Wouter | Client-side routes for dashboard, Scenario Lab, and history |
| Data fetching | tRPC 11 + TanStack React Query | Typed frontend-to-backend procedures and caching |
| Backend | Express 4 + TypeScript | Runtime server and API host |
| API contract | tRPC | End-to-end typed procedures without duplicate REST contracts |
| Database | MySQL/TiDB + Drizzle ORM | Scenario persistence and typed database access |
| Maps | Google Maps JavaScript API through the scaffolded proxy | NRG Stadium map and overlay layer |
| Charts | Recharts | Historical trends and visual analytics |
| Testing | Vitest | Router, simulation, persistence, and risk contract tests |
| Build | Vite + esbuild | Frontend bundle and Node server bundle |

## Repository structure

```text
resilicity-2026/
├── client/
│   ├── index.html                 # Document metadata and analytics script
│   └── src/
│       ├── components/            # Reusable UI, MapView, and shadcn/ui components
│       ├── contexts/              # Theme context
│       ├── hooks/                 # Reusable React hooks
│       ├── lib/trpc.ts            # Typed tRPC client
│       ├── pages/
│       │   ├── Home.tsx           # Main ResiliCity command center
│       │   └── NotFound.tsx        # Fallback route
│       ├── App.tsx                # Routes and global providers
│       ├── index.css              # Design tokens and global styling
│       └── main.tsx               # React entrypoint
├── drizzle/
│   ├── schema.ts                 # Users and scenario database schema
│   └── migrations/                # Generated Drizzle migration files
├── server/
│   ├── db.ts                     # Database connection and query helpers
│   ├── routers.ts                # tRPC procedures and simulation logic
│   ├── scenarios.test.ts         # Scenario and guest-flow tests
│   ├── auth.logout.test.ts       # Scaffold authentication test
│   └── _core/                    # Framework runtime, OAuth, storage, maps, and env helpers
├── shared/                       # Shared constants and types
├── storage/                      # S3/storage integration helpers
├── todo.md                       # Feature and verification tracker
├── package.json                  # Scripts and dependencies
├── drizzle.config.ts             # Drizzle configuration
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This documentation
```

## Prerequisites

For local development, install **Node.js 22 or later**, **pnpm 10 or later**, and Git. A MySQL-compatible database is required for persistent scenario history. The hosted Manus project provides the database and environment values automatically; a standalone Codespace needs its own `DATABASE_URL`.

Check the installed tools with:

```bash
node --version
pnpm --version
git --version
```

## Run locally

Clone the repository and enter the project directory:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL> resilicity-2026
cd resilicity-2026
```

Install dependencies:

```bash
pnpm install
```

Create a local environment file from the example if one exists, or create `.env` manually:

```bash
cp .env.example .env 2>/dev/null || touch .env
```

Set at least a MySQL-compatible connection string for a standalone environment:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME
```

Start the development server:

```bash
pnpm dev
```

The application server runs on the port assigned by the runtime. Do not hardcode a port in application code. When running locally, open the URL printed by the server, commonly `http://localhost:3000`.

## GitHub Codespaces setup

Open the repository on GitHub, select **Code**, choose the **Codespaces** tab, and create a new Codespace from the required branch. Once the terminal is ready, run:

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

In the Codespaces **PORTS** panel, locate the port printed by the development server, usually `3000`. Set its visibility according to your team’s needs, then open the forwarded address in a browser.

For a Codespace that needs database-backed scenario persistence, configure the environment secret through the repository or Codespaces settings instead of committing credentials:

```bash
export DATABASE_URL='mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME'
```

For repeatable development, add `DATABASE_URL` under **Codespaces → Secrets** or the repository’s environment configuration. Never commit `.env`, database passwords, OAuth secrets, API keys, or production credentials.

A typical Codespaces session is:

```bash
# Terminal 1: install and validate
pnpm install
pnpm check
pnpm test

# Terminal 1: run the app
pnpm dev

# Terminal 2: optional production verification
pnpm build
```

If Codespaces reports that the port is not available, stop an older dev process and restart:

```bash
pkill -f "tsx watch server/_core/index.ts" || true
pnpm dev
```

## Environment variables

The hosted project receives several values from the Manus runtime. A standalone deployment must provide equivalent values or adjust the corresponding framework integrations.

| Variable | Required for | Description |
|---|---|---|
| `DATABASE_URL` | Persistent scenarios | MySQL/TiDB connection string |
| `JWT_SECRET` | Auth foundation | Session signing secret from the scaffold |
| `VITE_APP_ID` | Auth foundation | Manus OAuth application identifier |
| `OAUTH_SERVER_URL` | Auth foundation | OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Auth foundation | Frontend login portal URL; not shown in current guest UI |
| `BUILT_IN_FORGE_API_URL` | Hosted integrations | Server-side Manus API base URL |
| `BUILT_IN_FORGE_API_KEY` | Hosted integrations | Server-side Manus API key |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend integrations | Browser-accessible Manus API base URL |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend integrations | Browser integration key |
| `VITE_ANALYTICS_ENDPOINT` | Analytics | Analytics endpoint used in `client/index.html` |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics | Analytics website identifier |
| `OWNER_OPEN_ID` | Auth foundation | Project owner identity |
| `OWNER_NAME` | Auth foundation | Project owner display name |

The application reads runtime configuration through the scaffolded server environment helper. Do not hardcode secrets in TypeScript files or commit an `.env` file.

## Database workflow

The database schema is defined in `drizzle/schema.ts`. The current feature schema includes the authenticated scaffold `users` table and the scenario persistence table used by the public planning workspace.

Generate a migration after changing the Drizzle schema:

```bash
pnpm drizzle-kit generate
```

Review the generated SQL before applying it. In the managed Manus environment, apply reviewed migrations with the project database migration workflow. For a normal standalone environment, the package script can generate and migrate the schema:

```bash
pnpm db:push
```

The `db:push` script runs:

```bash
pnpm drizzle-kit generate && pnpm drizzle-kit migrate
```

Use caution with destructive schema changes. Production database data should be backed up before dropping columns or tables. Scenario calculations are derived from the saved input values, so schema changes should preserve those fields whenever possible.

## Backend API procedures

The frontend uses typed tRPC procedures rather than custom Axios or fetch wrappers. The main procedures are organized under `server/routers.ts`.

| Procedure | Type | Purpose |
|---|---|---|
| `dashboard.overview` | Public query | Returns NRG Stadium center coordinates, hotspots, and trend data |
| `scenarios.simulateAndSave` | Public mutation | Calculates risk metrics, recommendations, and saves a scenario |
| `scenarios.list` | Public query | Lists guest-accessible saved scenario history |
| `scenarios.compare` | Public query | Returns selected saved runs for comparison |
| `auth.me` | Scaffold query | Reads auth state; not used to gate current guest UI |
| `auth.logout` | Scaffold mutation | Clears the scaffold session cookie |

A simulation input has this general shape:

```ts
{
  name: "Warm evening arrival plan",
  attendance: 72000,
  startTime: "18:00",
  weather: "Hot & humid",
  temperatureF: 94,
  humidity: 72
}
```

The simulation returns crowd density, heat index, traffic congestion, overall risk, individual heat/traffic/crowd risk levels, carbon saved, minutes saved, and recommendations.

## Risk calculation model

The simulation engine is deterministic for a given input. It produces a planning estimate rather than a live forecast. The UI strictly maps risk states to the following palette:

| Risk level | Meaning | UI color |
|---|---|---|
| `green` | Lower operational concern | Green |
| `yellow` | Watch condition requiring monitoring or mitigation | Yellow |
| `red` | High-risk condition requiring intervention | Red |

When connecting live weather, traffic, or attendance sources, preserve the same contract and validate external data before sending it into the simulation procedure.

## Testing and quality checks

Run TypeScript validation:

```bash
pnpm check
```

Run the complete Vitest suite:

```bash
pnpm test
```

Run an individual scenario test file:

```bash
pnpm vitest run server/scenarios.test.ts
```

Run the production build:

```bash
pnpm build
```

The expected successful validation sequence is:

```bash
pnpm check && pnpm test && pnpm build
```

The tests cover deterministic risk classification, calculated scenario payloads, guest scenario creation, history listing, comparison behavior, persistence fields, and the existing scaffold auth contract.

## Production run

Build the frontend and server bundle:

```bash
pnpm build
```

Start the production server using the runtime-provided port:

```bash
pnpm start
```

The application is designed for the managed Node runtime used by the project. It does not require a custom Dockerfile for the current feature set. For hosted Manus deployments, saving a project checkpoint publishes the current version according to the project’s configured hosting workflow.

## Google Maps configuration and fallback

The map uses the provided `MapView` component in `client/src/components/Map.tsx`, which loads Google Maps through the scaffolded proxy integration. The application intentionally shows a retry card if the script fails, the API key is not available, the domain is not authorized, or the external script is blocked.

If the map shows **Google Maps layer unavailable**, verify the following:

```text
1. The Google Maps integration is enabled for the environment.
2. The API key is valid and has Maps JavaScript API access.
3. The current Codespaces or Manus preview domain is authorized.
4. Browser extensions or network policies are not blocking the maps script.
5. The page is not loading multiple Google Maps script instances.
```

The rest of the dashboard remains usable when the map is unavailable. The fallback state is intentional, but production operations should resolve the map configuration before relying on geospatial overlays.

## Troubleshooting

### `pnpm: command not found`

Install pnpm with Corepack or the official package manager, then reopen the terminal:

```bash
corepack enable
corepack prepare pnpm@10 --activate
pnpm --version
```

### TypeScript errors after editing files

Run the checker directly and inspect the first reported error:

```bash
pnpm check
```

Avoid editing generated files under `dist/`. Application source is primarily under `client/src`, `server`, `drizzle`, and `shared`.

### Database connection errors

Confirm that `DATABASE_URL` is present and reachable:

```bash
printenv DATABASE_URL
```

Then verify the schema migration:

```bash
pnpm drizzle-kit generate
pnpm db:push
```

Do not print database passwords in shared logs or commit them to GitHub.

### Blank or stale preview

Restart the development server and refresh the forwarded port:

```bash
pkill -f "tsx watch server/_core/index.ts" || true
pnpm dev
```

If the browser still shows stale assets, perform a hard refresh and verify that the correct Codespaces port is open.

### Google Maps fallback card

This indicates that the map script did not complete successfully. Use the map’s retry control, inspect browser console errors, and verify API key restrictions and domain configuration. The fallback does not indicate that the scenario engine or risk monitor is unavailable.

### `BadRequestError: request aborted`

A request-aborted message can occur when a browser preview, screenshot, or navigation cancels an in-flight request. Check the request status in the browser/network log. If the API request returns HTTP 200 and the UI recovers, it is usually a cancelled preview request rather than a persistent application failure.

## Recommended development workflow

Begin by updating the domain schema in `drizzle/schema.ts`, generate and review the migration, then update database helpers in `server/db.ts`. Add or update the typed tRPC procedure in `server/routers.ts`, connect the procedure through `client/src/lib/trpc.ts`, and build the UI in `client/src/pages` or reusable components.

After each feature, run `pnpm check`, add or update Vitest coverage, and run `pnpm test`. Use the responsive preview to inspect desktop and mobile behavior. Keep `todo.md` current so completed work and known limitations remain visible.

## Security and data-handling notes

Do not commit secrets, database credentials, API keys, OAuth tokens, or production exports. Use environment variables and the deployment platform’s secret manager. Do not store file bytes in database columns; use the project’s storage helper for uploaded files and persist only metadata or references in the database.

Guest scenario persistence currently uses the public workspace model. Before exposing the application to a large public audience, add rate limiting, retention rules, abuse protection, audit logging, and a clear ownership model for anonymous scenarios.

## Known limitation at the time of writing

The guest dashboard, scenario simulation, history, comparison, charts, responsive layout, typecheck, tests, and production build have been verified. The Google Maps area includes a resilient fallback, but the current preview environment may still show the fallback card when the external Google Maps script or API configuration is unavailable. Resolve the environment’s Maps key and domain authorization before treating the live map as production-ready.

## Useful commands reference

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# TypeScript validation
pnpm check

# Unit tests
pnpm test

# Production build
pnpm build

# Start production bundle
pnpm start

# Generate Drizzle migration
pnpm drizzle-kit generate

# Generate and apply database migrations
pnpm db:push

# Format project files
pnpm format
```

## License and ownership

Add the project’s final license and repository ownership information here before public distribution. Until then, treat this repository as private project code and follow the access policy configured for the connected GitHub repository.
