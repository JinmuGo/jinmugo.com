/**
 * banner 경로에 따라 적절한 이미지 소스를 가져오는 함수
 * @param banner - banner 파일명 또는 경로
 * @param slug - post의 slug
 * @returns 이미지 메타데이터 또는 null
 */
export async function getBannerImage(
  banner: string | undefined,
  slug: string
): Promise<any | null> {
  if (!banner) {
    return null;
  }

  try {
    if (banner.startsWith('banner/')) {
      const bannerName = banner.replace('banner/', '');
      const imageModule = await import(/* @vite-ignore */ `../content/banner/${bannerName}`);
      return imageModule.default;
    } else {
      
      const imageModule = await import(/* @vite-ignore */ `../content/post/${slug}/${banner}`);
      return imageModule.default;
    }
  } catch (error) {
    console.warn(`Failed to load banner image: ${banner}`, error);
    return null;
  }
} 