import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string, currency: string) {
  try {
    const numPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    if (isNaN(numPrice)) return `${price} ${currency}`;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2
    }).format(numPrice);
  } catch (e) {
    return `${price} ${currency}`;
  }
}
