/**
 * Cache and Stale Time Constants
 * Centralized configuration for TanStack Query cache timing
 */

// Base time units (in milliseconds)
const MINUTE = 1000 * 60;

// Cache/Stale time configurations
export const CACHE_TIME = {
  // Short-lived data (changes frequently)
  SHORT: 2 * MINUTE, // 2 minutes - for students, attendance, etc.
  
  // Medium-lived data (moderate changes)
  MEDIUM: 5 * MINUTE, // 5 minutes - for classrooms, units, threads
  
  // Long-lived data (rarely changes)
  LONG: 10 * MINUTE, // 10 minutes - for user profiles, departments
  
  // Very long-lived data (almost never changes)
  VERY_LONG: 30 * MINUTE, // 30 minutes - for settings, configs
} as const;

// Garbage collection time (how long to keep unused data in cache)
export const GC_TIME = {
  SHORT: 5 * MINUTE,
  MEDIUM: 10 * MINUTE,
  LONG: 15 * MINUTE,
} as const;
