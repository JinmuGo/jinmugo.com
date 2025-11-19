import { Award, Briefcase, Code, Coffee, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"

interface AboutMetric {
  icon: LucideIcon
  label: string
  value: string
  description: string
}

interface PortfolioAboutProps {
  profileImage: string
  title?: string
  sectionSubtitle?: string
  sectionTitle?: string
  bio?: string[]
  caption?: string
  metrics?: AboutMetric[]
}

const defaultMetrics: AboutMetric[] = [
  {
    icon: Briefcase,
    label: "Experience",
    value: "5+ Years",
    description: "Professional Development",
  },
  {
    icon: Code,
    label: "Projects",
    value: "50+ Completed",
    description: "Client & Personal",
  },
  {
    icon: Award,
    label: "Technologies",
    value: "20+ Mastered",
    description: "Modern Tech Stack",
  },
  {
    icon: Coffee,
    label: "Code Quality",
    value: "99.5%",
    description: "Test Coverage",
  },
]

export function PortfolioAbout({
  profileImage,
  title = "Full Stack Developer",
  sectionSubtitle = "Biography",
  sectionTitle = "About Me",
  bio = [
    "I'm a passionate full stack developer with over 5 years of experience building web applications. I specialize in creating clean, efficient, and user-friendly solutions using modern technologies.",
    "My focus is on writing maintainable code and delivering projects that meet both business objectives and user needs. I believe in continuous learning and staying updated with industry best practices.",
    "When I'm not coding, I enjoy contributing to open source projects and sharing knowledge with the developer community.",
  ],
  caption = "Building digital experiences that matter",
  metrics = defaultMetrics,
}: PortfolioAboutProps) {
  return (
    <section id="about" className="py-24 px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-block mb-4">
            <span
              className="text-muted-foreground/60 uppercase"
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.2em",
              }}
            >
              {sectionSubtitle}
            </span>
          </div>
          <h2
            className="text-foreground"
            style={{
              fontSize: "2.5rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            {sectionTitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Column - Gallery Frame Style */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Image with Gallery Frame */}
            <div className="relative group">
              <div className="aspect-square overflow-hidden bg-secondary border-4 border-background shadow-[0_0_0_1px_rgba(0,0,0,0.1)]">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Hover Frame Effect */}
              <div
                className="absolute inset-0 border-2 border-transparent group-hover:border-foreground transition-all duration-500 pointer-events-none"
                style={{ transform: "translate(8px, 8px)" }}
              />
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Main Content */}
            <div>
              <h3
                className="text-foreground mb-6"
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
              <div
                className="space-y-4 text-muted-foreground"
                style={{ fontSize: "1.0625rem", lineHeight: "1.7" }}
              >
                {bio.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
