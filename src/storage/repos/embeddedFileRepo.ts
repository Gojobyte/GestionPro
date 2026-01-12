// ============================================================================
// EMBEDDED FILE REPOSITORY
// ============================================================================

import { db } from '../db';
import type { EmbeddedFile } from '../../domain/types';

/**
 * Get all embedded files
 */
export async function getAll(): Promise<EmbeddedFile[]> {
  return await db.embeddedFiles.toArray();
}

/**
 * Get embedded file by key
 */
export async function getByKey(key: string): Promise<EmbeddedFile | undefined> {
  return await db.embeddedFiles.get(key);
}

/**
 * Store an embedded file
 */
export async function store(file: EmbeddedFile): Promise<string> {
  return await db.embeddedFiles.add(file);
}

/**
 * Delete an embedded file
 */
export async function deleteByKey(key: string): Promise<void> {
  await db.embeddedFiles.delete(key);
}

/**
 * Get total size of all embedded files
 */
export async function getTotalSize(): Promise<number> {
  const all = await getAll();
  return all.reduce((sum, file) => sum + file.sizeBytes, 0);
}

/**
 * Check if there's enough space for a new file
 */
export async function hasSpace(fileSizeBytes: number, limitMb: number): Promise<boolean> {
  const totalSize = await getTotalSize();
  const limitBytes = limitMb * 1024 * 1024;
  return totalSize + fileSizeBytes <= limitBytes;
}

export const embeddedFileRepo = {
  getAll,
  getByKey,
  store,
  delete: deleteByKey,
  getTotalSize,
  hasSpace,
};
