export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

export enum TimerMode {
  GROWTH = 'GROWTH', // Counts Up (Wedge grows)
  COUNTDOWN = 'COUNTDOWN' // Counts Down (Wedge shrinks)
}

export interface ThemeColor {
  name: string;
  primary: string; // The wedge color
  secondary: string; // The progress text color
  bg: string; // Background tint
  border: string; // Border color
}

export const THEMES: Record<string, ThemeColor> = {
  red: { name: 'Focus Red', primary: '#ef4444', secondary: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  blue: { name: 'Calm Blue', primary: '#3b82f6', secondary: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  green: { name: 'Nature Green', primary: '#22c55e', secondary: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  purple: { name: 'Royal Purple', primary: '#a855f7', secondary: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  orange: { name: 'Energetic Orange', primary: '#f97316', secondary: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
};

export interface Achievement {
  duration: number; // in seconds
  message: string;
  badge: string;
  timestamp: number;
}