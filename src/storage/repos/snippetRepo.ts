// ============================================================================
// SNIPPET REPOSITORY
// ============================================================================

import { db } from '../db';
import type { Snippet } from '../../domain/types';

/**
 * Get all snippets
 */
export async function getAll(): Promise<Snippet[]> {
  return await db.snippets.toArray();
}

/**
 * Get snippet by ID
 */
export async function getById(id: string): Promise<Snippet | undefined> {
  return await db.snippets.get(id);
}

/**
 * Get snippets by project
 */
export async function getByProject(projectId: string): Promise<Snippet[]> {
  return await db.snippets.where('projectId').equals(projectId).toArray();
}

/**
 * Get global snippets (no project)
 */
export async function getGlobal(): Promise<Snippet[]> {
  return await db.snippets.where('projectId').equals('').toArray();
}

/**
 * Get snippets by language
 */
export async function getByLanguage(language: string): Promise<Snippet[]> {
  const all = await db.snippets.toArray();
  return all.filter((s) => s.language === language);
}

/**
 * Search snippets by title, code or tags
 */
export async function search(query: string): Promise<Snippet[]> {
  const lowerQuery = query.toLowerCase();
  const all = await db.snippets.toArray();
  return all.filter((snippet: Snippet) => {
    return (
      snippet.title.toLowerCase().includes(lowerQuery) ||
      snippet.code.toLowerCase().includes(lowerQuery) ||
      snippet.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)) ||
      snippet.language.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Create a new snippet
 */
export async function create(snippet: Snippet): Promise<string> {
  return await db.snippets.add(snippet);
}

/**
 * Update a snippet
 */
export async function update(id: string, updates: Partial<Snippet>): Promise<void> {
  await db.snippets.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a snippet
 */
export async function deleteSnippet(id: string): Promise<void> {
  await db.snippets.delete(id);
}

/**
 * Delete all snippets for a project
 */
export async function deleteByProject(projectId: string): Promise<void> {
  const projectSnippets = await getByProject(projectId);
  const ids = projectSnippets.map((s) => s.id);
  await db.snippets.bulkDelete(ids);
}

export const snippetRepo = {
  getAll,
  getById,
  getByProject,
  getGlobal,
  getByLanguage,
  search,
  create,
  update,
  delete: deleteSnippet,
  deleteByProject,
};
