# TODOS

## Draft preview deployments

**What:** Deploy draft content to a staging URL so drafts can be previewed before publishing.

**Why:** Currently drafts only exist in Obsidian. No way to see how they look on the actual site without marking them as published.

**Pros:** Catch formatting issues, broken links, and layout problems before readers see them. Especially valuable for bilingual posts.

**Cons:** Requires a second deployment target (e.g., GitHub Pages preview environment, Cloudflare Pages preview, or Vercel preview). Adds CI complexity.

**Context:** The CI prebuild prerequisite is complete. The remaining work depends on choosing and configuring a second deployment target.
