import {useBreakpoint, BREAKPOINTS, type Breakpoint} from './use-breakpoint';

export const useIsLowerThan = (breakpoint: Breakpoint): boolean => {
  const current = useBreakpoint();
  return BREAKPOINTS[current] < BREAKPOINTS[breakpoint];
};
