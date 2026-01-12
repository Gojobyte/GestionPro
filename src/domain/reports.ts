// ============================================================================
// REPORTS LOGIC - Weekly Report Generation
// ============================================================================

import { generateId } from '../utils/id';
import { calculateProjectProgress } from './progress';
import type { Project, Milestone, Task, WeeklyReport, ActivityEvent } from './types';

/**
 * Generate a weekly report for a project
 */
export function generateWeeklyReport(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  _activityEvents: ActivityEvent[],
  periodStart: string,
  periodEnd: string,
  previousProgress?: number
): WeeklyReport {
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Calculate current progress
  const progressPercent = calculateProjectProgress(project, projectMilestones, projectTasks);
  const progressStart = previousProgress !== undefined ? previousProgress : progressPercent;
  const delta = progressPercent - progressStart;

  // Get activity events for this period (for future use)
  // const periodEvents = activityEvents.filter(
  //   (e) =>
  //     e.projectId === project.id &&
  //     e.createdAt >= periodStart &&
  //     e.createdAt <= periodEnd
  // );

  // Tasks completed this week
  const tasksCompleted = projectTasks.filter(
    (t) =>
      t.status === 'DONE' &&
      t.updatedAt >= periodStart &&
      t.updatedAt <= periodEnd
  );

  // Tasks created this week
  const tasksCreated = projectTasks.filter(
    (t) =>
      t.createdAt >= periodStart &&
      t.createdAt <= periodEnd
  );

  // Milestones completed this week
  const milestonesCompleted = projectMilestones.filter(
    (m) =>
      m.status === 'DONE' &&
      m.updatedAt >= periodStart &&
      m.updatedAt <= periodEnd
  );

  // Blocked tasks
  const blockedTasks = projectTasks.filter((t) => t.status === 'BLOCKED');

  // Next milestones (upcoming)
  const nextMilestones = projectMilestones
    .filter((m) => m.status !== 'DONE' && m.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 3);

  // Generate Markdown content
  const markdown = generateReportMarkdown(
    project,
    progressPercent,
    delta,
    tasksCompleted,
    tasksCreated,
    milestonesCompleted,
    blockedTasks,
    nextMilestones,
    periodStart,
    periodEnd
  );

  const report: WeeklyReport = {
    id: generateId(),
    projectId: project.id,
    periodStart,
    periodEnd,
    generatedAt: new Date().toISOString(),
    progressStart,
    progressEnd: progressPercent,
    delta,
    markdownContent: markdown,
  };

  return report;
}

/**
 * Generate Markdown content for weekly report
 */
function generateReportMarkdown(
  project: Project,
  progressPercent: number,
  delta: number,
  tasksCompleted: Task[],
  tasksCreated: Task[],
  milestonesCompleted: Milestone[],
  blockedTasks: Task[],
  nextMilestones: Milestone[],
  periodStart: string,
  periodEnd: string
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Rapport Hebdomadaire - ${project.name}`);
  lines.push('');
  lines.push(`**Période** : ${periodStart} → ${periodEnd}`);
  lines.push(`**Généré le** : ${new Date().toLocaleDateString('fr-FR')}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Progress
  lines.push('## 📊 Progression');
  lines.push('');
  lines.push(`- **Progression actuelle** : ${progressPercent}%`);
  const deltaSign = delta >= 0 ? '+' : '';
  const deltaEmoji = delta > 0 ? '📈' : delta < 0 ? '📉' : '➡️';
  lines.push(`- **Delta cette semaine** : ${deltaEmoji} ${deltaSign}${delta}%`);
  lines.push('');

  // Milestones completed
  if (milestonesCompleted.length > 0) {
    lines.push('## ✅ Jalons Complétés');
    lines.push('');
    for (const milestone of milestonesCompleted) {
      lines.push(`- ${milestone.title}`);
    }
    lines.push('');
  }

  // Tasks completed
  if (tasksCompleted.length > 0) {
    lines.push('## ✓ Tâches Terminées');
    lines.push('');
    for (const task of tasksCompleted) {
      lines.push(`- ${task.title} (${task.points} pts)`);
    }
    lines.push('');
  }

  // Tasks created
  if (tasksCreated.length > 0) {
    lines.push('## ➕ Nouvelles Tâches');
    lines.push('');
    for (const task of tasksCreated) {
      lines.push(`- ${task.title} (${task.points} pts)`);
    }
    lines.push('');
  }

  // Blockers
  if (blockedTasks.length > 0) {
    lines.push('## 🚫 Blocages');
    lines.push('');
    for (const task of blockedTasks) {
      const reason = task.blockedReason ? ` - ${task.blockedReason}` : '';
      lines.push(`- ${task.title}${reason}`);
    }
    lines.push('');
  }

  // Next milestones
  if (nextMilestones.length > 0) {
    lines.push('## 🎯 Prochains Jalons');
    lines.push('');
    for (const milestone of nextMilestones) {
      const dueDate = milestone.dueDate ? ` (${milestone.dueDate})` : '';
      lines.push(`- ${milestone.title}${dueDate}`);
    }
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('_Généré automatiquement par Dev Organizer_');

  return lines.join('\n');
}

/**
 * Get week boundaries (Monday to Sunday) for a given date
 */
export function getWeekBoundaries(date: Date): { start: string; end: string } {
  const d = new Date(date);

  // Get Monday of the week
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  // Get Sunday of the week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}
