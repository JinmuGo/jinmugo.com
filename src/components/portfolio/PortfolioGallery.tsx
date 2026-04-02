import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from "lucide-react"

const Github = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>GitHub</title>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

import { AnimatePresence, motion } from "motion/react"
import type { TouchEvent } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { typography } from "@/utils/typography"
import { KeyboardHints } from "./KeyboardHints"
import { PortfolioGalleryContent, PortfolioGalleryHeader } from "./portfolio-gallery-ui"

interface ProjectMetrics {
  users?: string
  performance?: string
  impact?: string
}

export interface Project {
  id: number
  title: string
  tagline: string
  description: string
  problem: string
  role: string
  responsibilities: string[]
  image: string
  category: string
  tags: string[]
  timeline: string
  github?: string
  live?: string
  exhibitNumber: string
  year: number
  metrics?: ProjectMetrics
}

interface PortfolioGalleryProps {
  projects: Project[]
  title?: string
  archiveButtonText?: string
  archiveButtonHref?: string
  tagline?: string
}

export function PortfolioGallery({
  projects,
  title = "Featured Works",
  archiveButtonText = "View All Projects",
  archiveButtonHref = "/projects",
  tagline = "Select a project to view more details",
}: PortfolioGalleryProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const categories = useMemo(
    () => ["All", ...new Set(projects.map((project) => project.category))],
    [projects],
  )

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") {
      return projects
    }
    return projects.filter((project) => project.category === activeCategory)
  }, [activeCategory, projects])

  const selectedFilteredIndex = selectedProject
    ? filteredProjects.findIndex((project) => project.id === selectedProject.id)
    : null

  const relatedProjects = useMemo(() => {
    if (!selectedProject) {
      return []
    }

    const currentTags = new Set(selectedProject.tags)
    return projects
      .filter((project) => project.id !== selectedProject.id)
      .map((project) => ({
        ...project,
        sharedTags: project.tags.filter((tag) => currentTags.has(tag)).length,
      }))
      .filter((project) => project.sharedTags > 0)
      .sort((a, b) => b.sharedTags - a.sharedTags)
      .slice(0, 3)
  }, [projects, selectedProject])

  const navigateProject = useCallback(
    (navDirection: "next" | "prev") => {
      if (!selectedProject || filteredProjects.length === 0) {
        return
      }

      const currentIndex = filteredProjects.findIndex(
        (project) => project.id === selectedProject.id,
      )

      if (currentIndex === -1) {
        return
      }

      const nextIndex =
        navDirection === "next"
          ? (currentIndex + 1) % filteredProjects.length
          : (currentIndex - 1 + filteredProjects.length) % filteredProjects.length

      setDirection(navDirection)
      setSelectedProject(filteredProjects[nextIndex])
    },
    [filteredProjects, selectedProject],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedProject) {
        return
      }

      switch (event.key) {
        case "Escape":
          setSelectedProject(null)
          break
        case "ArrowLeft":
          event.preventDefault()
          navigateProject("prev")
          break
        case "ArrowRight":
          event.preventDefault()
          navigateProject("next")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigateProject, selectedProject])

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStart(event.targetTouches[0].clientX)
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(event.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !selectedProject) {
      return
    }

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setDirection("next")
      navigateProject("next")
    } else if (isRightSwipe) {
      setDirection("prev")
      navigateProject("prev")
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleProjectClick = (index: number) => {
    const project = filteredProjects[index]
    if (!project) {
      return
    }

    setHoveredIndex(null)
    setSelectedProject(project)
  }

  const handleClose = () => {
    setSelectedProject(null)
    setHoveredIndex(null)
  }

  const handleRelatedProjectClick = (project: Project) => {
    if (activeCategory !== "All" && activeCategory !== project.category) {
      setActiveCategory(project.category)
    }

    setDirection("next")
    setHoveredIndex(null)
    setSelectedProject(project)
  }

  const selectedIndex = selectedFilteredIndex
  const hoverPreview = hoveredIndex !== null ? filteredProjects[hoveredIndex] : null
  const hoverPreviewKey =
    hoveredIndex !== null && hoverPreview ? `project-${hoverPreview.id}` : "default"

  return (
    <section className="relative py-20 px-4" id="projects">
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedProject && `Now viewing ${selectedProject.title}`}
      </div>

      {/* Keyboard Hints */}
      <KeyboardHints show={selectedProject !== null} />

      <div className="max-w-7xl mx-auto bg-background/50 dark:bg-background/80 backdrop-blur-sm overflow-hidden">
        <div className="relative">
          <PortfolioGalleryHeader
            title={title}
            archiveButton={{
              text: archiveButtonText,
              href: archiveButtonHref,
            }}
          />
        </div>

        <fieldset>
          <legend className="sr-only">Filter projects by category</legend>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="px-8 pb-8 flex justify-center gap-2 flex-wrap"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                type="button"
                onClick={() => {
                  setActiveCategory(category)
                  setSelectedProject(null)
                }}
                aria-pressed={activeCategory === category}
                aria-label={`Filter by ${category} category`}
                className={`${typography.bodySmall} cursor-pointer font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-foreground text-background shadow-lg shadow-foreground/20"
                    : "bg-gray-100/80 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-200/90 dark:hover:bg-gray-700/80 backdrop-blur-sm"
                }`}
              >
                {category}
                {category !== "All" && (
                  <span className="ml-2 opacity-60">
                    ({projects.filter((p) => p.category === category).length})
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        </fieldset>

        <AnimatePresence mode="wait">
          {!selectedProject && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="overflow-hidden"
            >
              <div className="px-8 pb-8">
                <div className="max-w-3xl mx-auto text-center py-8 border-y border-gray-200 dark:border-gray-700">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={hoverPreviewKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.h3
                        className={`${typography.titleLarge} text-gray-900 dark:text-gray-100 mb-3`}
                      >
                        {hoverPreview?.title ?? tagline}
                      </motion.h3>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {selectedProject && selectedIndex !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              }}
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Mobile swipe hint */}
              <div className="md:hidden text-center py-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-2">
                  <ChevronLeft size={16} />
                  Swipe to navigate
                  <ChevronRight size={16} />
                </span>
              </div>

              <div className="px-4 md:px-8 pb-16">
                <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => navigateProject("prev")}
                        className="p-3 min-h-[44px] min-w-[44px] bg-foreground/90 hover:bg-foreground text-background transition-all shadow-lg hover:shadow-xl backdrop-blur-sm"
                        aria-label="Previous project"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateProject("next")}
                        className="p-3 min-h-[44px] min-w-[44px] bg-foreground/90 hover:bg-foreground text-background transition-all shadow-lg hover:shadow-xl backdrop-blur-sm"
                        aria-label="Next project"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-3 min-h-[44px] min-w-[44px] bg-foreground/90 hover:bg-foreground text-background transition-all shadow-lg hover:shadow-xl backdrop-blur-sm"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={selectedProject.id}
                      custom={direction}
                      initial={{
                        x: direction === "next" ? 100 : -100,
                        opacity: 0,
                      }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{
                        x: direction === "next" ? -100 : 100,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
                    >
                      <div className="order-2 lg:order-1">
                        <motion.div
                          layoutId={`project-image-${selectedIndex}`}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-2xl"
                        >
                          {/* Loading skeleton */}
                          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />

                          <img
                            src={selectedProject.image}
                            alt={selectedProject.title}
                            className="relative w-full h-full object-cover"
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement
                              target.previousElementSibling?.classList.add("hidden")
                            }}
                          />
                        </motion.div>
                      </div>
                      <div className="order-1 lg:order-2 space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`${typography.labelMedium} text-gray-500 dark:text-gray-400`}
                            >
                              PROJECT #{selectedProject.exhibitNumber}
                            </span>
                            <span
                              className={`${typography.caption} text-gray-400 dark:text-gray-500`}
                            >
                              {selectedProject.year}
                            </span>
                          </div>
                          <h2
                            className={`${typography.titleLarge} text-gray-900 dark:text-gray-100 mb-3`}
                          >
                            {selectedProject.title}
                          </h2>
                          <p
                            className={`${typography.bodyMedium} text-gray-600 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-4`}
                          >
                            {selectedProject.tagline}
                          </p>
                        </div>
                        {selectedProject.metrics && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          >
                            {selectedProject.metrics.users && (
                              <div className="text-center">
                                <Users className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Users
                                </p>
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                  {selectedProject.metrics.users}
                                </p>
                              </div>
                            )}
                            {selectedProject.metrics.performance && (
                              <div className="text-center">
                                <Zap className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Performance
                                </p>
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                  {selectedProject.metrics.performance}
                                </p>
                              </div>
                            )}
                            {selectedProject.metrics.impact && (
                              <div className="text-center">
                                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Impact
                                </p>
                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                  {selectedProject.metrics.impact}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                        <div
                          className={`${typography.bodySmall} flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-700`}
                        >
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{selectedProject.role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{selectedProject.timeline}</span>
                          </div>
                        </div>
                        <div>
                          <h3
                            className={`${typography.labelMedium} text-gray-900 dark:text-gray-100 mb-2`}
                          >
                            The Challenge
                          </h3>
                          <p
                            className={`${typography.bodyMedium} text-gray-600 dark:text-gray-400`}
                          >
                            {selectedProject.problem}
                          </p>
                        </div>
                        <div>
                          <h3
                            className={`${typography.labelMedium} text-gray-900 dark:text-gray-100 mb-2`}
                          >
                            The Solution
                          </h3>
                          <p
                            className={`${typography.bodyMedium} text-gray-600 dark:text-gray-400`}
                          >
                            {selectedProject.description}
                          </p>
                        </div>
                        <div>
                          <h3
                            className="text-gray-900 dark:text-gray-100 uppercase mb-2"
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              letterSpacing: "0.15em",
                            }}
                          >
                            Technologies
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.tags.map((tag, index) => (
                              <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className="text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-3 py-1.5 backdrop-blur-sm"
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  letterSpacing: "0.01em",
                                }}
                              >
                                {tag}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3
                            className="text-gray-900 dark:text-gray-100 uppercase mb-2"
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              letterSpacing: "0.15em",
                            }}
                          >
                            My Contributions
                          </h3>
                          <ul className="space-y-2">
                            {selectedProject.responsibilities
                              .slice(0, 3)
                              .map((responsibility, index) => (
                                <motion.li
                                  key={responsibility}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 + index * 0.1 }}
                                  className="flex items-start gap-2"
                                >
                                  <span className="mt-2 w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full flex-shrink-0" />
                                  <span
                                    className="text-gray-600 dark:text-gray-400 leading-relaxed"
                                    style={{
                                      fontSize: "0.875rem",
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    {responsibility}
                                  </span>
                                </motion.li>
                              ))}
                          </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                          {selectedProject.live && (
                            <a
                              href={selectedProject.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 hover:shadow-lg cursor-pointer"
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                letterSpacing: "0.02em",
                              }}
                            >
                              <ExternalLink size={14} />
                              View Live Project
                            </a>
                          )}
                          {selectedProject.github && (
                            <a
                              href={selectedProject.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-all duration-300 cursor-pointer"
                              style={{
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                letterSpacing: "0.02em",
                              }}
                            >
                              <Github size={14} />
                              Source Code
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    {relatedProjects.length > 0 && (
                      <motion.div
                        key={`related-${selectedProject.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
                      >
                        <h3
                          className="text-gray-900 dark:text-gray-100 uppercase mb-6"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            letterSpacing: "0.15em",
                          }}
                        >
                          Related Projects
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {relatedProjects.map((project, index) => (
                            <motion.button
                              key={project.id}
                              type="button"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              onClick={() => handleRelatedProjectClick(project)}
                              className="group text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                            >
                              <div className="aspect-video rounded overflow-hidden mb-3">
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <h4
                                className="font-semibold text-gray-900 dark:text-gray-100 mb-1"
                                style={{ fontSize: "0.875rem" }}
                              >
                                {project.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                {project.category}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {project.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PortfolioGalleryContent
          images={filteredProjects.map((project) => ({
            src: project.image,
            alt: project.title,
            title: project.title,
            tagline: project.tagline,
            exhibitNumber: project.exhibitNumber,
            year: project.year,
          }))}
          onImageClick={handleProjectClick}
          onHoverChange={setHoveredIndex}
          selectedIndex={selectedFilteredIndex}
        />
      </div>
    </section>
  )
}
