// ============================================================================
// DOMAIN TYPES - Dev Organizer
// ============================================================================

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type ProjectPriority = 'LOW' | 'MED' | 'HIGH';
export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'LATE';
export type ProjectType = 'CODE' | 'TENDER'; // CODE = Projet de développement, TENDER = Appel d'offres

export type MilestoneStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
export type TaskStatus = 'TODO' | 'DOING' | 'DONE' | 'BLOCKED';

export type StorageMode = 'EMBEDDED' | 'WORKSPACE';

export type ActivityEventType =
  | 'TASK_DONE'
  | 'TASK_BLOCKED'
  | 'MILESTONE_DONE'
  | 'DOC_ADDED'
  | 'NOTE_EDITED';

// ============================================================================
// ENTITIES
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  type: ProjectType; // Type de projet: CODE ou TENDER
  tags: string[];
  objectives: string[];
  startDate?: string; // ISO date string
  targetDate?: string; // ISO date string

  // Champs spécifiques aux appels d'offres (TENDER)
  tenderDeadline?: string; // Date limite de soumission
  tenderBudget?: number; // Budget estimé
  tenderClient?: string; // Nom du client
  tenderStatus?: 'DRAFT' | 'SUBMITTED' | 'WON' | 'LOST'; // Statut de l'appel d'offres

  // Champs spécifiques aux projets code (CODE)
  repositoryUrl?: string; // URL du dépôt Git
  techStack?: string[]; // Technologies utilisées

  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate?: string; // ISO date string
  status: MilestoneStatus;
  weight: number; // >= 1
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string; // nullable
  title: string;
  status: TaskStatus;
  dueDate?: string; // ISO date string
  points: number; // default 1
  order: number; // for stable sorting
  blockedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  done: string[];
  next: string[];
  blockers: string[];
}

export interface Decision {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  title: string;
  context: string;
  decision: string;
  consequences: string;
}

export interface Note {
  id: string;
  projectId?: string; // nullable
  title: string;
  contentMd: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Snippet {
  id: string;
  projectId?: string; // nullable
  title: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMeta {
  id: string;
  projectId?: string; // nullable
  title: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  tags: string[];
  storageMode: StorageMode;
  embeddedKey?: string; // if EMBEDDED
  workspaceFileName?: string; // if WORKSPACE
  createdAt: string;
  updatedAt: string;
}

export interface EmbeddedFile {
  key: string;
  blob: Blob;
  checksum?: string;
  sizeBytes: number;
}

export interface Settings {
  id: string; // always "singleton"
  embedLimitMb: number;
  workspaceLinked: boolean;
  schemaVersion: number;
  lastBackupAt?: string;
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  type: ActivityEventType;
  entityId?: string;
  description?: string;
  createdAt: string;
  payload: Record<string, any>; // JSON
}

export interface WeeklyReport {
  id: string;
  projectId: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  generatedAt: string;
  progressStart: number;
  progressEnd: number;
  delta: number;
  markdownContent: string;
}

export interface ProgressSnapshot {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  progressPercent: number;
}

// ============================================================================
// COMPUTED / VIEW MODELS
// ============================================================================

export interface ProjectProgress {
  progressPercent: number;
  tasksDone: number;
  tasksTotal: number;
  pointsDone: number;
  pointsTotal: number;
  blockedCount: number;
  health: ProjectHealth;
}

export interface MilestoneProgress {
  milestoneId: string;
  progressPercent: number;
  tasksDone: number;
  tasksTotal: number;
}

export interface CalendarEvent {
  id: string;
  type: 'PROJECT' | 'MILESTONE' | 'TASK';
  title: string;
  date: string; // ISO date
  status?: MilestoneStatus | TaskStatus;
  projectId?: string;
  milestoneId?: string;
  points?: number;
  weight?: number;
  progress?: number;
  entityId?: string;
  color?: string;
}
