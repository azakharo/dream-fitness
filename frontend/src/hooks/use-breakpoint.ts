import {useEffect, useState} from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'xs',
  );

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    const mediaQueries = [
      window.matchMedia(`(min-width: ${BREAKPOINTS['2xl']}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.md}px)`),
      window.matchMedia(`(min-width: ${BREAKPOINTS.sm}px)`),
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', handleResize);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', handleResize);
      });
    };
  }, []);

  return breakpoint;
};
