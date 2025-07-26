import { type Dispatch, type SetStateAction, useCallback } from "react";

interface SearchButtonProps {
	setOpen: Dispatch<SetStateAction<boolean>>;
}

const SearchButton = ({ setOpen }: SearchButtonProps) => {
	const handleClick = useCallback(() => {
		setOpen(true);
	}, [setOpen]);

	return (
		<button
			type="button"
			aria-label="Search Button"
			className="cursor-pointer"
			onClick={handleClick}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className=" hover:text-primary-500 dark:hover:text-primary-400 h-6 w-6 text-gray-900 dark:text-gray-100"
				aria-label="Search icon"
			>
				<title>Search</title>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
				/>
			</svg>
		</button>
	);
};

export default SearchButton;
