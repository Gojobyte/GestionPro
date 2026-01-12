// ============================================================================
// ACTIVITY EVENT REPOSITORY
// ============================================================================

import { db } from '../db';
import type { ActivityEvent, ActivityEventType } from '../../domain/types';

export const activityEventRepo = {
  async getAll(): Promise<ActivityEvent[]> {
    return db.activityEvents.reverse().sortBy('createdAt');
  },

  async getById(id: string): Promise<ActivityEvent | undefined> {
    return db.activityEvents.get(id);
  },

  async getByProject(projectId: string, limit?: number): Promise<ActivityEvent[]> {
    const query = db.activityEvents.where('projectId').equals(projectId).reverse().sortBy('createdAt');

    if (limit) {
      return (await query).slice(0, limit);
    }

    return query;
  },

  async getByProjectAndDateRange(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<ActivityEvent[]> {
    return db.activityEvents
      .where('projectId')
      .equals(projectId)
      .and((event) => event.createdAt >= startDate && event.createdAt <= endDate)
      .reverse()
      .sortBy('createdAt');
  },

  async getByType(type: ActivityEventType): Promise<ActivityEvent[]> {
    return db.activityEvents.where('type').equals(type).reverse().sortBy('createdAt');
  },

  async create(event: ActivityEvent): Promise<string> {
    await db.activityEvents.add(event);
    return event.id;
  },

  async delete(id: string): Promise<void> {
    await db.activityEvents.delete(id);
  },

  async deleteByProject(projectId: string): Promise<void> {
    const events = await db.activityEvents.where('projectId').equals(projectId).toArray();
    const ids = events.map((e) => e.id);
    await db.activityEvents.bulkDelete(ids);
  },
};
