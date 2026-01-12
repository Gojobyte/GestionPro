// ============================================================================
// CALENDAR LOGIC - Events & Timeline
// ============================================================================

import type { Project, Milestone, Task, CalendarEvent } from './types';

/**
 * Generate calendar events from projects, milestones and tasks
 */
export function getProjectCalendarEvents(
  project: Project,
  milestones: Milestone[],
  tasks: Task[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Project dates
  if (project.startDate) {
    events.push({
      id: `project-start-${project.id}`,
      title: `🚀 Début: ${project.name}`,
      date: project.startDate,
      type: 'PROJECT',
      entityId: project.id,
      color: 'blue',
    });
  }

  if (project.targetDate) {
    events.push({
      id: `project-end-${project.id}`,
      title: `🎯 Échéance: ${project.name}`,
      date: project.targetDate,
      type: 'PROJECT',
      entityId: project.id,
      color: 'blue',
    });
  }

  // Milestone dates
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  for (const milestone of projectMilestones) {
    if (milestone.dueDate) {
      const color = milestone.status === 'DONE' ? 'green' :
                    milestone.status === 'BLOCKED' ? 'red' : 'orange';

      events.push({
        id: `milestone-${milestone.id}`,
        title: `🎯 ${milestone.title}`,
        date: milestone.dueDate,
        type: 'MILESTONE',
        entityId: milestone.id,
        color,
      });
    }
  }

  // Task dates
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  for (const task of projectTasks) {
    if (task.dueDate) {
      const color = task.status === 'DONE' ? 'green' :
                    task.status === 'BLOCKED' ? 'red' :
                    task.status === 'DOING' ? 'blue' : 'gray';

      events.push({
        id: `task-${task.id}`,
        title: `✓ ${task.title}`,
        date: task.dueDate,
        type: 'TASK',
        entityId: task.id,
        color,
      });
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get all calendar events across all projects
 */
export function getAllCalendarEvents(
  projects: Project[],
  milestones: Milestone[],
  tasks: Task[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const project of projects) {
    const projectEvents = getProjectCalendarEvents(project, milestones, tasks);
    events.push(...projectEvents);
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: string,
  endDate: string
): CalendarEvent[] {
  return events.filter((e) => e.date >= startDate && e.date <= endDate);
}

/**
 * Group events by date (for calendar display)
 */
export function groupEventsByDate(events: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const grouped: Record<string, CalendarEvent[]> = {};

  for (const event of events) {
    if (!grouped[event.date]) {
      grouped[event.date] = [];
    }
    grouped[event.date].push(event);
  }

  return grouped;
}

/**
 * Get events for a specific month
 */
export function getMonthEvents(
  events: CalendarEvent[],
  year: number,
  month: number
): CalendarEvent[] {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  return filterEventsByDateRange(events, startDate, endDate);
}
