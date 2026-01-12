// ============================================================================
// DEXIE DATABASE CONFIGURATION
// ============================================================================

import Dexie from 'dexie';
import type {
  Project,
  Milestone,
  Task,
  ProjectUpdate,
  Decision,
  Note,
  Snippet,
  DocumentMeta,
  EmbeddedFile,
  Settings,
  ActivityEvent,
  WeeklyReport,
  ProgressSnapshot,
} from '../domain/types';

export class DevOrganizerDB extends Dexie {
  projects!: Dexie.Table<Project, string>;
  milestones!: Dexie.Table<Milestone, string>;
  tasks!: Dexie.Table<Task, string>;
  projectUpdates!: Dexie.Table<ProjectUpdate, string>;
  decisions!: Dexie.Table<Decision, string>;
  notes!: Dexie.Table<Note, string>;
  snippets!: Dexie.Table<Snippet, string>;
  documentMetas!: Dexie.Table<DocumentMeta, string>;
  embeddedFiles!: Dexie.Table<EmbeddedFile, string>;
  settings!: Dexie.Table<Settings, string>;
  activityEvents!: Dexie.Table<ActivityEvent, string>;
  weeklyReports!: Dexie.Table<WeeklyReport, string>;
  progressSnapshots!: Dexie.Table<ProgressSnapshot, string>;

  constructor() {
    super('DevOrganizerDB');

    this.version(1).stores({
      projects: 'id, status, priority, createdAt, updatedAt',
      milestones: 'id, projectId, status, dueDate, createdAt, updatedAt',
      tasks: 'id, projectId, milestoneId, status, dueDate, order, createdAt, updatedAt',
      projectUpdates: 'id, projectId, date',
      decisions: 'id, projectId, date',
      notes: 'id, projectId, createdAt, updatedAt',
      snippets: 'id, projectId, createdAt, updatedAt',
      documentMetas: 'id, projectId, storageMode, createdAt, updatedAt',
      embeddedFiles: 'key',
      settings: 'id',
      activityEvents: 'id, projectId, type, createdAt',
      weeklyReports: 'id, projectId, periodStart, periodEnd, generatedAt',
      progressSnapshots: 'id, projectId, date',
    });
  }
}

export const db = new DevOrganizerDB();

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initializeDB(): Promise<void> {
  // Ensure Settings singleton exists
  const existingSettings = await db.settings.get('singleton');

  if (!existingSettings) {
    await db.settings.put({
      id: 'singleton',
      embedLimitMb: 20,
      workspaceLinked: false,
      schemaVersion: 1,
    });
  }
}
