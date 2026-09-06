# superassistant

pnpm monorepo.

## Structure

- `apps/` — applications
- `packages/` — shared packages

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
