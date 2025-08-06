import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// 원격 Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRemoteMigration() {
  console.log("🧪 원격 Supabase DB 마이그레이션 테스트 시작...\n");

  try {
    // 1. 원격 DB 연결 확인
    console.log("🔗 원격 DB 연결 확인 중...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from("posts")
      .select("count")
      .limit(1);

    if (connectionError) {
      console.error("❌ 원격 DB 연결 실패:", connectionError.message);
      return;
    }
    console.log("✅ 원격 DB 연결 성공\n");

    // 2. 전체 포스트 수 확인
    const { data: allPosts, error: allPostsError } = await supabase
      .from("posts")
      .select("id, slug, title, type");

    if (allPostsError) {
      console.error("❌ 전체 포스트 조회 실패:", allPostsError);
      return;
    }

    console.log(`📊 전체 포스트 수: ${allPosts.length}`);

    // 3. 포스트와 메모 분류
    const posts = allPosts.filter((p) => p.type === "post");
    const memos = allPosts.filter((p) => p.type === "memo");

    console.log(`📝 포스트 수: ${posts.length}`);
    console.log(`📌 메모 수: ${memos.length}\n`);

    // 4. 최근 포스트 5개 표시
    const { data: recentPosts, error: recentPostsError } = await supabase
      .from("posts")
      .select("slug, title, date, type")
      .order("date", { ascending: false })
      .limit(5);

    if (recentPostsError) {
      console.error("❌ 최근 포스트 조회 실패:", recentPostsError);
      return;
    }

    console.log("📅 최근 포스트 5개:");
    recentPosts.forEach((post, index) => {
      console.log(`  ${index + 1}. [${post.type}] ${post.title || "No title"} (${post.slug})`);
    });
    console.log();

    // 5. 태그 통계
    const { data: tagStats, error: tagStatsError } = await supabase.from("posts").select("tags");

    if (tagStatsError) {
      console.error("❌ 태그 통계 조회 실패:", tagStatsError);
      return;
    }

    const tagCounts: Record<string, number> = {};
    tagStats.forEach((post) => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    console.log("🏷️  상위 10개 태그:");
    sortedTags.forEach(([tag, count], index) => {
      console.log(`  ${index + 1}. ${tag}: ${count}개`);
    });
    console.log();

    // 6. 카테고리 통계
    const { data: categoryStats, error: categoryStatsError } = await supabase
      .from("posts")
      .select("category");

    if (categoryStatsError) {
      console.error("❌ 카테고리 통계 조회 실패:", categoryStatsError);
      return;
    }

    const categoryCounts: Record<string, number> = {};
    categoryStats.forEach((post) => {
      if (post.category) {
        categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
      }
    });

    const sortedCategories = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);

    console.log("📂 카테고리별 포스트 수:");
    sortedCategories.forEach(([category, count]) => {
      console.log(`  ${category}: ${count}개`);
    });
    console.log();

    // 7. 특정 포스트 상세 정보 확인
    if (posts.length > 0) {
      const testPost = posts[0];
      const { data: postDetail, error: postDetailError } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", testPost.slug)
        .single();

      if (postDetailError) {
        console.error("❌ 포스트 상세 정보 조회 실패:", postDetailError);
      } else {
        console.log("📄 테스트 포스트 상세 정보:");
        console.log(`  제목: ${postDetail.title}`);
        console.log(`  날짜: ${postDetail.date}`);
        console.log(`  카테고리: ${postDetail.category}`);
        console.log(`  태그: ${postDetail.tags?.join(", ") || "없음"}`);
        console.log(`  콘텐츠 길이: ${postDetail.content?.length || 0}자`);
        console.log();
      }
    }

    // 8. 원격 DB URL 정보
    console.log("🌐 원격 DB 정보:");
    console.log(`  URL: ${supabaseUrl}`);
    if (supabaseUrl) {
      console.log(`  프로젝트 ID: ${supabaseUrl.split("//")[1].split(".")[0]}`);
    }
    console.log();

    console.log("✅ 원격 DB 마이그레이션 테스트 완료!");
    console.log("💡 Supabase Dashboard에서 Table Editor를 통해 데이터를 확인할 수 있습니다.");
  } catch (error) {
    console.error("❌ 테스트 중 오류 발생:", error);
  }
}

// 스크립트 실행
if (require.main === module) {
  testRemoteMigration().catch(console.error);
}
