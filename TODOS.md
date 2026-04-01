# TODOS

## Unit tests for content pipeline scripts

**What:** Add Vitest tests for `apps/blog/scripts/build-content.js` and `apps/blog/scripts/translate.js`.

**Why:** These scripts are the core of the content publishing pipeline (Obsidian export, sync, translation) and have zero test coverage. Regressions here break the entire blog build.

**Pros:** Catches sync logic bugs (changed/skipped/removed counts), .md->.mdx rename edge cases, incremental translation detection, and draft exclusion before they hit CI.

**Cons:** Requires mocking filesystem operations and the obsidian-export binary. Moderate effort.

**Context:** Both scripts are pure Node.js with no framework dependencies. `build-content.js` does: binary selection by OS → exec obsidian-export → diff-based sync to src/content/ with .md→.mdx rename. `translate.js` does: find files without .en.md counterpart → skip drafts → call DeepL API → write translated files. Test files should go in `apps/blog/scripts/__tests__/`.

**Depends on / blocked by:** Nothing. Can be done independently.

## Draft preview deployments

**What:** Deploy draft content to a staging URL so drafts can be previewed before publishing.

**Why:** Currently drafts only exist in Obsidian. No way to see how they look on the actual site without marking them as published.

**Pros:** Catch formatting issues, broken links, and layout problems before readers see them. Especially valuable for bilingual posts.

**Cons:** Requires a second deployment target (e.g., GitHub Pages preview environment, Cloudflare Pages preview, or Vercel preview). Adds CI complexity.

**Context:** Approach C from the CI-First Pipeline design doc proposed this as part of a full automation system. Deferred as a standalone enhancement. Could use GitHub Pages environments or a separate static hosting provider for previews.

**Depends on / blocked by:** PR 1 (prebuild in CI) should land first so the preview pipeline has a working build.
