import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface PanelTransitionContextType {
  isTransitioning: boolean;
  triggerTransition: () => void;
}

const PanelTransitionContext = createContext<PanelTransitionContextType>({
  isTransitioning: false,
  triggerTransition: () => {},
});

export function PanelTransitionProvider({
  children,
}: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerTransition = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsTransitioning(true);
    timerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 5000);
  }, []);

  return (
    <PanelTransitionContext.Provider
      value={{ isTransitioning, triggerTransition }}
    >
      {children}
    </PanelTransitionContext.Provider>
  );
}

export function usePanelTransition() {
  return useContext(PanelTransitionContext);
}
