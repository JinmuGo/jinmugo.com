import type { DependencyList } from "react";
import { useEffect } from "react";

export const useAsyncEffect = (
	asyncEffect: () => Promise<void>,
	deps: DependencyList,
) => {
	useEffect(() => {
		void asyncEffect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
		// biome-ignore lint/correctness/useExhaustiveDependencies: deps는 동적으로 전달되는 의존성 배열
	}, deps);
};
