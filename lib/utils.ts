import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UPDATED: Simple fallback for interview covers - removed random company logos
export const getRandomInterviewCover = () => {
  // Simple color-based covers for professional appearance
  const coverColors = [
    "bg-gradient-to-br from-success-100 to-success-200", // Green
    "bg-gradient-to-br from-warning-100 to-warning-200", // Yellow
    "bg-gradient-to-br from-light-600 to-light-800",     // Neutral
  ];
  
  const randomIndex = Math.floor(Math.random() * coverColors.length);
  return coverColors[randomIndex];
};

// NEW: Utility to get initials from name for avatar fallback
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// NEW: Format job level for display
export const formatJobLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    'entry': 'Entry Level',
    'junior': 'Junior',
    'mid': 'Mid Level', 
    'senior': 'Senior',
    'executive': 'Executive',
    'manager': 'Manager'
  };
  
  return levelMap[level.toLowerCase()] || level;
};