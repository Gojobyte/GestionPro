// ============================================================================
// TASK REPOSITORY
// ============================================================================

import { db } from '../db';
import type { Task, TaskStatus } from '../../domain/types';

export const taskRepo = {
  async getAll(): Promise<Task[]> {
    return db.tasks.toArray();
  },

  async getById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
  },

  async getByProject(projectId: string): Promise<Task[]> {
    return db.tasks.where('projectId').equals(projectId).sortBy('order');
  },

  async getByMilestone(milestoneId: string): Promise<Task[]> {
    return db.tasks.where('milestoneId').equals(milestoneId).sortBy('order');
  },

  async getByProjectAndStatus(
    projectId: string,
    status: TaskStatus
  ): Promise<Task[]> {
    return db.tasks
      .where(['projectId', 'status'])
      .equals([projectId, status])
      .sortBy('order');
  },

  async getBlocked(projectId: string): Promise<Task[]> {
    return db.tasks
      .where(['projectId', 'status'])
      .equals([projectId, 'BLOCKED'])
      .toArray();
  },

  async create(task: Task): Promise<string> {
    await db.tasks.add(task);
    return task.id;
  },

  async update(id: string, updates: Partial<Task>): Promise<void> {
    await db.tasks.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  },

  async updateStatus(id: string, status: TaskStatus, blockedReason?: string): Promise<void> {
    const updates: Partial<Task> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'BLOCKED') {
      updates.blockedReason = blockedReason || 'No reason provided';
    } else {
      updates.blockedReason = undefined;
    }

    await db.tasks.update(id, updates);
  },

  async reorder(taskId: string, newOrder: number): Promise<void> {
    await db.tasks.update(taskId, {
      order: newOrder,
      updatedAt: new Date().toISOString(),
    });
  },
};
