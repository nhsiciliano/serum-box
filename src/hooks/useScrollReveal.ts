import { useEffect, useRef } from 'react';

type UseScrollRevealOptions = {
  selector?: string;
  threshold?: number;
  rootMargin?: string;
  delayStepMs?: number;
};

export function useScrollReveal({
  selector = '[data-reveal]',
  threshold = 0.18,
  rootMargin = '0px 0px -10% 0px',
  delayStepMs = 110,
}: UseScrollRevealOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) {
      return;
    }

    elements.forEach((element, index) => {
      if (!element.style.getPropertyValue('--reveal-delay')) {
        element.style.setProperty('--reveal-delay', `${index * delayStepMs}ms`);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [delayStepMs, rootMargin, selector, threshold]);

  return containerRef;
}
