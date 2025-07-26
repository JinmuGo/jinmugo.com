import type { Theme } from "astro-themes";
import type React from "react";
import { useCallback, useEffect } from "react";
import { toggleTheme, updateTheme } from "@/scripts/theme.js";

const Sun = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		className="light group-hover:text-gray-100 h-6 w-6"
		role="img"
		aria-label="해 아이콘"
	>
		<title>해 아이콘</title>
		<path
			fillRule="evenodd"
			d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
			clipRule="evenodd"
		/>
	</svg>
);

const Moon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		className="dark group-hover:text-gray-100 h-6 w-6"
		role="img"
		aria-label="달 아이콘"
	>
		<title>달 아이콘</title>
		<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
	</svg>
);

const ThemeSwitch: React.FC = () => {
	const getButtonLabel = useCallback((preference: Theme | null): string => {
		switch (preference) {
			case null:
				return "automatic/system";
			case "dark":
			case "light":
				return preference;
			default:
				preference satisfies never; // Ensure exhaustive check
				throw new Error(`Unexpected theme preference: ${preference}`);
		}
	}, []);

	// If the system color scheme changes (while this page is loaded), switch
	// back to the system color scheme (i.e. unset the current theme preference
	// and remove it from local storage).
	useEffect(() => {
		window
			.matchMedia("(prefers-color-scheme: dark)")
			.addEventListener("change", () => {
				updateTheme("system");
			});
	}, []);

	// react to user selecting different theme option
	useEffect(() => {
		const element = document.getElementById("theme-switcher");
		if (element == null || !(element instanceof HTMLButtonElement)) {
			throw new Error("Theme switcher button not found");
		}
		const button: HTMLButtonElement = element;
		button.addEventListener("click", toggleTheme);
		document.addEventListener("set-theme", ({ detail }) => {
			button.setAttribute("aria-label", getButtonLabel(detail));
		});
	}, [getButtonLabel]);

	return (
		<div className="hover:text-primary-500 dark:hover:text-primary-400 flex items-center justify-center">
			<button
				id="theme-switcher"
				data-testid="theme-switcher"
				title="Toggles light/dark theme"
				aria-label="automatic/system"
				aria-live="polite"
				type="button"
			>
				<Sun aria-labelledby="theme-switcher" />
				<Moon aria-labelledby="theme-switcher" />
			</button>
		</div>
	);
};

export default ThemeSwitch;
