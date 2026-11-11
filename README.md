# fo-web

This repository is the `apps/fo-web` git submodule of [push-dot/push-fe](https://github.com/push-dot/push-fe).

The Vite dev server uses port 5174. Install, test, and CI run at the `push-fe` workspace root. Do not treat this repository as a standalone install root.

History was extracted from `push-fe` `develop` at `193dbd5e2ecfa6766028b18c6fc167afb6bd436f`.

## CI

`.github/workflows/ci.yml` checks out `push-dot/push-fe` (default `develop`), initializes the `apps/fo-mobile` submodule, checks this commit out at `apps/fo-web`, then runs `pnpm install --frozen-lockfile`, `pnpm exec turbo run typecheck lint test --filter=@push/fo-web...`, and `pnpm --filter @push/fo-web build` from the push-fe root.

`pnpm-lock.yaml` lives only in push-fe. If this PR changes dependencies, frozen install fails on purpose. Update the lockfile on a push-fe branch with pnpm 11.0.4 and put this on its own line in the PR body:

    push-fe-ref: <branch-or-sha>

The `workflow_dispatch` input `push-fe-ref` overrides that line. The default is `develop`.
