import { errorCache } from '@/data/errorCache.json';

interface ErrorEntry {
  hash: string;
  timestamp: number;
  count: number;
}

interface CacheData {
  errors: ErrorEntry[];
  lastCleanup: number | null;
  version: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_ENTRIES = 100;

let cacheData: CacheData = { ...errorCache };

export const isDuplicateError = (errorHash: string): boolean => {
  const now = Date.now();
  const error = cacheData.errors.find(e => e.hash === errorHash);

  if (!error) {
    return false;
  }

  // Check if error has expired
  if (now - error.timestamp > CACHE_TTL) {
    // Remove expired error
    cacheData.errors = cacheData.errors.filter(e => e.hash !== errorHash);
    saveCache();
    return false;
  }

  return true;
};

export const updateErrorCache = (errorHash: string): void => {
  const now = Date.now();
  const existingError = cacheData.errors.find(e => e.hash === errorHash);

  if (existingError) {
    existingError.count++;
    existingError.timestamp = now;
  } else {
    cacheData.errors.push({
      hash: errorHash,
      timestamp: now,
      count: 1
    });
  }

  // Cleanup old entries if cache is getting too large
  if (cacheData.errors.length > MAX_CACHE_ENTRIES) {
    cleanupCache();
  }

  saveCache();
};

export const generateErrorHash = (error: Error, context: string): string => {
  const hashString = `${error.message}|${context}|${error.stack || ''}`;
  return btoa(hashString).slice(0, 8);
};

export const cleanupCache = (): void => {
  const now = Date.now();
  cacheData.errors = cacheData.errors.filter(error => {
    return (now - error.timestamp) <= CACHE_TTL;
  });
  cacheData.lastCleanup = now;
  saveCache();
};

export const getCacheStats = () => {
  return {
    totalErrors: cacheData.errors.length,
    lastCleanup: cacheData.lastCleanup,
    version: cacheData.version
  };
};

const saveCache = (): void => {
  try {
    // In a real application, you would save this to a file or database
    // For now, we'll just keep it in memory
    if (typeof window === 'undefined') {
      // Server-side: save to file
      const fs = require('fs');
      const path = require('path');
      const cachePath = path.join(process.cwd(), 'src/data/errorCache.json');
      fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    }
  } catch (error) {
    console.error('Failed to save error cache:', error);
  }
};