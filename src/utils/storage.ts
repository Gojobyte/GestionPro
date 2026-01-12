// ============================================================================
// STORAGE UTILITIES - Persistent Storage Management
// ============================================================================

/**
 * Check if persistent storage is available
 */
export function isPersistentStorageAvailable(): boolean {
  return 'storage' in navigator && 'persist' in navigator.storage;
}

/**
 * Check if persistent storage is already granted
 */
export async function isPersistentStorageGranted(): Promise<boolean> {
  if (!isPersistentStorageAvailable()) {
    return false;
  }

  return await navigator.storage.persisted();
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!isPersistentStorageAvailable()) {
    throw new Error('Persistent storage is not supported in this browser');
  }

  const persisted = await navigator.storage.persist();
  return persisted;
}

/**
 * Get storage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  usagePercent: number;
  usageMB: number;
  quotaMB: number;
} | null> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return null;
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;

  return {
    usage,
    quota,
    usagePercent: quota > 0 ? Math.round((usage / quota) * 100) : 0,
    usageMB: Math.round(usage / (1024 * 1024)),
    quotaMB: Math.round(quota / (1024 * 1024)),
  };
}
