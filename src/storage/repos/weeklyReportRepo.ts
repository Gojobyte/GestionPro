// ============================================================================
// WEEKLY REPORT REPOSITORY
// ============================================================================

import { db } from '../db';
import type { WeeklyReport } from '../../domain/types';

/**
 * Get all weekly reports
 */
export async function getAll(): Promise<WeeklyReport[]> {
  return await db.weeklyReports.toArray();
}

/**
 * Get weekly report by ID
 */
export async function getById(id: string): Promise<WeeklyReport | undefined> {
  return await db.weeklyReports.get(id);
}

/**
 * Get weekly reports by project
 */
export async function getByProject(projectId: string): Promise<WeeklyReport[]> {
  return await db.weeklyReports.where('projectId').equals(projectId).toArray();
}

/**
 * Get latest weekly report for a project
 */
export async function getLatest(projectId: string): Promise<WeeklyReport | undefined> {
  const reports = await getByProject(projectId);
  if (reports.length === 0) return undefined;

  return reports.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
}

/**
 * Create a new weekly report
 */
export async function create(report: WeeklyReport): Promise<string> {
  return await db.weeklyReports.add(report);
}

/**
 * Delete a weekly report
 */
export async function deleteReport(id: string): Promise<void> {
  await db.weeklyReports.delete(id);
}

/**
 * Delete all weekly reports for a project
 */
export async function deleteByProject(projectId: string): Promise<void> {
  const projectReports = await getByProject(projectId);
  const ids = projectReports.map((r) => r.id);
  await db.weeklyReports.bulkDelete(ids);
}

export const weeklyReportRepo = {
  getAll,
  getById,
  getByProject,
  getLatest,
  create,
  delete: deleteReport,
  deleteByProject,
};
