// ============================================================================
// MILESTONE REPOSITORY
// ============================================================================

import { db } from '../db';
import type { Milestone, MilestoneStatus } from '../../domain/types';

export const milestoneRepo = {
  async getAll(): Promise<Milestone[]> {
    return db.milestones.toArray();
  },

  async getById(id: string): Promise<Milestone | undefined> {
    return db.milestones.get(id);
  },

  async getByProject(projectId: string): Promise<Milestone[]> {
    return db.milestones.where('projectId').equals(projectId).toArray();
  },

  async getByProjectAndStatus(
    projectId: string,
    status: MilestoneStatus
  ): Promise<Milestone[]> {
    return db.milestones
      .where(['projectId', 'status'])
      .equals([projectId, status])
      .toArray();
  },

  async create(milestone: Milestone): Promise<string> {
    await db.milestones.add(milestone);
    return milestone.id;
  },

  async update(id: string, updates: Partial<Milestone>): Promise<void> {
    await db.milestones.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.milestones.delete(id);
  },

  async updateStatus(id: string, status: MilestoneStatus): Promise<void> {
    await db.milestones.update(id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  },
};
