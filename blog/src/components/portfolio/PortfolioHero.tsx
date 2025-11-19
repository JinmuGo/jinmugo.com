import { ArrowDown, Github, Linkedin, Mail } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { spacing } from "@/utils/spacing"
import { typography } from "@/utils/typography"

interface PortfolioHeroProps {
  tagline?: string
  title?: string
  description?: string
  social?: {
    github?: string
    linkedin?: string
    email?: string
  }
}

export function PortfolioHero({
  tagline = "FULL STACK DEVELOPER",
  title = "Building digital experiences that matter",
  description,
  social = {},
}: PortfolioHeroProps) {
  const scrollToProjects = () => {
    const element = document.querySelector("#projects")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-background">
      <div className={`${spacing.containerNarrow} text-center ${spacing.section}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <span
              className={`${typography.labelSmall} text-gray-600 dark:text-gray-300 font-semibold`}
            >
              {tagline}
            </span>
          </div>

          <h1 className={`${typography.displayLarge} text-foreground mb-6`}>
            {title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>

          {description && (
            <p
              className={`${typography.bodyLarge} text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto`}
            >
              {description}
            </p>
          )}

          {(social.github || social.linkedin || social.email) && (
            <div className="flex items-center justify-center gap-6 mb-16">
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-foreground dark:hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                >
                  <Github size={24} strokeWidth={1.5} />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-foreground dark:hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} strokeWidth={1.5} />
                </a>
              )}
              {social.email && (
                <a
                  href={`mailto:${social.email}`}
                  className="text-gray-600 dark:text-gray-300 hover:text-foreground dark:hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label="Email"
                >
                  <Mail size={24} strokeWidth={1.5} />
                </a>
              )}
            </div>
          )}

          <Button
            onClick={scrollToProjects}
            size="lg"
            className={`${typography.bodyMedium} cursor-pointer font-semibold bg-foreground hover:bg-foreground/90 text-background transform hover:-translate-y-0.5 transition-all gap-2`}
          >
            View Projects
            <ArrowDown size={16} className="animate-bounce" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
