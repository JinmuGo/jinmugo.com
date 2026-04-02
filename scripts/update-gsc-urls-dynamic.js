#!/usr/bin/env node

import { unlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { config } from "dotenv"
import { GoogleAuth } from "google-auth-library"

config()

const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS
const GSC_SITE_URL = process.env.GSC_SITE_URL
const GSC_PROPERTY_ID = process.env.GSC_PROPERTY_ID

if (!GOOGLE_APPLICATION_CREDENTIALS || !GSC_SITE_URL || !GSC_PROPERTY_ID) {
  console.error("❌ Missing required environment variables:")
  console.error("   - GOOGLE_APPLICATION_CREDENTIALS")
  console.error("   - GSC_SITE_URL")
  console.error("   - GSC_PROPERTY_ID")
  process.exit(1)
}

// 포스트 데이터를 동적으로 가져오는 함수
async function getPostUrlMappings() {
  try {
    // Astro 빌드 후 생성되는 sitemap에서 URL 정보를 추출
    const { readFileSync, existsSync } = await import("node:fs")
    const sitemapPath = join(process.cwd(), "dist", "sitemap.xml")

    if (!existsSync(sitemapPath)) {
      console.log("⚠️  Sitemap not found, using static mappings")
      return getStaticUrlMappings()
    }

    const sitemapContent = readFileSync(sitemapPath, "utf-8")

    // XML에서 URL을 추출
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g)

    if (!urlMatches) {
      console.log("⚠️  No URLs found in sitemap, using static mappings")
      return getStaticUrlMappings()
    }

    const urls = urlMatches.map((match) => {
      return match.replace(/<\/?loc>/g, "")
    })

    // 새로운 URL 구조의 포스트들만 필터링
    const newPostUrls = urls.filter((url) => {
      const urlPath = new URL(url).pathname
      return urlPath.match(/^\/posts\/[^/]+$/) || urlPath.match(/^\/en\/posts\/[^/]+$/)
    })

    console.log(`📋 Found ${newPostUrls.length} new post URLs in sitemap`)

    // 기존 URL 구조로 매핑 생성
    const urlMappings = []

    for (const newUrl of newPostUrls) {
      const urlPath = new URL(newUrl).pathname
      const slug = urlPath.split("/").pop()
      const isEnglish = urlPath.startsWith("/en")

      // 카테고리 정보는 실제 포스트 파일에서 가져와야 하지만,
      // 여기서는 일반적인 카테고리들을 시도
      const possibleCategories = [
        "develop",
        "tech",
        "cloud",
        "thinking",
        "movie",
        "book",
        "experience",
        "health",
      ]

      for (const category of possibleCategories) {
        const oldUrl = isEnglish
          ? `${GSC_SITE_URL}/en/posts/${category}/${slug}`
          : `${GSC_SITE_URL}/posts/${category}/${slug}`

        urlMappings.push({
          oldUrl,
          newUrl,
          slug,
          category,
          isEnglish,
        })
      }
    }

    return urlMappings
  } catch (error) {
    console.error("❌ Failed to read sitemap:", error.message)
    console.log("⚠️  Falling back to static mappings")
    return getStaticUrlMappings()
  }
}

