// ============================================================================
// DOCUMENT GENERATION - Mustache Template Processing
// ============================================================================

import Mustache from 'mustache';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Project, Milestone, Task, ActivityEvent } from './types';
import { calculateProjectProgressStats, calculateMilestonesProgress } from './progress';

// Template imports
import readmeTemplate from '../templates/readme.mustache?raw';
import specTemplate from '../templates/spec.mustache?raw';
import architectureTemplate from '../templates/architecture.mustache?raw';
import runbookTemplate from '../templates/runbook.mustache?raw';
import changelogTemplate from '../templates/changelog.mustache?raw';
import adrTemplate from '../templates/adr.mustache?raw';

export type DocType = 'README' | 'SPEC' | 'ARCHITECTURE' | 'RUNBOOK' | 'CHANGELOG' | 'ADR';

/**
 * Get template content by document type
 */
function getTemplate(docType: DocType): string {
  switch (docType) {
    case 'README':
      return readmeTemplate;
    case 'SPEC':
      return specTemplate;
    case 'ARCHITECTURE':
      return architectureTemplate;
    case 'RUNBOOK':
      return runbookTemplate;
    case 'CHANGELOG':
      return changelogTemplate;
    case 'ADR':
      return adrTemplate;
  }
}

/**
 * Prepare data for Mustache templates
 */
function prepareTemplateData(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  activityEvents: ActivityEvent[]
): Record<string, unknown> {
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const stats = calculateProjectProgressStats(project, projectMilestones, projectTasks);
  const milestonesProgress = calculateMilestonesProgress(project.id, projectMilestones, projectTasks);

  // Group tasks by status
  const completedTasks = projectTasks.filter((t) => t.status === 'DONE');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'DOING');
  const todoTasks = projectTasks.filter((t) => t.status === 'TODO');
  const blockedTasks = projectTasks.filter((t) => t.status === 'BLOCKED');

  // Blockers
  const blockedMilestones = projectMilestones.filter((m) => m.status === 'BLOCKED');
  const hasBlockers = blockedTasks.length > 0 || blockedMilestones.length > 0;

  // Calculate dates
  const now = new Date();
  const startDate = project.startDate ? new Date(project.startDate) : now;
  const targetDate = project.targetDate ? new Date(project.targetDate) : now;
  const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const overdue = daysRemaining < 0 && stats.progressPercent < 100;

  // Prepare milestones data
  const milestonesData = projectMilestones.map((m, index) => {
    const progress = milestonesProgress.find((mp) => mp.milestoneId === m.id);
    const milestoneTasks = projectTasks.filter((t) => t.milestoneId === m.id);
    const totalWeight = projectMilestones.reduce((sum, mile) => sum + mile.weight, 0);

    return {
      ...m,
      order: index + 1,
      progress: progress?.progressPercent || 0,
      weightPercent: Math.round((m.weight / totalWeight) * 100),
      tasksCount: milestoneTasks.length,
      taskPoints: milestoneTasks.reduce((sum, t) => sum + t.points, 0),
      tasksDone: milestoneTasks.filter((t) => t.status === 'DONE').length,
      tasksInProgress: milestoneTasks.filter((t) => t.status === 'DOING').length,
      tasksTodo: milestoneTasks.filter((t) => t.status === 'TODO').length,
      tasksBlocked: milestoneTasks.filter((t) => t.status === 'BLOCKED').length,
      tasks: milestoneTasks.map((t) => ({
        ...t,
        statusSymbol: t.status === 'DONE' ? 'x' : ' ',
        milestoneName: m.title,
      })),
      tasksNotDone: milestoneTasks.filter((t) => t.status !== 'DONE').map((t) => ({
        ...t,
        milestoneName: m.title,
      })),
      statusSymbol: m.status === 'DONE' ? 'x' : ' ',
      dueDate: m.dueDate ? format(new Date(m.dueDate), 'dd MMMM yyyy', { locale: fr }) : 'Non définie',
      createdAt: format(new Date(m.createdAt), 'dd MMMM yyyy', { locale: fr }),
    };
  });

  // Prepare tasks data with milestone names
  const enrichTask = (t: Task) => {
    const milestone = projectMilestones.find((m) => m.id === t.milestoneId);
    return {
      ...t,
      milestoneName: milestone?.title || 'GENERAL',
      dueDate: t.dueDate ? format(new Date(t.dueDate), 'dd MMMM yyyy', { locale: fr }) : undefined,
      createdAt: format(new Date(t.createdAt), 'dd MMMM yyyy', { locale: fr }),
      updatedAt: format(new Date(t.updatedAt), 'dd MMMM yyyy', { locale: fr }),
    };
  };

  return {
    ...project,
    // Formatted dates
    startDate: project.startDate ? format(new Date(project.startDate), 'dd MMMM yyyy', { locale: fr }) : 'Non définie',
    targetDate: project.targetDate ? format(new Date(project.targetDate), 'dd MMMM yyyy', { locale: fr }) : 'Non définie',
    createdAt: format(new Date(project.createdAt), 'dd MMMM yyyy', { locale: fr }),
    updatedAt: format(new Date(project.updatedAt), 'dd MMMM yyyy', { locale: fr }),
    generatedAt: format(now, 'dd MMMM yyyy à HH:mm', { locale: fr }),

    // Stats
    ...stats,
    completionRate: Math.round((stats.tasksDone / stats.tasksTotal) * 100) || 0,
    pointsCompletionRate: Math.round((stats.pointsDone / stats.pointsTotal) * 100) || 0,
    pointsRemaining: stats.pointsTotal - stats.pointsDone,
    tasksRemaining: stats.tasksTotal - stats.tasksDone,
    tasksInProgress: inProgressTasks.length,

    // Milestones
    milestones: milestonesData,
    milestonesCount: projectMilestones.length,
    milestonesDone: projectMilestones.filter((m) => m.status === 'DONE').length,
    activeMilestonesCount: projectMilestones.filter((m) => m.status !== 'DONE').length,
    completedMilestonesCount: projectMilestones.filter((m) => m.status === 'DONE').length,
    totalWeight: projectMilestones.reduce((sum, m) => sum + m.weight, 0),

    // Tasks by status
    completedTasks: completedTasks.map(enrichTask),
    completedTasksCount: completedTasks.length,
    inProgressTasks: inProgressTasks.map(enrichTask),
    inProgressTasksCount: inProgressTasks.length,
    tasksInProgressCount: inProgressTasks.length,
    todoTasks: todoTasks.map(enrichTask),
    todoTasksCount: todoTasks.length,
    tasksToDoCount: todoTasks.length,
    blockedTasks: blockedTasks.map(enrichTask),
    blockedTasksCount: blockedTasks.length,

    // Blockers
    blockedMilestones: blockedMilestones.map((m) => ({
      ...m,
      updatedAt: format(new Date(m.updatedAt), 'dd MMMM yyyy', { locale: fr }),
    })),
    hasBlockers,

    // Health
    isOnTrack: stats.health === 'ON_TRACK',
    isAtRisk: stats.health === 'AT_RISK',
    isLate: stats.health === 'LATE',

    // Timeline
    duration,
    daysElapsed,
    daysRemaining,
    elapsed: daysElapsed,
    overdue,

    // Averages
    avgTasksPerMilestone: projectMilestones.length > 0 ? Math.round(projectTasks.length / projectMilestones.length) : 0,
    avgPointsPerTask: projectTasks.length > 0 ? Math.round(stats.pointsTotal / projectTasks.length) : 0,

    // Activity
    recentActivity: groupActivityByDate(activityEvents),

    // Flags
    hasPendingIssues: todoTasks.length > 0 || inProgressTasks.length > 0,
  };
}

