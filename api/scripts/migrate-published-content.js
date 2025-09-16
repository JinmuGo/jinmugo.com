var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) {
          k2 = k;
        }
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) {
          k2 = k;
        }
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) {
            if (Object.hasOwn(o, k)) {
              ar[ar.length] = k;
            }
          }
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) {
        return mod;
      }
      var result = {};
      if (mod != null) {
        for (var k = ownKeys(mod), i = 0; i < k.length; i++) {
          if (k[i] !== "default") {
            __createBinding(result, mod, k[i]);
          }
        }
      }
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const pocketbase_1 = __importDefault(require("pocketbase"));
const pbUrl = process.env.PB_URL || "http://127.0.0.1:8090";
const pb = new pocketbase_1.default(pbUrl);
function findMarkdownFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (item.endsWith(".md") && !item.endsWith(".en.md")) {
      files.push(fullPath);
    }
  }
  return files;
}
function extractPublishedBlogPost(filePath, type) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const { data: frontMatter } = (0, gray_matter_1.default)(content);
    if (frontMatter.draft === true) {
      return null;
    }
    const dirName = path.basename(path.dirname(filePath));
    const fileName = path.basename(filePath, ".md");
    const slug = fileName !== dirName ? fileName : dirName;
    return {
      slug,
      title: frontMatter.title,
      date: frontMatter.date,
      draft: false,
      tags: frontMatter.tags || [],
      lastmod: frontMatter.lastmod,
      category: frontMatter.category,
      summary: frontMatter.summary,
      type,
    };
  } catch (_error) {
    return null;
  }
}
async function upsertPost(post) {
  try {
    const existingPosts = await pb.collection("posts").getList(1, 1, {
      filter: `slug = "${post.slug}"`,
    });
    const postData = {
      slug: post.slug,
      title: post.title || "",
      date: post.date ? new Date(post.date).toISOString() : "",
      draft: post.draft || false,
      tags: post.tags || [],
      lastmod: post.lastmod ? new Date(post.lastmod).toISOString() : "",
      category: post.category || "",
      summary: post.summary || "",
      type: post.type,
    };
    if (existingPosts.items.length > 0) {
      await pb.collection("posts").update(existingPosts.items[0].id, postData);
    } else {
      await pb.collection("posts").create(postData);
    }
    return true;
  } catch (_error) {
    return false;
  }
}
async function migratePublishedContent() {
  const blogObsidianPath = path.join(process.cwd(), "..", "blog", "blog_obsidian");
  if (!fs.existsSync(blogObsidianPath)) {
    return;
  }
  let _totalProcessed = 0;
  let _totalMigrated = 0;
  let _totalSkipped = 0;
  const postsDir = path.join(blogObsidianPath, "post");
  if (fs.existsSync(postsDir)) {
    const postFiles = findMarkdownFiles(postsDir);
    let _successCount = 0;
    let _skippedCount = 0;
    for (const filePath of postFiles) {
      _totalProcessed++;
      const post = extractPublishedBlogPost(filePath, "post");
      if (post) {
        const success = await upsertPost(post);
        if (success) {
          _successCount++;
          _totalMigrated++;
        }
      } else {
        _skippedCount++;
        _totalSkipped++;
      }
    }
  }
  const memosDir = path.join(blogObsidianPath, "memo");
  if (fs.existsSync(memosDir)) {
    const memoFiles = findMarkdownFiles(memosDir);
    let _successCount = 0;
    let _skippedCount = 0;
    for (const filePath of memoFiles) {
      _totalProcessed++;
      const memo = extractPublishedBlogPost(filePath, "memo");
      if (memo) {
        const success = await upsertPost(memo);
        if (success) {
          _successCount++;
          _totalMigrated++;
        }
      } else {
        _skippedCount++;
        _totalSkipped++;
      }
    }
  }
}
if (require.main === module) {
  migratePublishedContent().catch(console.error);
}
//# sourceMappingURL=migrate-published-content.js.map
