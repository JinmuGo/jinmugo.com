import type { EditorialListItem } from "./EditorialList"

interface Props {
  item: EditorialListItem
  isOpen: boolean
  onToggle: () => void
}

const Stars = ({ rating }: { rating?: number }) => {
  if (!rating) {
    return null
  }
  return (
    <span role="img" aria-label={`${rating} stars`} className="text-[#D97706]">
      {"★".repeat(rating)}
    </span>
  )
}

const Cover = ({ cover, aspect, alt }: { cover?: string; aspect: "2/3" | "1/1"; alt: string }) => {
  const sizeClass = aspect === "1/1" ? "w-20 aspect-square" : "w-14 aspect-[2/3]"
  if (cover) {
    return (
      <img
        src={cover}
        alt={alt}
        className={`${sizeClass} rounded-sm object-cover shrink-0 bg-stone-200 dark:bg-stone-700`}
        loading="lazy"
      />
    )
  }
  return (
    <div
      className={`${sizeClass} rounded-sm shrink-0 bg-stone-300 dark:bg-stone-700`}
      aria-hidden="true"
    />
  )
}

const ExpandPanel = ({ item }: { item: EditorialListItem }) => (
  <div className="mt-4 pt-4 border-t border-dashed border-stone-300 dark:border-stone-600 grid grid-cols-2 gap-3 text-sm text-stone-700 dark:text-stone-300">
    {item.expandFields.map((f) => (
      <div key={f.label}>
        <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">
          {f.label}
        </div>
        <div className="text-stone-700 dark:text-stone-200">{f.value}</div>
      </div>
    ))}
    {item.quote && (
      <blockquote className="col-span-2 border-l-2 border-[#D97706] pl-3 italic text-stone-600 dark:text-stone-300 leading-relaxed">
        {item.quote}
      </blockquote>
    )}
    {item.tags.length > 0 && (
      <div className="col-span-2 flex gap-2 flex-wrap">
        {item.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-0.5 text-[11px] text-stone-600 dark:text-stone-300"
          >
            {t}
          </span>
        ))}
      </div>
    )}
  </div>
)

const RowContent = ({ item }: { item: EditorialListItem }) => (
  <>
    <div className="font-mono tabular-nums text-xs text-stone-400 pt-0.5 w-7 shrink-0">
      {item.num}
    </div>
    <Cover cover={item.cover} aspect={item.coverAspectRatio} alt={item.title} />
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-[15px] -tracking-tight">{item.title}</h4>
      <div className="text-[13px] text-stone-500 mb-1.5">{item.subtitle}</div>
      {item.oneLiner && (
        <div className="text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed max-w-[48ch]">
          {item.oneLiner}
        </div>
      )}
    </div>
    <div className="text-right text-xs text-stone-500 pt-0.5 min-w-[80px]">
      <Stars rating={item.rating} />
      <div>{item.rightMeta}</div>
      {item.hasEssay && (
        <span role="img" aria-label="has essay" className="block text-[#D97706] mt-1 text-[11px]">
          ✎
        </span>
      )}
    </div>
  </>
)

export default function EditorialRow({ item, isOpen, onToggle }: Props) {
  const baseClass =
    "flex gap-4 py-4 transition-colors data-[open=true]:bg-stone-100 dark:data-[open=true]:bg-stone-800"

  if (item.hasEssay) {
    return (
      <li>
        <a href={item.href} className={`${baseClass} hover:bg-stone-100 dark:hover:bg-stone-800`}>
          <RowContent item={item} />
        </a>
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        data-open={isOpen}
        aria-expanded={isOpen}
        className={`${baseClass} w-full text-left cursor-pointer`}
      >
        <RowContent item={item} />
      </button>
      {isOpen && (
        <div className="px-7 pb-4">
          <ExpandPanel item={item} />
        </div>
      )}
    </li>
  )
}
