#!/usr/bin/env node
// 글의 원본은 pkm vault(`PKM_BLOG_DIR`)이고 repo의 `obsidian/post`는 CI 배포용 사본이다.
//   import: repo obsidian/post -> vault. 처음 이관할 때 한 번 쓴다. vault에 있는 글은 덮어쓰지 않는다.
//   export: vault -> repo obsidian/post. draft: true 글은 복사하지 않는다.
//           vault에 없거나 draft인 글은 --prune을 줄 때만 repo에서 지운다.
// 기본은 dry-run이고 --apply를 주면 실제로 복사한다.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const DEFAULT_VAULT_POST = path.join(os.homedir(), "brain/3.Resource/BlogPost/post")
const IGNORED = new Set([".DS_Store"])

const args = process.argv.slice(2)
const mode = args[0]
const apply = args.includes("--apply")
const prune = args.includes("--prune")

function option(name, fallback) {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : fallback
}

if (mode !== "import" && mode !== "export") {
  console.error(
    "usage: node scripts/pkm-sync.js <import|export> [--apply] [--prune] [--vault DIR] [--repo DIR]",
  )
  process.exit(1)
}

const vaultPost = option("--vault", process.env.PKM_BLOG_DIR?.trim() || DEFAULT_VAULT_POST)
const repoPost = option("--repo", path.join(repoRoot, "obsidian/post"))
const [from, to] = mode === "import" ? [repoPost, vaultPost] : [vaultPost, repoPost]

function listFiles(root) {
  const files = new Map()
  if (!fs.existsSync(root)) {
    return files
  }
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED.has(entry.name)) {
        continue
      }
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.isFile()) {
        files.set(path.relative(root, full), full)
      }
    }
  }
  walk(root)
  return files
}

if (!fs.existsSync(from)) {
  console.error(`source does not exist: ${from}`)
  process.exit(1)
}

const src = listFiles(from)

function isDraft(file) {
  const frontmatter = fs.readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return frontmatter ? /^draft:\s*true\s*$/m.test(frontmatter[1]) : false
}

// export는 공개 대상만 복사한다. 글 폴더의 대표 파일(<slug>/<slug>.md)이 draft면 폴더 전체를 뺀다.
const draftSlugs = []
if (mode === "export") {
  for (const [rel, file] of src) {
    const parts = rel.split(path.sep)
    if (parts.length === 2 && parts[1] === `${parts[0]}.md` && isDraft(file)) {
      draftSlugs.push(parts[0])
    }
  }
  for (const rel of [...src.keys()]) {
    if (draftSlugs.includes(rel.split(path.sep)[0])) {
      src.delete(rel)
    }
  }
}
const dst = listFiles(to)
const plan = { add: [], update: [], skip: [], remove: [] }

for (const [rel, srcPath] of src) {
  if (!dst.has(rel)) {
    plan.add.push(rel)
  } else if (!fs.readFileSync(srcPath).equals(fs.readFileSync(dst.get(rel)))) {
    // import는 vault 원본을 덮어쓰지 않는다.
    ;(mode === "import" ? plan.skip : plan.update).push(rel)
  }
}
if (mode === "export" && prune) {
  for (const rel of dst.keys()) {
    if (!src.has(rel)) {
      plan.remove.push(rel)
    }
  }
}

console.info(`${mode}: ${from} -> ${to}${apply ? "" : "  (dry-run)"}`)
if (draftSlugs.length) {
  console.info(`  draft 제외: ${draftSlugs.length} (${draftSlugs.join(", ")})`)
}
for (const [kind, list] of Object.entries(plan)) {
  console.info(`  ${kind}: ${list.length}`)
  for (const rel of list.slice(0, 200)) {
    console.info(`    ${kind === "skip" ? "! " : ""}${rel}`)
  }
}
if (plan.skip.length) {
  console.info("  ! = vault 쪽이 달라서 덮어쓰지 않음")
}

if (!apply) {
  console.info("\n실제로 반영하려면 --apply를 붙인다.")
  process.exit(0)
}

for (const rel of [...plan.add, ...plan.update]) {
  const target = path.join(to, rel)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  // import는 복사 시점에도 기존 파일을 덮어쓰지 않는다.
  const flags = mode === "import" ? fs.constants.COPYFILE_EXCL : 0
  try {
    fs.copyFileSync(src.get(rel), target, flags)
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error
    }
    console.error(`! 이미 있어서 건너뜀: ${rel}`)
  }
}
for (const rel of plan.remove) {
  fs.rmSync(path.join(to, rel))
}
console.info("done")
