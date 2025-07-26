import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// 카운트 집계
export function countBy<T>(
	items: T[],
	keyFn: (item: T) => string | string[],
): Record<string, number> {
	return items.reduce<Record<string, number>>((acc, item) => {
		const keys = ([] as string[]).concat(keyFn(item));
		keys.forEach((key) => {
			if (!acc[key]) {
				acc[key] = 0;
			}
			acc[key]++;
		});
		return acc;
	}, {});
}
