// REF: https://github.com/MaxKim-J/maxkim-j.github.io

import fs from "fs/promises";
import path from "node:path";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

const TARGET_LANG = "en";
const CONTENT_DIR_PATH = path.resolve("blog_obsidian");

// Recursive function to find all .md files in a directory
const findMdFilesRecursively = async (dirPath) => {
  const files = [];

  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        // Skip .git and other hidden directories
        if (!item.name.startsWith(".")) {
          const subFiles = await findMdFilesRecursively(fullPath);
          files.push(...subFiles);
        }
      } else if (item.isFile() && path.extname(item.name) === ".md") {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }

  return files;
};

const isDraft = async (filePath) => {
  try {
    const absolutePath = path.resolve(CONTENT_DIR_PATH, filePath);
    const fileContent = await fs.readFile(absolutePath, "utf8");
    const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch && frontmatterMatch[1]) {
      return frontmatterMatch[1].includes("draft: true");
    }
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath} to check draft status:`, error.message);
  }
  return false;
};

const validateTranslateNecessity = async ({ lang }) => {
  // Recursively find all .md files in the blog_obsidian directory
  const allMdFiles = await findMdFilesRecursively(CONTENT_DIR_PATH);

  // Get relative paths for easier comparison
  const allMdFilesRelative = allMdFiles.map((file) => path.relative(CONTENT_DIR_PATH, file));

  // Filter original Korean content (files that don't end with .{lang}.md)
  const allOriginalBlogContents = allMdFilesRelative.filter((file) => !file.endsWith(`.${lang}.md`));

  // Get translated files and map them back to original names
  const allTranslatedBlogContents = allMdFilesRelative
    .filter((file) => file.endsWith(`.${lang}.md`))
    .map((file) => file.replace(`.${lang}.md`, ".md"));

  // Find files that haven't been translated yet
  const allNotYetTranslatedBlogContentsWithDrafts = allOriginalBlogContents.filter(
    (file) => !allTranslatedBlogContents.includes(file),
  );

  const allNotYetTranslatedBlogContents = [];
  for (const file of allNotYetTranslatedBlogContentsWithDrafts) {
    if (!(await isDraft(file))) {
      allNotYetTranslatedBlogContents.push(file);
    } else {
      console.info(`번역 스킵(draft: true): ${file}`);
    }
  }

  return { allOriginalBlogContents, allNotYetTranslatedBlogContents };
};

const parseMdxFileContent = async (contentName) => {
  const contentPath = path.resolve(CONTENT_DIR_PATH, contentName);
  const fileString = await fs.readFile(contentPath, "utf8");
  return { content: fileString, path: contentPath };
};

async function main() {
  console.info("openAI API로 블로그 글 번역을 합니다.");

  const { allOriginalBlogContents, allNotYetTranslatedBlogContents } = await validateTranslateNecessity({
    lang: TARGET_LANG,
  });

  console.info(`전체 한국어 컨텐츠 ${allOriginalBlogContents.length}개`);
  console.info(
    `${TARGET_LANG}으로 번역이 안 된 블로그 컨텐츠 ${allNotYetTranslatedBlogContents.length}개를 번역합니다.`,
  );
  console.info();

  const translateTargetContents = await Promise.all(
    allNotYetTranslatedBlogContents.map((content) => parseMdxFileContent(content)),
  );

  let count = allNotYetTranslatedBlogContents.length;
  let idx = 0;

  for (let targetContents of translateTargetContents) {
    const { content, path } = targetContents;
    const start = performance.now();
    console.info();
    console.info(`-----------------------`);
    console.info(`(${idx + 1}/${count}) ${path} 번역 시작`);

    const url = "https://api-free.deepl.com/v2/translate";
    const options = {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: content,
        target_lang: TARGET_LANG,
      }),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      const translatedContent = data.translations[0].text.replace("---.", "---");
      const translatedMdxPath = path.replace(/\.md$/, `.${TARGET_LANG}.md`);
      console.info(`${translatedMdxPath}에 번역 파일을 작성합니다.`);

      await fs.writeFile(translatedMdxPath, translatedContent);
    } catch (error) {
      console.error("Error:", error);
    }

    const end = performance.now();
    console.info(`(${idx + 1}/${count}) ${path} 번역 완료, duration: ${end - start}ms`);
    idx += 1;
    console.info(`-----------------------`);
    console.info();
  }
}

main();
