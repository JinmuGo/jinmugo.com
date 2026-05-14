interface FilterOption<T extends string | number | null> {
  label: string
  value: T
}

interface Props<T extends string | number | null> {
  options: FilterOption<T>[]
  active: T
  onChange: (value: T) => void
  ariaLabel: string
}

export default function FilterChips<T extends string | number | null>({
  options,
  active,
  onChange,
  ariaLabel,
}: Props<T>) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="sr-only">{ariaLabel}</legend>
      {options.map((opt) => {
        const isActive = opt.value === active
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            className={
              isActive
                ? "rounded-full px-3 py-1 text-xs font-medium bg-[#D97706] text-white"
                : "rounded-full px-3 py-1 text-xs font-medium bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-stone-400"
            }
          >
            {opt.label}
          </button>
        )
      })}
    </fieldset>
  )
}
