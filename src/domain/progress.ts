// ============================================================================
// PROGRESS CALCULATION LOGIC
// ============================================================================

import type {
  Milestone,
  Task,
  Project,
  ProjectProgress,
  MilestoneProgress,
  ProjectHealth,
} from './types';

/**
 * Calcule le progrès d'un jalon (0-1)
 * - Si status == DONE => 1
 * - Sinon => donePoints / totalPoints (0 si aucune tâche)
 */
export function calculateMilestoneProgress(
  milestone: Milestone,
  tasks: Task[]
): number {
  if (milestone.status === 'DONE') {
    return 1;
  }

  const milestoneTasks = tasks.filter((t) => t.milestoneId === milestone.id);

  if (milestoneTasks.length === 0) {
    return 0;
  }

  const totalPoints = milestoneTasks.reduce((sum, t) => sum + t.points, 0);
  const donePoints = milestoneTasks
    .filter((t) => t.status === 'DONE')
    .reduce((sum, t) => sum + t.points, 0);

  if (totalPoints === 0) {
    return 0;
  }

  return donePoints / totalPoints;
}

/**
 * Calcule le progrès global d'un projet (0-100%)
 * progress = sum(milestone.weight * milestone_progress) / sum(milestone.weight)
 */
export function calculateProjectProgress(
  project: Project,
  milestones: Milestone[],
  tasks: Task[]
): number {
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);

  if (projectMilestones.length === 0) {
    return 0;
  }

  const totalWeight = projectMilestones.reduce((sum, m) => sum + m.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  const weightedProgress = projectMilestones.reduce((sum, m) => {
    const milestoneProgress = calculateMilestoneProgress(m, tasks);
    return sum + m.weight * milestoneProgress;
  }, 0);

  const progress = (weightedProgress / totalWeight) * 100;

  return Math.round(progress);
}

/**
 * Calcule la santé d'un projet
 * - AT_RISK : si bloqueurs > 0
 * - LATE : si targetDate dépassée et progress < 100
 * - ON_TRACK : sinon
 */
export function calculateProjectHealth(
  project: Project,
  progressPercent: number,
  blockedCount: number
): ProjectHealth {
  if (blockedCount > 0) {
    return 'AT_RISK';
  }

  if (project.targetDate) {
    const target = new Date(project.targetDate);
    const now = new Date();

    if (now > target && progressPercent < 100) {
      return 'LATE';
    }
  }

  return 'ON_TRACK';
}

/**
 * Calcule les stats complètes d'un projet
 */
export function calculateProjectProgressStats(
  project: Project,
  milestones: Milestone[],
  tasks: Task[]
): ProjectProgress {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const tasksDone = projectTasks.filter((t) => t.status === 'DONE').length;
  const tasksTotal = projectTasks.length;

  const pointsDone = projectTasks
    .filter((t) => t.status === 'DONE')
    .reduce((sum, t) => sum + t.points, 0);
  const pointsTotal = projectTasks.reduce((sum, t) => sum + t.points, 0);

  const progressPercent = calculateProjectProgress(project, milestones, tasks);

  const blockedTasks = projectTasks.filter((t) => t.status === 'BLOCKED').length;
  const blockedMilestones = milestones.filter(
    (m) => m.projectId === project.id && m.status === 'BLOCKED'
  ).length;
  const blockedCount = blockedTasks + blockedMilestones;

  const health = calculateProjectHealth(project, progressPercent, blockedCount);

  return {
    progressPercent,
    tasksDone,
    tasksTotal,
    pointsDone,
    pointsTotal,
    blockedCount,
    health,
  };
}

/**
 * Calcule le progrès de chaque jalon d'un projet
 */
export function calculateMilestonesProgress(
  projectId: string,
  milestones: Milestone[],
  tasks: Task[]
): MilestoneProgress[] {
  const projectMilestones = milestones.filter((m) => m.projectId === projectId);

  return projectMilestones.map((m) => {
    const milestoneTasks = tasks.filter((t) => t.milestoneId === m.id);
    const tasksDone = milestoneTasks.filter((t) => t.status === 'DONE').length;
    const tasksTotal = milestoneTasks.length;
    const progressPercent = Math.round(calculateMilestoneProgress(m, tasks) * 100);

    return {
      milestoneId: m.id,
      progressPercent,
      tasksDone,
      tasksTotal,
    };
  });
}
