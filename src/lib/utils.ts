// ─── Utility Functions ───
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export function generateOrderNumber(): string {
  const seq = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0')
  return `3DP-${seq}`
}
