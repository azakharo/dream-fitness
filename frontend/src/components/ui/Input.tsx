import * as React from 'react';

import {cn} from '@/lib/utils';

function Input({className, type, ...props}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
          h-11 w-full min-w-0 rounded-xl border-2 border-[oklch(0.90_0.01_130)]
          bg-transparent px-4 py-3.5 text-[15px] transition-all outline-none
          file:inline-flex file:h-6 file:border-0 file:bg-transparent
          file:text-sm file:font-medium file:text-foreground
          placeholder:text-muted-foreground
          focus-visible:border-[oklch(0.68_0.22_130)] focus-visible:ring-4
          focus-visible:ring-[oklch(0.94_0.10_130)]
          disabled:pointer-events-none disabled:cursor-not-allowed
          disabled:bg-input/50 disabled:opacity-50
          aria-invalid:border-destructive aria-invalid:ring-3
          aria-invalid:ring-destructive/20
          dark:border-[oklch(0.30_0.02_130)] dark:bg-input/30
          dark:focus-visible:border-[oklch(0.75_0.22_130)]
          dark:focus-visible:ring-[oklch(0.30_0.08_130)]
          dark:disabled:bg-input/80
          dark:aria-invalid:border-destructive/50
          dark:aria-invalid:ring-destructive/40
        `,
        className,
      )}
      {...props}
    />
  );
}

export {Input};
