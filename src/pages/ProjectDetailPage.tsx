// ============================================================================
// PROJECT DETAIL PAGE - Project Dashboard
// ============================================================================

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { activityEventRepo } from '../storage/repos/activityEventRepo';
import { weeklyReportRepo } from '../storage/repos/weeklyReportRepo';
import { calculateProjectProgressStats, calculateMilestonesProgress } from '../domain/progress';
import { generateWeeklyReport, getWeekBoundaries } from '../domain/reports';
import { exportProject, getBackupFilename } from '../domain/backup';
import type { Project, Milestone, Task, ActivityEvent, ProjectProgress, MilestoneProgress } from '../domain/types';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ProjectProgress | null>(null);
  const [milestonesProgress, setMilestonesProgress] = useState<MilestoneProgress[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const [proj, miles, tsks, activity] = await Promise.all([
        projectRepo.getById(projectId),
        milestoneRepo.getByProject(projectId),
        taskRepo.getByProject(projectId),
        activityEventRepo.getByProject(projectId, 10),
      ]);

      if (!proj) {
        setLoading(false);
        return;
      }

      setProject(proj);
      setMilestones(miles);
      setTasks(tsks);
      setRecentActivity(activity);

      const projectStats = calculateProjectProgressStats(proj, miles, tsks);
      setStats(projectStats);

      const milesProgress = calculateMilestonesProgress(projectId, miles, tsks);
      setMilestonesProgress(milesProgress);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    if (!project || !projectId) return;

    try {
      const weekBounds = getWeekBoundaries(new Date());
      const latestReport = await weeklyReportRepo.getLatest(projectId);
      const previousProgress = latestReport?.progressEnd;

      const report = generateWeeklyReport(
        project,
        milestones,
        tasks,
        recentActivity,
        weekBounds.start,
        weekBounds.end,
        previousProgress
      );

      await weeklyReportRepo.create(report);
      alert('Rapport hebdomadaire généré avec succès !');
      navigate(`/projects/${projectId}/reports`);
    } catch (error) {
      console.error('Failed to generate weekly report:', error);
      alert('Échec de la génération du rapport hebdomadaire');
    }
  };

  const handleExportBackup = async () => {
    if (!project || !projectId) return;

    setExporting(true);
    try {
      const backup = await exportProject(projectId);
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getBackupFilename(project.name);
      a.click();
      URL.revokeObjectURL(url);
      alert('Sauvegarde exportée avec succès !');
    } catch (error) {
      console.error('Failed to export backup:', error);
      alert('Échec de l\'export de la sauvegarde');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="section">
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            Projet introuvable.
          </p>
          <Link to="/projects" className="btn-primary">
            Retour aux Projets
          </Link>
        </div>
      </div>
    );
  }

  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const blockedMilestones = milestones.filter((m) => m.status === 'BLOCKED');
  const upcomingTasks = tasks
    .filter((t) => (t.status === 'TODO' || t.status === 'DOING') && t.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 5);

  const nextMilestone = milestones
    .filter((m) => m.status !== 'DONE' && m.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))[0];

  return (
    <div className="section">
      {/* Header */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <h1 className="section-title" style={{ marginBottom: 0 }}>{project.name}</h1>
              <span className={`badge ${project.type === 'TENDER' ? 'badge-success' : 'badge-primary'}`}>
                {project.type === 'TENDER' ? 'Offre' : 'Dev'}
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              {project.description}
            </p>
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
                {project.tags.map(tag => (
                  <span key={tag} className="badge badge-gray">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex" style={{ gap: 'var(--space-2)' }}>
            <span className={`badge ${
              stats?.health === 'ON_TRACK' ? 'badge-success' :
              stats?.health === 'AT_RISK' ? 'badge-warning' : 'badge-error'
            }`}>
              {stats?.health === 'ON_TRACK' ? 'Sur la bonne voie' :
               stats?.health === 'AT_RISK' ? 'À risque' : 'En retard'}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap" style={{ gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
          <Link to={`/projects/${projectId}/tasks`} className="btn-secondary btn-sm">
            Tâches & Jalons
          </Link>
          <Link to={`/projects/${projectId}/calendar`} className="btn-secondary btn-sm">
            Calendrier
          </Link>
          <Link to={`/projects/${projectId}/reports`} className="btn-secondary btn-sm">
            Rapports
          </Link>
          <Link to={`/projects/${projectId}/docs`} className="btn-secondary btn-sm">
            Documents
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-card-label">Progression Globale</div>
          <div className="stat-card-value" style={{ color: 'var(--color-primary)' }}>
            {stats?.progressPercent || 0}%
          </div>
          <div className="progress-bar" style={{ marginTop: 'var(--space-3)' }}>
            <div
              className={`progress-bar-fill ${
                stats?.health === 'ON_TRACK' ? 'success' :
                stats?.health === 'AT_RISK' ? 'warning' : 'error'
              }`}
              style={{ width: `${stats?.progressPercent || 0}%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Tâches Terminées</div>
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>
            {stats?.tasksDone || 0}
          </div>
          <div className="stat-card-sublabel">
            sur {stats?.tasksTotal || 0} tâches ({stats?.pointsDone || 0}/{stats?.pointsTotal || 0} points)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Prochain Jalon</div>
          {nextMilestone ? (
            <>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: '600', color: 'var(--color-text-primary)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                {nextMilestone.title}
              </div>
              <div className="stat-card-sublabel">
                {nextMilestone.dueDate ? format(new Date(nextMilestone.dueDate), 'dd MMM yyyy', { locale: fr }) : 'Pas de date'}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
              Aucun jalon à venir
            </div>
          )}
        </div>

        {(blockedTasks.length > 0 || blockedMilestones.length > 0) && (
          <div className="stat-card" style={{ backgroundColor: 'var(--color-error-light)' }}>
            <div className="stat-card-label">Blocages</div>
            <div className="stat-card-value" style={{ color: 'var(--color-error)' }}>
              {blockedTasks.length + blockedMilestones.length}
            </div>
            <div className="stat-card-sublabel">
              {blockedMilestones.length} jalons, {blockedTasks.length} tâches
            </div>
          </div>
        )}
      </div>

      {/* Blockers Section */}
      {(blockedTasks.length > 0 || blockedMilestones.length > 0) && (
        <div className="card" style={{ backgroundColor: 'var(--color-error-light)', border: '1px solid var(--color-error)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            Blocages ({blockedTasks.length + blockedMilestones.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {blockedMilestones.map((m) => (
              <div key={m.id} className="card">
                <div style={{ fontWeight: '600', color: 'var(--color-error)' }}>Jalon : {m.title}</div>
                {m.blockedReason && (
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                    {m.blockedReason}
                  </div>
                )}
              </div>
            ))}
            {blockedTasks.map((t) => (
              <div key={t.id} className="card">
                <div style={{ fontWeight: '600', color: 'var(--color-error)' }}>Tâche : {t.title}</div>
                {t.blockedReason && (
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                    {t.blockedReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones and Tasks Grid */}
      <div className="grid md:grid-cols-2 gap-5" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Milestones Section */}
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Jalons ({milestones.length})
          </h2>
          {milestones.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Aucun jalon pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {milestones.map((m) => {
                const progress = milestonesProgress.find((mp) => mp.milestoneId === m.id);
                return (
                  <div key={m.id}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>{m.title}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                          Poids: {m.weight} | Progression: {progress?.progressPercent || 0}%
                        </div>
                      </div>
                      <span className={`badge ${
                        m.status === 'DONE' ? 'badge-success' :
                        m.status === 'IN_PROGRESS' ? 'badge-primary' :
                        m.status === 'BLOCKED' ? 'badge-error' : 'badge-gray'
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${
                          m.status === 'DONE' ? 'success' :
                          m.status === 'IN_PROGRESS' ? '' :
                          m.status === 'BLOCKED' ? 'error' : ''
                        }`}
                        style={{ width: `${progress?.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Tasks Section */}
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Top 5 Tâches à Faire
          </h2>
          {upcomingTasks.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Aucune tâche avec date limite.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {upcomingTasks.map((t) => (
                <div key={t.id} className="flex items-start justify-between">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{t.title}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {t.dueDate ? format(new Date(t.dueDate), 'dd MMM yyyy', { locale: fr }) : 'Pas de date'} | {t.points} pts
                    </div>
                  </div>
                  <span className={`badge ${
                    t.status === 'DONE' ? 'badge-success' :
                    t.status === 'DOING' ? 'badge-primary' :
                    t.status === 'BLOCKED' ? 'badge-error' : 'badge-gray'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Activité Récente
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {recentActivity.map((event) => (
              <div
                key={event.id}
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  borderLeft: '2px solid var(--color-border)',
                  paddingLeft: 'var(--space-3)'
                }}
              >
                <span style={{ fontWeight: '600' }}>{event.type.replace('_', ' ')}</span>
                {' - '}
                {format(new Date(event.createdAt), "dd MMM 'à' HH:mm", { locale: fr })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
          Actions Rapides
        </h2>
        <div className="grid md:grid-cols-4 gap-3">
          <Link to={`/projects/${projectId}/tasks`} className="btn-primary">
            Ajouter une Tâche
          </Link>
          <Link to={`/projects/${projectId}/docs`} className="btn-secondary">
            Générer un Document
          </Link>
          <button onClick={handleGenerateWeeklyReport} className="btn-success">
            Rapport Hebdomadaire
          </button>
          <button onClick={handleExportBackup} disabled={exporting} className="btn-secondary">
            {exporting ? 'Export en cours...' : 'Exporter une Sauvegarde'}
          </button>
        </div>
      </div>
    </div>
  );
}
