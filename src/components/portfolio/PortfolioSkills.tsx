import { Cloud, Code2, type LucideIcon, Server } from "lucide-react"
import { motion } from "motion/react"
import { spacing } from "@/utils/spacing"
import { typography } from "@/utils/typography"

interface Skill {
  name: string
  level: string
}

interface SkillCategory {
  title: string
  icon?: LucideIcon // optional: 컴포넌트 내에서 매핑
  skills: Skill[]
}

interface PortfolioSkillsProps {
  skills?: SkillCategory[]
  categories?: SkillCategory[] // 하위 호환성 유지
  sectionTitle?: string
  sectionSubtitle?: string
  sectionDescription?: string
}

const defaultCategories: SkillCategory[] = [
  {
    title: "Frontend",
    icon: Code2,
    skills: [
      { name: "React", level: "Expert" },
      { name: "Next.js", level: "Expert" },
      { name: "TypeScript", level: "Expert" },
      { name: "Tailwind CSS", level: "Expert" },
    ],
  },
  {
    title: "Backend",
    icon: Server,
    skills: [
      { name: "Node.js", level: "Expert" },
      { name: "Express", level: "Expert" },
      { name: "Python", level: "Advanced" },
      { name: "PostgreSQL", level: "Advanced" },
    ],
  },
  {
    title: "Tools & Cloud",
    icon: Cloud,
    skills: [
      { name: "Git", level: "Expert" },
      { name: "Docker", level: "Advanced" },
      { name: "AWS", level: "Advanced" },
      { name: "CI/CD", level: "Advanced" },
    ],
  },
]

export function PortfolioSkills({
  skills,
  categories,
  sectionTitle = "Skills & Technologies",
  sectionDescription,
}: PortfolioSkillsProps) {
  // skills prop을 우선 사용, 없으면 categories, 둘 다 없으면 기본값
  const skillCategories = skills || categories || defaultCategories

  // icon 매핑 추가
  const iconMap: Record<string, LucideIcon> = {
    Backend: Server,
    Frontend: Code2,
    "DevOps & Cloud": Cloud,
  }

  // icon이 없는 경우 매핑
  const categoriesWithIcons = skillCategories.map((cat) => ({
    ...cat,
    icon: cat.icon || iconMap[cat.title] || Code2,
  }))
  // Skill level to percentage mapping
  const levelToPercent: Record<string, number> = {
    Expert: 95,
    Advanced: 75,
    Intermediate: 50,
  }

  return (
    <section id="skills" className={`${spacing.section} bg-background`}>
      <div className={spacing.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <h2 className={`${typography.headingLarge} text-foreground mb-4`}>{sectionTitle}</h2>
          {sectionDescription && (
            <p
              className={`${typography.bodyLarge} text-gray-600 dark:text-gray-300 max-w-2xl mx-auto`}
            >
              {sectionDescription}
            </p>
          )}
        </motion.div>

        {/* Skill Cards Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categoriesWithIcons.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                }}
                className="group relative bg-background border border-border hover:border-foreground/50 transition-all duration-500 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className={`${typography.titleMedium} text-foreground`}>{category.title}</h3>
                  <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-foreground transition-colors duration-300" />
                </div>

                {/* Skills Grid */}
                <div className="p-6">
                  <div className="space-y-4">
                    {category.skills.map((skill, skillIndex) => {
                      const percentage = levelToPercent[skill.level] || 50
                      return (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: index * 0.15 + skillIndex * 0.03,
                            duration: 0.3,
                          }}
                          className="group/skill"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`${typography.bodySmall} font-medium text-gray-700 dark:text-gray-300 group-hover/skill:text-foreground transition-colors`}
                            >
                              {skill.name}
                            </span>
                            <span
                              className={`${typography.caption} text-gray-500 dark:text-gray-400`}
                            >
                              {skill.level}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${percentage}%` }}
                              viewport={{ once: true }}
                              transition={{
                                delay: index * 0.15 + skillIndex * 0.03 + 0.2,
                                duration: 0.8,
                                ease: "easeOut",
                              }}
                              className="h-full bg-gradient-to-r from-foreground to-foreground/80 group-hover/skill:from-foreground group-hover/skill:to-foreground transition-all duration-300"
                            />
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-foreground transition-all duration-500 pointer-events-none" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
