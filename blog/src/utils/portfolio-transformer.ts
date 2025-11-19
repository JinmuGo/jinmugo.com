import type { CollectionEntry } from "astro:content"
import type { Project } from "@/components/portfolio/PortfolioGallery"

type PortfolioData = CollectionEntry<"app">["data"]

/**
 * Portfolio.md의 sections 데이터를 PortfolioGallery가 사용할 수 있는 Project[] 형식으로 변환
 */
export function transformPortfolioProjects(data: PortfolioData): Project[] {
  if (!data.sections) {
    return []
  }

  const projects: Project[] = []

  // experiences와 projects 섹션에서 프로젝트 추출
  for (const section of data.sections) {
    if (section.type === "experiences" || section.type === "projects") {
      for (const item of section.data) {
        projects.push({
          id: item.id,
          title: item.title || item.name,
          tagline: item.tagline,
          description: item.description,
          problem: item.problem,
          role: item.role,
          responsibilities: item.responsibilities,
          image: item.image,
          category: item.category,
          tags: item.tags,
          timeline: item.timeline,
          github: item.github,
          live: item.live,
          exhibitNumber: item.exhibitNumber,
          year: item.year,
          metrics: item.metrics,
        })
      }
    }
  }

  // ID로 정렬 (최신 프로젝트가 먼저)
  return projects.sort((a, b) => a.id - b.id)
}

/**
 * Skills 섹션 데이터를 PortfolioSkills 컴포넌트가 사용할 수 있는 형식으로 변환
 * icon은 Astro에서 React로 전달할 수 없으므로 컴포넌트 내에서 처리
 */
export interface SkillCategory {
  exhibitNumber: string
  title: string
  skills: Array<{
    name: string
    level: string
  }>
}

const exhibitNumberMap: Record<string, string> = {
  Backend: "I",
  Frontend: "II",
  "DevOps & Cloud": "III",
}

export function transformSkillsData(data: PortfolioData): SkillCategory[] {
  if (!data.sections) {
    return []
  }

  const skillsSection = data.sections.find((s) => s.type === "skills")
  if (!skillsSection || skillsSection.type !== "skills") {
    return []
  }

  return skillsSection.data.map((category) => ({
    exhibitNumber: exhibitNumberMap[category.category] || "I",
    title: category.category,
    skills: category.items.map((item) => ({
      name: item.name,
      level: item.level,
    })),
  }))
}

/**
 * Hero 섹션 데이터 추출
 */
export interface HeroData {
  tagline: string
  title: string
  description: string
  social: {
    github?: string
    linkedin?: string
    email?: string
  }
}

export function transformHeroData(data: PortfolioData, pkg: any): HeroData {
  return {
    tagline: data.hero?.tagline || "DEVELOPER",
    title: data.hero?.title || "Portfolio",
    description: data.hero?.description || "",
    social: {
      github: data.contact?.github || pkg.social.github,
      linkedin: pkg.social.linkedin,
      email: data.contact?.email || pkg.email,
    },
  }
}

/**
 * About 섹션 데이터 추출
 */
export interface AboutData {
  profileImage: string
  title: string
  bio: string[]
  caption: string
}

export function transformAboutData(data: PortfolioData): AboutData {
  return {
    profileImage: data.avatar || "/avatar.webp",
    title: data.name,
    bio: data.about?.bio || [],
    caption: data.about?.caption || "",
  }
}
