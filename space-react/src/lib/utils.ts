import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-caption',
        'text-body-s',
        'text-body-m',
        'text-body-l',
        'text-h1', 'text-h2', 'text-h3', 'text-h4', 'text-h5', 'text-h6',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