// 정적 URL 매핑 (fallback용) - 실제 카테고리 정보 기반
function getStaticUrlMappings() {
  return [
    // 한국어 포스트들
    {
      oldUrl: `${GSC_SITE_URL}/posts/experience/12th-9oormthon`,
      newUrl: `${GSC_SITE_URL}/posts/12th-9oormthon`,
      slug: "12th-9oormthon",
      category: "experience",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/cloud/amazon-q-developer-cli`,
      newUrl: `${GSC_SITE_URL}/posts/amazon-q-developer-cli`,
      slug: "amazon-q-developer-cli",
      category: "cloud",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/cloud/aws-clf-c02`,
      newUrl: `${GSC_SITE_URL}/posts/aws-clf-c02`,
      slug: "aws-clf-c02",
      category: "cloud",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/blog-comment-feautre-with-fuma-comment`,
      newUrl: `${GSC_SITE_URL}/posts/blog-comment-feautre-with-fuma-comment`,
      slug: "blog-comment-feautre-with-fuma-comment",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/thinking/book-and-movie`,
      newUrl: `${GSC_SITE_URL}/posts/book-and-movie`,
      slug: "book-and-movie",
      category: "thinking",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/movie/coffee-and-cigarettes`,
      newUrl: `${GSC_SITE_URL}/posts/coffee-and-cigarettes`,
      slug: "coffee-and-cigarettes",
      category: "movie",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/dns-deepdive-1`,
      newUrl: `${GSC_SITE_URL}/posts/dns-deepdive-1`,
      slug: "dns-deepdive-1",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/dns-deepdive-2`,
      newUrl: `${GSC_SITE_URL}/posts/dns-deepdive-2`,
      slug: "dns-deepdive-2",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/dns-deepdive-3`,
      newUrl: `${GSC_SITE_URL}/posts/dns-deepdive-3`,
      slug: "dns-deepdive-3",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/git-squash-vs-fixup`,
      newUrl: `${GSC_SITE_URL}/posts/git-squash-vs-fixup`,
      slug: "git-squash-vs-fixup",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/lazygit-work-lazily-smartly`,
      newUrl: `${GSC_SITE_URL}/posts/lazygit-work-lazily-smartly`,
      slug: "lazygit-work-lazily-smartly",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/movie/midsommar`,
      newUrl: `${GSC_SITE_URL}/posts/midsommar`,
      slug: "midsommar",
      category: "movie",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/migration-blog-from-nextjs-to-astro`,
      newUrl: `${GSC_SITE_URL}/posts/migration-blog-from-nextjs-to-astro`,
      slug: "migration-blog-from-nextjs-to-astro",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/monorepo-storybook-composition`,
      newUrl: `${GSC_SITE_URL}/posts/monorepo-storybook-composition`,
      slug: "monorepo-storybook-composition",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/book/process-economy`,
      newUrl: `${GSC_SITE_URL}/posts/process-economy`,
      slug: "process-economy",
      category: "book",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/proxy-no-more-retreat`,
      newUrl: `${GSC_SITE_URL}/posts/proxy-no-more-retreat`,
      slug: "proxy-no-more-retreat",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/movie/rashomon`,
      newUrl: `${GSC_SITE_URL}/posts/rashomon`,
      slug: "rashomon",
      category: "movie",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/the-mind-behind-linux`,
      newUrl: `${GSC_SITE_URL}/posts/the-mind-behind-linux`,
      slug: "the-mind-behind-linux",
      category: "develop",
      isEnglish: false,
    },
    {
      oldUrl: `${GSC_SITE_URL}/posts/develop/zotero-webdav-coolify`,
      newUrl: `${GSC_SITE_URL}/posts/zotero-webdav-coolify`,
      slug: "zotero-webdav-coolify",
      category: "develop",
      isEnglish: false,
    },

    // 영어 포스트들
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/experience/12th-9oormthon`,
      newUrl: `${GSC_SITE_URL}/en/posts/12th-9oormthon`,
      slug: "12th-9oormthon",
      category: "experience",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/cloud/amazon-q-developer-cli`,
      newUrl: `${GSC_SITE_URL}/en/posts/amazon-q-developer-cli`,
      slug: "amazon-q-developer-cli",
      category: "cloud",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/cloud/aws-clf-c02`,
      newUrl: `${GSC_SITE_URL}/en/posts/aws-clf-c02`,
      slug: "aws-clf-c02",
      category: "cloud",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/blog-comment-feautre-with-fuma-comment`,
      newUrl: `${GSC_SITE_URL}/en/posts/blog-comment-feautre-with-fuma-comment`,
      slug: "blog-comment-feautre-with-fuma-comment",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/thinking/book-and-movie`,
      newUrl: `${GSC_SITE_URL}/en/posts/book-and-movie`,
      slug: "book-and-movie",
      category: "thinking",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/movie/coffee-and-cigarettes`,
      newUrl: `${GSC_SITE_URL}/en/posts/coffee-and-cigarettes`,
      slug: "coffee-and-cigarettes",
      category: "movie",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/dns-deepdive-1`,
      newUrl: `${GSC_SITE_URL}/en/posts/dns-deepdive-1`,
      slug: "dns-deepdive-1",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/dns-deepdive-2`,
      newUrl: `${GSC_SITE_URL}/en/posts/dns-deepdive-2`,
      slug: "dns-deepdive-2",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/dns-deepdive-3`,
      newUrl: `${GSC_SITE_URL}/en/posts/dns-deepdive-3`,
      slug: "dns-deepdive-3",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/git-squash-vs-fixup`,
      newUrl: `${GSC_SITE_URL}/en/posts/git-squash-vs-fixup`,
      slug: "git-squash-vs-fixup",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/lazygit-work-lazily-smartly`,
      newUrl: `${GSC_SITE_URL}/en/posts/lazygit-work-lazily-smartly`,
      slug: "lazygit-work-lazily-smartly",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/movie/midsommar`,
      newUrl: `${GSC_SITE_URL}/en/posts/midsommar`,
      slug: "midsommar",
      category: "movie",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/migration-blog-from-nextjs-to-astro`,
      newUrl: `${GSC_SITE_URL}/en/posts/migration-blog-from-nextjs-to-astro`,
      slug: "migration-blog-from-nextjs-to-astro",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/monorepo-storybook-composition`,
      newUrl: `${GSC_SITE_URL}/en/posts/monorepo-storybook-composition`,
      slug: "monorepo-storybook-composition",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/book/process-economy`,
      newUrl: `${GSC_SITE_URL}/en/posts/process-economy`,
      slug: "process-economy",
      category: "book",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/proxy-no-more-retreat`,
      newUrl: `${GSC_SITE_URL}/en/posts/proxy-no-more-retreat`,
      slug: "proxy-no-more-retreat",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/movie/rashomon`,
      newUrl: `${GSC_SITE_URL}/en/posts/rashomon`,
      slug: "rashomon",
      category: "movie",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/the-mind-behind-linux`,
      newUrl: `${GSC_SITE_URL}/en/posts/the-mind-behind-linux`,
      slug: "the-mind-behind-linux",
      category: "develop",
      isEnglish: true,
    },
    {
      oldUrl: `${GSC_SITE_URL}/en/posts/develop/zotero-webdav-coolify`,
      newUrl: `${GSC_SITE_URL}/en/posts/zotero-webdav-coolify`,
      slug: "zotero-webdav-coolify",
      category: "develop",
      isEnglish: true,
    },
  ]
}

async function updateUrlInGSC(auth, oldUrl, newUrl) {
  try {
    console.log(`🔄 Updating URL in Google Search Console...`)
    console.log(`   Old: ${oldUrl}`)
    console.log(`   New: ${newUrl}`)

    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()

    // Google Search Console URL 변경 API 호출
    // 참고: GSC는 직접적인 URL 변경 API를 제공하지 않으므로,
    // 새로운 URL을 제출하고 기존 URL을 삭제하는 방식으로 처리

    // 1. 새로운 URL을 GSC에 제출
    const submitResponse = await fetch(
      `https://indexing.googleapis.com/v3/urlNotifications:publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: newUrl,
          type: "URL_UPDATED",
        }),
      },
    )

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.warn(`⚠️  Failed to submit new URL ${newUrl}: ${errorText}`)
      return false
    }

    console.log(`✅ New URL submitted successfully: ${newUrl}`)

    // 2. 기존 URL을 삭제 요청 (URL_DELETED 타입으로 제출)
    const deleteResponse = await fetch(
      `https://indexing.googleapis.com/v3/urlNotifications:publish`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: oldUrl,
          type: "URL_DELETED",
        }),
      },
    )

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      console.warn(`⚠️  Failed to delete old URL ${oldUrl}: ${errorText}`)
      // 새로운 URL은 성공했으므로 true 반환
      return true
    }

    console.log(`✅ Old URL deleted successfully: ${oldUrl}`)
    return true
  } catch (error) {
    console.error(`❌ Error updating URL ${oldUrl} -> ${newUrl}:`, error.message)
    return false
  }
}

