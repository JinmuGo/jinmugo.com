interface Project {
  id: number
  title: string
  description: string
  tags: string[]
  period: string
  link?: string
  image?: string
}

interface PortfolioListProps {
  projects: Project[]
}

export function PortfolioList({ projects }: PortfolioListProps) {
  return (
    <div className="space-y-1">
      {projects.map((project) => (
        <div key={project.id} className="py-8 px-6 -mx-6 rounded-lg">
          {/* Header with Title and Period */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              {project.link ? (
                <div className="flex items-center gap-3">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    <h3>{project.title}</h3>
                    <svg
                      className="w-[18px] h-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </a>
                </div>
              ) : (
                <h3 className="text-gray-900 dark:text-gray-100">{project.title}</h3>
              )}
            </div>
            <span className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {project.period}
            </span>
          </div>

          {/* Image - supports both relative paths and external URLs */}
          {project.image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img src={project.image} alt={project.title} className="w-full h-64 object-cover" />
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
