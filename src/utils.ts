/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Design Constants
export const COLORS = {
  primary: '#1877F2', // Facebook Blue
  secondary: '#1C2B46', // Deep Dark Blue/Gray
  background: '#F0F2F5', // Facebook Light Gray
  white: '#FFFFFF',
};
