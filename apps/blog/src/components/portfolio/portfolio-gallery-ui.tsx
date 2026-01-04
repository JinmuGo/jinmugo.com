import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { useMemo, useState } from "react"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/utils/cn"

interface PortfolioGalleryHeaderProps {
  title?: string
  archiveButton?: {
    text: string
    href: string
  }
  className?: string
}

interface PortfolioGalleryContentProps {
  images?: Array<{
    src: string
    alt: string
    title?: string
    tagline?: string
    exhibitNumber?: string
    year?: number
  }>
  className?: string
  maxHeight?: number
  spacing?: string
  onImageClick?: (index: number) => void
  pauseOnHover?: boolean
  marqueeRepeat?: number
  selectedIndex?: number | null
  onHoverChange?: (index: number | null) => void
}

// Header Component - Title and Button only
export function PortfolioGalleryHeader({
  title = "Browse my library",
  archiveButton = {
    text: "View gallery",
    href: "/projects",
  },
  className = "",
}: PortfolioGalleryHeaderProps) {
  return (
    <div className={`relative z-10 text-center pt-16 pb-8 px-8 ${className}`}>
      <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8 text-balance">{title}</h2>

      <a
        href={archiveButton.href}
        className="inline-flex items-center gap-3 text-gray-900 dark:text-gray-100 px-6 py-3 rounded-full font-medium hover:bg-foreground/90 transition-colors group mb-10 cursor-pointer"
      >
        <span>{archiveButton.text}</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  )
}

// Content Component - Gallery only
export function PortfolioGalleryContent({
  images: customImages,
  className = "",
  maxHeight = 120,
  spacing = "-space-x-72 md:-space-x-80",
  onImageClick,
  pauseOnHover = true,
  marqueeRepeat = 4,
  onHoverChange,
}: PortfolioGalleryContentProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Generate unique keys for marquee repeats
  const marqueeKeys = useMemo(
    () => Array.from({ length: marqueeRepeat }, (_, i) => `marquee-${i}-${Date.now()}`),
    [marqueeRepeat],
  )

  const defaultImages = [
    {
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80",
      alt: "Project 1",
    },
    {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80",
      alt: "Project 2",
    },
    {
      src: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&h=600&fit=crop&q=80",
      alt: "Project 3",
    },
  ]

  const images = customImages || defaultImages

  return (
    <div className={className}>
      {/* Desktop 3D overlapping layout - hidden on mobile */}
      <div className="hidden md:block relative overflow-hidden h-[400px] -mb-[200px]">
        <div className={`flex ${spacing} pb-8 pt-40 items-end justify-center`}>
          {images.map((image, index) => {
            // Calculate stagger height - peak in middle, descending to edges
            const totalImages = images.length
            const middle = Math.floor(totalImages / 2)
            const distanceFromMiddle = Math.abs(index - middle)
            const staggerOffset = maxHeight - distanceFromMiddle * 20

            const zIndex = totalImages - index

            const isHovered = hoveredIndex === index
            const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index

            // When hovering: hovered card moves to consistent top position, others move to baseline
            const yOffset = isHovered ? -120 : isOtherHovered ? 0 : -staggerOffset

            // Calculate horizontal offset to create gap for info panel
            let xOffset = 0
            if (hoveredIndex !== null) {
              if (index < hoveredIndex) {
                xOffset = -200 // Move cards to the left
              } else if (index > hoveredIndex) {
                xOffset = 200 // Move cards to the right
              }
            }

            return (
              <motion.button
                key={`${image.src}-${index}`}
                type="button"
                className="group cursor-pointer flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 rounded-lg"
                style={{
                  zIndex: isHovered ? totalImages + 1 : zIndex,
                  willChange: "transform, opacity",
                }}
                aria-label={`View ${image.alt} project details`}
                tabIndex={0}
                initial={{
                  transform: `perspective(5000px) rotateY(-45deg) translateY(200px) translateX(0px)`,
                  opacity: 0,
                }}
                animate={{
                  transform: `perspective(5000px) rotateY(-45deg) translateY(${yOffset}px) translateX(${xOffset}px)`,
                  opacity: isOtherHovered ? 0.4 : 1,
                }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
                onHoverStart={() => {
                  setHoveredIndex(index)
                  onHoverChange?.(index)
                }}
                onHoverEnd={() => {
                  setHoveredIndex(null)
                  onHoverChange?.(null)
                }}
                onClick={() => onImageClick?.(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onImageClick?.(index)
                  }
                }}
              >
                <motion.div
                  layoutId={`project-image-${index}`}
                  className="relative aspect-video w-64 md:w-80 lg:w-96 rounded-lg overflow-hidden"
                >
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    className="relative w-full h-full object-cover object-left-top transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement
                      target.previousElementSibling?.classList.add("hidden")
                    }}
                  />
                </motion.div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Mobile marquee layout */}
      <div className="block md:hidden relative pb-8">
        <div
          className={cn(
            "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
            "flex-row",
          )}
        >
          {marqueeKeys.map((key, i) => (
            <div
              key={key}
              className={cn(
                "flex shrink-0 justify-around [gap:var(--gap)]",
                "animate-marquee flex-row",
                {
                  "group-hover:[animation-play-state:paused]": pauseOnHover,
                },
              )}
            >
              {images.map((image, index) => (
                <button
                  key={`${image.src}-repeat-${i}-item-${index}`}
                  type="button"
                  className="group cursor-pointer flex-shrink-0"
                  onClick={() => onImageClick?.(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onImageClick?.(index)
                    }
                  }}
                  aria-label={`View ${image.alt} project details`}
                >
                  <motion.div
                    layoutId={`project-image-${index}`}
                    className="relative aspect-video w-64 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105"
                    style={{
                      boxShadow: `
                          rgba(0, 0, 0, 0.01) 0.796192px 0px 0.796192px 0px,
                          rgba(0, 0, 0, 0.03) 2.41451px 0px 2.41451px 0px,
                          rgba(0, 0, 0, 0.08) 6.38265px 0px 6.38265px 0px,
                          rgba(0, 0, 0, 0.25) 20px 0px 20px 0px
                        `,
                    }}
                  >
                    <img
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      className="w-full h-full object-cover object-left-top"
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
