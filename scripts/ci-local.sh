#!/usr/bin/env bash
# .github/workflows/ci.yaml의 세 job(Lint, Test, Content, Types & Build)을 push 전에 그대로 돌린다.
# 의존성 취약점 검사는 .github/workflows/audit.yaml이 따로 맡는다.
# lefthook pre-push가 부른다. 급할 때는 `LEFTHOOK=0 git push`로 건너뛴다.
set -euo pipefail
cd "$(dirname "$0")/.."

# mise를 켜지 않은 셸(에디터, 에이전트)에서 push해도 mise.toml의 Node로 돈다.
if [[ -z "${CI_LOCAL_IN_MISE:-}" ]] && command -v mise >/dev/null 2>&1; then
  CI_LOCAL_IN_MISE=1 exec mise exec -- bash "$0" "$@"
fi

step() { printf '\n\033[1m▶ %s\033[0m\n' "$*"; }

# CI는 .nvmrc 버전으로 돈다. Astro는 Node 패치 버전까지 검사하므로 로컬도 같은 버전이어야 한다.
want="$(tr -d '[:space:]' < .nvmrc)"
have="$(node -v | sed 's/^v//')"
if [[ "$have" != "$want" && "$have" != "$want".* ]]; then
  echo "Node $have 이다. .nvmrc는 $want 를 요구한다. 'mise install' 후 다시 push한다." >&2
  exit 1
fi

step "pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile --prefer-offline >/dev/null

step "Lint"
pnpm check

step "Test"
pnpm test

step "Content, Types & Build"
pnpm content:doctor
pnpm typecheck
pnpm astro build
pnpm verify:tables
pnpm verify:links

printf '\n\033[1m✓ CI와 같은 검사를 모두 통과했다\033[0m\n'
