import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Same API as shadcn's cn() utility.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
