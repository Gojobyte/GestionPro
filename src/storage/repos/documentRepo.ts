// ============================================================================
// DOCUMENT REPOSITORY
// ============================================================================

import { db } from '../db';
import type { DocumentMeta } from '../../domain/types';

/**
 * Get all documents
 */
export async function getAll(): Promise<DocumentMeta[]> {
  return await db.documentMetas.toArray();
}

/**
 * Get document by ID
 */
export async function getById(id: string): Promise<DocumentMeta | undefined> {
  return await db.documentMetas.get(id);
}

/**
 * Get documents by project
 */
export async function getByProject(projectId: string): Promise<DocumentMeta[]> {
  return await db.documentMetas.where('projectId').equals(projectId).toArray();
}

/**
 * Get global documents (no project)
 */
export async function getGlobal(): Promise<DocumentMeta[]> {
  return await db.documentMetas.where('projectId').equals('').toArray();
}

/**
 * Get documents by storage mode
 */
export async function getByStorageMode(storageMode: 'EMBEDDED' | 'WORKSPACE'): Promise<DocumentMeta[]> {
  return await db.documentMetas.where('storageMode').equals(storageMode).toArray();
}

/**
 * Search documents by title or tags
 */
export async function search(query: string): Promise<DocumentMeta[]> {
  const lowerQuery = query.toLowerCase();
  const all = await db.documentMetas.toArray();
  return all.filter((doc: DocumentMeta) => {
    return (
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.fileName.toLowerCase().includes(lowerQuery) ||
      doc.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Create a new document
 */
export async function create(doc: DocumentMeta): Promise<string> {
  return await db.documentMetas.add(doc);
}

/**
 * Update a document
 */
export async function update(id: string, updates: Partial<DocumentMeta>): Promise<void> {
  await db.documentMetas.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a document
 */
export async function deleteDoc(id: string): Promise<void> {
  await db.documentMetas.delete(id);
}

/**
 * Delete all documents for a project
 */
export async function deleteByProject(projectId: string): Promise<void> {
  const projectDocs = await getByProject(projectId);
  const ids = projectDocs.map((d) => d.id);
  await db.documentMetas.bulkDelete(ids);
}

export const documentRepo = {
  getAll,
  getById,
  getByProject,
  getGlobal,
  getByStorageMode,
  search,
  create,
  update,
  delete: deleteDoc,
  deleteByProject,
};
