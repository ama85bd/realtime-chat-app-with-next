import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function classNameHandler(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
