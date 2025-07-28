import Title from "./Title"

export default function SearchInput({
  title,
  onChange,
}: {
  title?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      {title && <Title>{title}</Title>}
      <div className="relative max-w-lg">
        <label>
          <span className="sr-only">Search {title}</span>
          <input
            aria-label={`Search ${title}`}
            type="text"
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Search ${title}`}
            className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
          />
        </label>
        <svg
          className="absolute top-3 right-3 h-5 w-5 text-gray-400 dark:text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          role="img"
          aria-label="검색 아이콘"
        >
          <title>검색 아이콘</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  )
}
