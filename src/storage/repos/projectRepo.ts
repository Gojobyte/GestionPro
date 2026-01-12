// ============================================================================
// PROJECT REPOSITORY
// ============================================================================

import { db } from '../db';
import type { Project } from '../../domain/types';

export const projectRepo = {
  async getAll(): Promise<Project[]> {
    return db.projects.toArray();
  },

  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  },

  async getActive(): Promise<Project[]> {
    return db.projects.where('status').equals('ACTIVE').toArray();
  },

  async getArchived(): Promise<Project[]> {
    return db.projects.where('status').equals('ARCHIVED').toArray();
  },

  async create(project: Project): Promise<string> {
    await db.projects.add(project);
    return project.id;
  },

  async update(id: string, updates: Partial<Project>): Promise<void> {
    await db.projects.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  },

  async archive(id: string): Promise<void> {
    await db.projects.update(id, {
      status: 'ARCHIVED',
      updatedAt: new Date().toISOString(),
    });
  },

  async unarchive(id: string): Promise<void> {
    await db.projects.update(id, {
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    });
  },
};
