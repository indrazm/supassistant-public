# superassistant

pnpm monorepo.

## Structure

- `apps/` — applications
- `packages/` — shared packages

### apps/api

Hono HTTP API.

```sh
pnpm --filter @superassistant/api dev      # dev server with watch
pnpm --filter @superassistant/api build    # compile to dist/
pnpm --filter @superassistant/api start    # run compiled output
```

Configuration via environment variables (see `apps/api/.env.example`).

Workspace globs are defined in `pnpm-workspace.yaml`.

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
