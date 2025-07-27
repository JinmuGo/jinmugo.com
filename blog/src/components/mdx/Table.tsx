import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TableProps = {
	className?: string;
	children: ReactNode;
};

export const Table: FC<TableProps> = ({ children, className }) => {
	return (
		<div className="my-6 w-full overflow-x-auto">
			<table
				className={cn(
					"w-full border-collapse rounded-xl border border-gray-200 bg-card dark:bg-[#18181b] dark:border-gray-700",
					className,
				)}
			>
				{children}
			</table>
		</div>
	);
};

export type TableHeaderProps = {
	className?: string;
	children: ReactNode;
};

export const TableHeader: FC<TableHeaderProps> = ({ children, className }) => {
	return (
		<thead className={cn("bg-gray-100 dark:bg-[#232326]", className)}>
			{children}
		</thead>
	);
};

export type TableBodyProps = {
	className?: string;
	children: ReactNode;
};

export const TableBody: FC<TableBodyProps> = ({ children, className }) => {
	return (
		<tbody
			className={cn("divide-y divide-border dark:divide-[#232326]", className)}
		>
			{children}
		</tbody>
	);
};

export type TableRowProps = {
	className?: string;
	children: ReactNode;
};

export const TableRow: FC<TableRowProps> = ({ children, className }) => {
	return (
		<tr
			className={cn(
				"transition-colors hover:bg-gray-200 dark:hover:bg-[#232326] first:text-center",
				className,
			)}
		>
			{children}
		</tr>
	);
};

export type TableCellProps = {
	className?: string;
	children: ReactNode;
};

export const TableCell: FC<TableCellProps> = ({ children, className }) => {
	return (
		<td className={cn("px-4! py-3! align-top dark:text-gray-200", className)}>
			{children}
		</td>
	);
};

export type TableHeadProps = {
	className?: string;
	children: ReactNode;
};

export const TableHead: FC<TableHeadProps> = ({ children, className }) => {
	return (
		<th
			className={cn(
				"px-4! py-3! font-semibold text-foreground dark:text-gray-100",
				className,
			)}
		>
			{children}
		</th>
	);
};
