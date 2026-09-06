# superassistant

pnpm monorepo.

## Structure

- `apps/` — applications
- `packages/` — shared packages

### apps/api

Hono HTTP API with credentials auth (Better Auth on Prisma + PostgreSQL) and a chat endpoint.

```sh
docker compose -f docker-compose.dev.yml up -d        # Postgres on :54329
cp apps/api/.env.example apps/api/.env                # set BETTER_AUTH_SECRET
pnpm install
pnpm --filter @superassistant/api db:push             # create auth tables
pnpm api:dev                              # dev server with watch (loads .env)
pnpm --filter @superassistant/api build               # typecheck (no emit; runs TS directly)
pnpm --filter @superassistant/api start               # run via tsx
```

Configuration via environment variables (see `apps/api/.env.example`).

Workspace globs are defined in `pnpm-workspace.yaml`.

### apps/worker

BullMQ job worker (URL document ingestion into Neo4j graph + Qdrant vectors).

```sh
docker compose -f docker-compose.dev.yml up -d   # start dev infra (Redis, Neo4j, Qdrant)
pnpm worker:dev                            # dev worker with watch (loads .env)
pnpm --filter @superassistant/worker build # typecheck (no emit; runs TS directly)
pnpm --filter @superassistant/worker start # run via tsx
```

Documents are ingested via `POST /api/ingest {url}` (or the "Ingest document" button in
the platform UI). The worker fetches the page, extracts graph facts with an LLM, embeds
chunks, and writes to both stores via `@anvia/graph` (`ingestGraphTextToStores`).
pnpm worker:dev # dev worker with watch (loads .env)
pnpm --filter @superassistant/worker build # typecheck (no emit; runs TS directly)
pnpm --filter @superassistant/worker start # run via tsx

````

Configuration via environment variables (see `apps/worker/.env.example`).

## UI

`packages/ui` — [shadcn/ui](https://ui.shadcn.com) (base-nova style, neutral base color) on Tailwind CSS v4.

```tsx
import { Button } from "@superassistant/ui/components/button";
import { useIsMobile } from "@superassistant/ui/hooks/use-mobile";
import { cn } from "@superassistant/ui/lib/utils";
````

Import `@superassistant/ui/globals.css` once in your app entry for the theme tokens.

Add components with:

```sh
pnpm dlx shadcn@latest add <component> -c packages/ui
```

## Tooling

Linting and formatting via [oxc](https://oxc.rs):

- `oxlint` — config in `.oxlintrc.json`
- `oxfmt` — config in `.oxfmtrc.json`

```sh
pnpm lint      # oxlint
pnpm fmt       # oxfmt (write)
pnpm fmt:check # oxfmt (check only)
```

## Setup

```sh
pnpm install
```

Requires Node.js and pnpm (see `devEngines.packageManager` in `package.json`).
