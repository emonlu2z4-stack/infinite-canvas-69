import { useState, useCallback, useRef, useEffect } from 'react';

export interface ElementAnimation {
  /** 0→1 progress */
  progress: Map<string, number>;
  /** Whether any animation is still running */
  isAnimating: boolean;
}

const STAGGER_DELAY = 30; // ms between each element start
const DURATION = 400; // ms per element animation

/**
 * Manages staggered entrance animations for canvas elements.
 * Call `triggerEntrance(ids)` after setting template elements.
 * The returned `animation` object is consumed by the renderer.
 */
export function useCanvasAnimation() {
  const [animation, setAnimation] = useState<ElementAnimation>({
    progress: new Map(),
    isAnimating: false,
  });

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const idsRef = useRef<string[]>([]);

  const triggerEntrance = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    idsRef.current = ids;
    startTimeRef.current = performance.now();

    // Init all to 0
    const initial = new Map<string, number>();
    ids.forEach(id => initial.set(id, 0));
    setAnimation({ progress: initial, isAnimating: true });

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = new Map<string, number>();
      let allDone = true;

      idsRef.current.forEach((id, i) => {
        const elementStart = i * STAGGER_DELAY;
        const t = Math.min(1, Math.max(0, (elapsed - elementStart) / DURATION));
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        progress.set(id, eased);
        if (t < 1) allDone = false;
      });

      setAnimation({ progress, isAnimating: !allDone });

      if (!allDone) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { animation, triggerEntrance };
}
