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
      className="cursor-pointer"
      onClick={handleClick}
    >
      <Search
        className="hover:text-primary-500 dark:hover:text-primary-400 h-6 w-6 text-gray-900 dark:text-gray-100"
        aria-hidden="true"
      />
    </button>
  )
}

export default SearchButton