/**
 * Group activity events by date
 */
function groupActivityByDate(events: ActivityEvent[]): Array<{ date: string; events: Array<{ type: string; description: string; time: string }> }> {
  const grouped: Record<string, Array<{ type: string; description: string; time: string }>> = {};

  events.forEach((event) => {
    const date = format(new Date(event.createdAt), 'dd MMMM yyyy', { locale: fr });
    const time = format(new Date(event.createdAt), 'HH:mm', { locale: fr });

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push({
      type: event.type,
      description: event.description || event.type,
      time,
    });
  });

  return Object.entries(grouped)
    .map(([date, events]) => ({ date, events }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10); // Last 10 days of activity
}

/**
 * Generate a document from a template
 */
export function generateDocument(
  docType: DocType,
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  activityEvents: ActivityEvent[]
): string {
  const template = getTemplate(docType);
  const data = prepareTemplateData(project, milestones, tasks, activityEvents);

  return Mustache.render(template, data);
}

/**
 * Get document filename
 */
export function getDocumentFilename(docType: DocType, projectName: string): string {
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const timestamp = format(new Date(), 'yyyy-MM-dd');

  switch (docType) {
    case 'README':
      return `${safeName}-README.md`;
    case 'SPEC':
      return `${safeName}-SPEC-${timestamp}.md`;
    case 'ARCHITECTURE':
      return `${safeName}-ARCHITECTURE-${timestamp}.md`;
    case 'RUNBOOK':
      return `${safeName}-RUNBOOK.md`;
    case 'CHANGELOG':
      return `${safeName}-CHANGELOG-${timestamp}.md`;
    case 'ADR':
      return `${safeName}-ADR-${timestamp}.md`;
  }
}
