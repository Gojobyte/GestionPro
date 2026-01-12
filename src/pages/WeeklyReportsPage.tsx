// ============================================================================
// WEEKLY REPORTS PAGE - List and Generate Reports
// ============================================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Project, WeeklyReport } from '../domain/types';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { activityEventRepo } from '../storage/repos/activityEventRepo';
import { weeklyReportRepo } from '../storage/repos/weeklyReportRepo';
import { generateWeeklyReport, getWeekBoundaries } from '../domain/reports';

export default function WeeklyReportsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    if (!projectId) return;

    try {
      const [projectData, reportsData] = await Promise.all([
        projectRepo.getById(projectId),
        weeklyReportRepo.getByProject(projectId),
      ]);

      if (!projectData) {
        setLoading(false);
        return;
      }

      setProject(projectData);
      setReports(reportsData.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)));
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateReport() {
    if (!project || !projectId) return;

    setGenerating(true);
    try {
      const [milestones, tasks, activityEvents] = await Promise.all([
        milestoneRepo.getByProject(projectId),
        taskRepo.getByProject(projectId),
        activityEventRepo.getByProject(projectId),
      ]);

      // Get current week boundaries
      const weekBounds = getWeekBoundaries(new Date());

      // Get previous report for progress comparison
      const latestReport = await weeklyReportRepo.getLatest(projectId);
      const previousProgress = latestReport?.progressEnd;

      const report = generateWeeklyReport(
        project,
        milestones,
        tasks,
        activityEvents,
        weekBounds.start,
        weekBounds.end,
        previousProgress
      );

      await weeklyReportRepo.create(report);
      await loadData();
      setSelectedReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Échec de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteReport(reportId: string) {
    if (!confirm('Supprimer ce rapport ?')) return;

    try {
      await weeklyReportRepo.delete(reportId);
      await loadData();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Échec de la suppression');
    }
  }

  function handleDownloadReport(report: WeeklyReport) {
    const blob = new Blob([report.markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-hebdo-${report.periodStart}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Rapports Hebdomadaires</h1>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Rapports Hebdomadaires</h1>
        <p className="text-red-600">Projet non trouvé.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Rapports Hebdomadaires</h1>
          <p className="text-gray-600">{project.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/projects/${projectId}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour au projet
          </Link>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {generating ? 'Génération...' : '+ Générer Rapport Hebdo'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-lg">Rapports ({reports.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <div className="p-4 text-gray-600 text-sm">Aucun rapport généré.</div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedReport?.id === report.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="font-medium text-gray-900">
                      {format(new Date(report.periodStart), 'dd MMM', { locale: fr })} →{' '}
                      {format(new Date(report.periodEnd), 'dd MMM yyyy', { locale: fr })}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Progression: {report.progressEnd}%
                      <span
                        className={`ml-2 ${
                          report.delta > 0 ? 'text-green-600' :
                          report.delta < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        ({report.delta >= 0 ? '+' : ''}{report.delta}%)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Généré le {format(new Date(report.generatedAt), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="md:col-span-2">
          {selectedReport ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-bold text-lg">Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ⬇️ Télécharger .md
                  </button>
                  <button
                    onClick={() => handleDeleteReport(selectedReport.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
              <div className="p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                  {selectedReport.markdownContent}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
              Sélectionnez un rapport pour le prévisualiser
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
