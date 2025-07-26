import { useEffect } from "react";
import type { DependencyList } from "react";

export const useAsyncEffect = (asyncEffect: () => Promise<void>, deps: DependencyList) => {
  useEffect(() => {
    void asyncEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
