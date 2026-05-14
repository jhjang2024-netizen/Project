import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(date))
}

export function formatTime(hour: number, minute: number) {
  const ampm = hour < 12 ? '오전' : '오후'
  const h = hour % 12 || 12
  const m = String(minute).padStart(2, '0')
  return `${ampm} ${h}:${m}`
}

export function generateInviteCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
