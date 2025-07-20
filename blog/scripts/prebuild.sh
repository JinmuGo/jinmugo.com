#!/bin/sh
set -e

target_dir="src/content"
echo "Resetting $target_dir directory..."
# 폴더만 삭제하고 파일은 유지
find $target_dir -type d -mindepth 1 -exec rm -rf {} + 2>/dev/null || true
mkdir -p $target_dir

# 3. OS 또는 아키텍처에 따라 적절한 obsidian-export 실행
arch=$(uname -m)
os=$(uname)

if [ "$os" = "Darwin" ]; then
  echo "Running obsidian-export-mac..."
  ./scripts/obsidian-export-mac blog_obsidian $target_dir
elif [ "$arch" = "aarch64" ]; then
  echo "Running obsidian-export-aarch64..."
  ./scripts/obsidian-export-aarch64 blog_obsidian $target_dir
else
  echo "Running obsidian-export..."
  ./scripts/obsidian-export blog_obsidian $target_dir
fi

# 4. .md 파일들을 .mdx로 변환
# echo "Renaming .md files to .mdx..."
# find $target_dir -type f -name '*.md' -exec sh -c '
#   for file; do
#     mv -- "$file" "${file%.md}.mdx"
#   done
# ' sh {} +

echo "Prebuild script completed."
