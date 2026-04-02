#!/bin/sh
# Setup git hooks for submodules
# Runs automatically via `pnpm install` (prepare script)

HOOK_DIR=".git/modules/blog/blog_obsidian/hooks"

# Skip if submodule is not initialized
[ -d "$HOOK_DIR" ] || exit 0

cat > "$HOOK_DIR/pre-commit" << 'HOOK'
#!/bin/sh

FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$')
[ -z "$FILES" ] && exit 0

echo "$FILES" | xargs deno fmt
echo "$FILES" | xargs git add
HOOK

chmod +x "$HOOK_DIR/pre-commit"
echo "blog_obsidian pre-commit hook installed"