async function updateAllUrlsInGSC() {
  try {
    console.log("🚀 Starting URL updates in Google Search Console...")

    // URL 매핑 가져오기
    const urlMappings = await getPostUrlMappings()
    console.log(`📋 Found ${urlMappings.length} URL mappings to process`)

    // 서비스 계정 JSON 키를 임시 파일로 저장
    const tempKeyPath = join(process.cwd(), "temp-service-account.json")
    writeFileSync(tempKeyPath, GOOGLE_APPLICATION_CREDENTIALS)

    // Google Auth 클라이언트 생성
    const auth = new GoogleAuth({
      keyFile: tempKeyPath,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    })

    let successCount = 0
    let failureCount = 0

    // 각 URL 매핑을 순차적으로 처리
    for (const { oldUrl, newUrl, slug, category, isEnglish } of urlMappings) {
      console.log(`\n📝 Processing: ${slug} (${category}) ${isEnglish ? "[EN]" : "[KO]"}`)

      const success = await updateUrlInGSC(auth, oldUrl, newUrl)
      if (success) {
        successCount++
      } else {
        failureCount++
      }

      // API 제한을 피하기 위해 요청 간 간격을 둠
      console.log("⏳ Waiting 1 second before next update...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // 임시 파일 삭제
    try {
      unlinkSync(tempKeyPath)
    } catch {
      // 무시
    }

    // 최종 결과 요약
    console.log("\n📊 Final Results:")
    console.log(`✅ Successfully updated: ${successCount} URLs`)
    console.log(`❌ Failed updates: ${failureCount} URLs`)
    console.log(`📈 Total attempted: ${urlMappings.length}`)

    if (failureCount > 0) {
      console.log("\n⚠️  Some updates failed. Check the logs above for details.")
      process.exit(1)
    } else {
      console.log("\n🎉 All URL updates completed successfully!")
      console.log("\n💡 Next steps:")
      console.log("1. Check Google Search Console to verify the changes")
      console.log("2. Monitor your site's search performance")
      console.log("3. Consider setting up 301 redirects for old URLs if needed")
      console.log("4. Update any internal links that still point to old URLs")
    }
  } catch (error) {
    console.error("❌ Failed to update URLs in Google Search Console:", error.message)
    process.exit(1)
  }
}

// 스크립트 실행
updateAllUrlsInGSC()
