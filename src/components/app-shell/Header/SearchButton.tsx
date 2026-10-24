import { Search } from "lucide-react"
import { type Dispatch, type SetStateAction, useCallback } from "react"

interface SearchButtonProps {
  setOpen: Dispatch<SetStateAction<boolean>>
}

const SearchButton = ({ setOpen }: SearchButtonProps) => {
  const handleClick = useCallback(() => {
    setOpen(true)
  }, [setOpen])

  return (
    <button
      type="button"
      aria-label="Search Button"
      className="cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
      onClick={handleClick}
    >
      <Search
        className="hover:text-primary-500 dark:hover:text-primary-400 h-5 w-5 text-gray-600 dark:text-gray-400"
        aria-hidden="true"
      />
    </button>
  )
}

export default SearchButton
