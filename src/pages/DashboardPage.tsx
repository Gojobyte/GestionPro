// ============================================================================
// DASHBOARD PAGE - Vue d'ensemble professionnelle
// ============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Project, Milestone, Task, ActivityEvent } from '../domain/types';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { activityEventRepo } from '../storage/repos/activityEventRepo';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [projectsData, milestonesData, tasksData, activityData] = await Promise.all([
        projectRepo.getActive(),
        milestoneRepo.getAll(),
        taskRepo.getAll(),
        activityEventRepo.getAll(),
      ]);

      setProjects(projectsData);
      setMilestones(milestonesData);
      setTasks(tasksData);
      setActivityEvents(activityData.slice(0, 20));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasksDueToday = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  });

  // Tasks coming in the next 7 days
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const tasksComingUp = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= tomorrow && dueDate < nextWeek;
  }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // Global blockers
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const blockedMilestones = milestones.filter((m) => m.status === 'BLOCKED');

  // Quick stats
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const totalBlockers = blockedTasks.length + blockedMilestones.length;

  if (loading) {
    return (
      <div className="section">
        <h1 className="section-title">Tableau de Bord</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="section-title">Tableau de Bord</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <Link to="/projects/new" className="btn-primary">
          + Nouveau Projet
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Projets Actifs</div>
          <div className="stat-card-value" style={{ color: 'var(--color-primary)' }}>{totalProjects}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Tâches Terminées</div>
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>{doneTasks}</div>
          <div className="stat-card-sublabel">sur {totalTasks} tâches</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Taux de Complétion</div>
          <div className="stat-card-value" style={{ color: '#9333EA' }}>{completionRate}%</div>
          <div className="progress-bar" style={{ marginTop: 'var(--space-3)' }}>
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        <div className="stat-card" style={{ backgroundColor: totalBlockers > 0 ? 'var(--color-error-light)' : 'var(--color-bg-primary)' }}>
          <div className="stat-card-label">Blocages</div>
          <div className="stat-card-value" style={{ color: totalBlockers > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {totalBlockers}
          </div>
          {totalBlockers > 0 && (
            <div className="stat-card-sublabel">{blockedTasks.length} tâches, {blockedMilestones.length} jalons</div>
          )}
        </div>
      </div>

      {/* Global Blockers */}
      {totalBlockers > 0 && (
        <div className="card" style={{ backgroundColor: 'var(--color-error-light)', border: '1px solid var(--color-error)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
            ⚠️ Blocages Globaux ({totalBlockers})
          </h2>

          {blockedMilestones.length > 0 && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                Jalons Bloqués ({blockedMilestones.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {blockedMilestones.map((milestone) => {
                  const project = projects.find((p) => p.id === milestone.projectId);
                  return (
                    <div key={milestone.id} className="card" style={{ padding: 'var(--space-3)' }}>
                      <Link to={`/projects/${milestone.projectId}`} style={{ color: 'var(--color-error)', fontWeight: '500', textDecoration: 'none' }} className="hover:underline">
                        {project?.name}
                      </Link>
                      <span style={{ color: 'var(--color-text-secondary)', margin: '0 var(--space-2)' }}>→</span>
                      <span>{milestone.title}</span>
                      {milestone.blockedReason && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 'var(--space-1)' }}>
                          {milestone.blockedReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {blockedTasks.length > 0 && (
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                Tâches Bloquées ({blockedTasks.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {blockedTasks.slice(0, 5).map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  return (
                    <div key={task.id} className="card" style={{ padding: 'var(--space-3)' }}>
                      <Link to={`/projects/${task.projectId}/milestones-tasks`} style={{ color: 'var(--color-error)', fontWeight: '500', textDecoration: 'none' }} className="hover:underline">
                        {project?.name}
                      </Link>
                      <span style={{ color: 'var(--color-text-secondary)', margin: '0 var(--space-2)' }}>→</span>
                      <span>{task.title}</span>
                      {task.blockedReason && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 'var(--space-1)' }}>
                          {task.blockedReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Tasks Due Today */}
        {tasksDueToday.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
              📅 Tâches Dues Aujourd'hui ({tasksDueToday.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {tasksDueToday.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <div key={task.id} className="flex items-center justify-between" style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div>
                      <Link to={`/projects/${task.projectId}/milestones-tasks`} style={{ fontWeight: '500', textDecoration: 'none', color: 'var(--color-text-primary)' }} className="hover:underline">
                        {task.title}
                      </Link>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-1)' }}>
                        {project?.name}
                      </div>
                    </div>
                    <span className={`badge ${
                      task.status === 'TODO' ? 'badge-gray' :
                      task.status === 'DOING' ? 'badge-primary' :
                      'badge-error'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Tasks */}
        {tasksComingUp.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
              📆 Tâches à Venir ({tasksComingUp.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {tasksComingUp.slice(0, 5).map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const daysUntilDue = Math.ceil((new Date(task.dueDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="flex items-center justify-between" style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border-light)' }}>
                    <div style={{ flex: 1 }}>
                      <Link to={`/projects/${task.projectId}/milestones-tasks`} style={{ fontWeight: '500', textDecoration: 'none', color: 'var(--color-text-primary)' }} className="hover:underline">
                        {task.title}
                      </Link>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-1)' }}>
                        {project?.name}
                      </div>
                    </div>
                    <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        dans {daysUntilDue}j
                      </span>
                      <span className={`badge ${
                        task.status === 'TODO' ? 'badge-gray' :
                        task.status === 'DOING' ? 'badge-primary' :
                        'badge-error'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Projet Récent
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {projects.slice(0, 1).map((project) => {
              const projectTasks = tasks.filter((t) => t.projectId === project.id);
              const tasksDone = projectTasks.filter((t) => t.status === 'DONE').length;
              const tasksTotal = projectTasks.length;
              const progressPercent = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

              return (
                <div key={project.id} className="card" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                        <Link
                          to={`/projects/${project.id}`}
                          style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none'
                          }}
                          className="hover:underline"
                        >
                          {project.name}
                        </Link>
                        <span className={`badge ${project.type === 'TENDER' ? 'badge-success' : 'badge-primary'}`}>
                          {project.type === 'TENDER' ? 'Offre' : 'Dev'}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {project.description}
                      </p>
                    </div>
                    <Link to={`/projects/${project.id}`} className="btn-secondary btn-sm">
                      Voir
                    </Link>
                  </div>
                  <div className="flex items-center" style={{ gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                        {tasksDone}/{tasksTotal} tâches • {progressPercent}%
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill success"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <span className={`badge ${
                      project.priority === 'HIGH' ? 'badge-error' :
                      project.priority === 'MED' ? 'badge-warning' : 'badge-gray'
                    }`}>
                      {project.priority === 'HIGH' ? 'Haute' : project.priority === 'MED' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            {projects.length > 1 && (
              <Link to="/projects" className="btn-secondary">
                Voir Plus de Projets ({projects.length})
              </Link>
            )}
            <Link to="/projects/new" className="btn-primary">
              + Créer un Nouveau Projet
            </Link>
          </div>
        </div>
      )}

      {/* Empty State - No Projects */}
      {projects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginTop: 'var(--space-6)', padding: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
            Aucun Projet
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
            Commencez par créer votre premier projet pour organiser vos tâches et jalons
          </p>
          <Link to="/projects/new" className="btn-primary">
            Créer un Nouveau Projet
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      {activityEvents.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
            Activité Récente
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {activityEvents.slice(0, 10).map((event) => {
              const project = projects.find((p) => p.id === event.projectId);
              const eventTypeLabel: Record<string, string> = {
                PROJECT_CREATED: '🆕 Projet créé',
                PROJECT_UPDATED: '✏️ Projet modifié',
                MILESTONE_CREATED: '🎯 Jalon créé',
                MILESTONE_COMPLETED: '✅ Jalon terminé',
                TASK_CREATED: '➕ Tâche créée',
                TASK_COMPLETED: '✔️ Tâche terminée',
                TASK_BLOCKED: '🚫 Tâche bloquée',
                NOTE_CREATED: '📝 Note créée',
                DOCUMENT_ADDED: '📎 Document ajouté',
              };
              const label = eventTypeLabel[event.type] || event.type;

              return (
                <div key={event.id} style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>{label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {format(new Date(event.createdAt), "dd MMM 'à' HH:mm", { locale: fr })}
                    </span>
                  </div>
                  {project && (
                    <Link to={`/projects/${project.id}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', textDecoration: 'none' }} className="hover:underline">
                      {project.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
