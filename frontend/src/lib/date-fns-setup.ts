/**
 * Global date-fns configuration.
 * Sets default locale to Russian and week to start on Monday.
 *
 * This file must be imported before any date-fns functions are used.
 * Import it at the top of main.tsx.
 */

import {setDefaultOptions} from 'date-fns';
import {ru} from 'date-fns/locale';

// Set Russian locale globally for all date-fns functions
// Set Monday as the first day of the week (weekStartsOn: 1)
setDefaultOptions({
  locale: ru,
  weekStartsOn: 1,
});
