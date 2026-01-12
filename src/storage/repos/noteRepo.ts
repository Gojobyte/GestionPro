// ============================================================================
// NOTE REPOSITORY
// ============================================================================

import { db } from '../db';
import type { Note } from '../../domain/types';

/**
 * Get all notes
 */
export async function getAll(): Promise<Note[]> {
  return await db.notes.toArray();
}

/**
 * Get note by ID
 */
export async function getById(id: string): Promise<Note | undefined> {
  return await db.notes.get(id);
}

/**
 * Get notes by project
 */
export async function getByProject(projectId: string): Promise<Note[]> {
  return await db.notes.where('projectId').equals(projectId).toArray();
}

/**
 * Get global notes (no project)
 */
export async function getGlobal(): Promise<Note[]> {
  return await db.notes.where('projectId').equals('').toArray();
}

/**
 * Search notes by title, content or tags
 */
export async function search(query: string): Promise<Note[]> {
  const lowerQuery = query.toLowerCase();
  const all = await db.notes.toArray();
  return all.filter((note: Note) => {
    return (
      note.title.toLowerCase().includes(lowerQuery) ||
      note.contentMd.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Create a new note
 */
export async function create(note: Note): Promise<string> {
  return await db.notes.add(note);
}

/**
 * Update a note
 */
export async function update(id: string, updates: Partial<Note>): Promise<void> {
  await db.notes.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a note
 */
export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

/**
 * Delete all notes for a project
 */
export async function deleteByProject(projectId: string): Promise<void> {
  const projectNotes = await getByProject(projectId);
  const ids = projectNotes.map((n) => n.id);
  await db.notes.bulkDelete(ids);
}

export const noteRepo = {
  getAll,
  getById,
  getByProject,
  getGlobal,
  search,
  create,
  update,
  delete: deleteNote,
  deleteByProject,
};
