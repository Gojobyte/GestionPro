// ============================================================================
// PROJECTS PAGE - Vue améliorée et moderne des projets
// ============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project, ProjectStatus, ProjectType, Milestone, Task } from '../domain/types';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { calculateProjectProgressStats } from '../domain/progress';

interface ProjectWithStats {
  project: Project;
  progressPercent: number;
  health: 'ON_TRACK' | 'AT_RISK' | 'LATE';
  tasksDone: number;
  tasksTotal: number;
  blockedCount: number;
}

type SortBy = 'recent' | 'name' | 'progress';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ProjectType>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      let projectsResult: Project[];
      if (filter === 'ALL') {
        projectsResult = await projectRepo.getAll();
      } else {
        projectsResult = filter === 'ACTIVE'
          ? await projectRepo.getActive()
          : await projectRepo.getArchived();
      }

      const [milestonesData, tasksData] = await Promise.all([
        milestoneRepo.getAll(),
        taskRepo.getAll(),
      ]);

      setProjects(projectsResult);
      setMilestones(milestonesData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Archiver ce projet ?')) {
      await projectRepo.archive(id);
      loadData();
    }
  };

  const handleUnarchive = async (id: string) => {
    if (confirm('Désarchiver ce projet ?')) {
      await projectRepo.unarchive(id);
      loadData();
    }
  };

  const projectsWithStats: ProjectWithStats[] = projects.map((project) => {
    const projectMilestones = milestones.filter((m) => m.projectId === project.id);
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const stats = calculateProjectProgressStats(project, projectMilestones, projectTasks);

    return {
      project,
      progressPercent: stats.progressPercent,
      health: stats.health,
      tasksDone: stats.tasksDone,
      tasksTotal: stats.tasksTotal,
      blockedCount: stats.blockedCount,
    };
  });

  const typeFilteredProjects = projectsWithStats.filter((item) => {
    if (typeFilter === 'ALL') return true;
    const projectType = item.project.type || 'CODE';
    return projectType === typeFilter;
  });

  const filteredProjects = typeFilteredProjects.filter((item) =>
    item.project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.project.name.localeCompare(b.project.name);
      case 'progress':
        return b.progressPercent - a.progressPercent;
      case 'recent':
      default:
        return new Date(b.project.createdAt).getTime() - new Date(a.project.createdAt).getTime();
    }
  });

  const codeProjects = projects.filter(p => !p.type || p.type === 'CODE').length;
  const tenderProjects = projects.filter(p => p.type === 'TENDER').length;

  if (loading) {
    return (
      <div className="section">
        <h1 className="section-title">Mes Projets</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="section-title">Mes Projets</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {projects.length} projet{projects.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Link to="/projects/new" className="btn-primary">
          + Nouveau Projet
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="label">Recherche</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Statut</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="ALL">Tous</option>
              <option value="ACTIVE">Actifs</option>
              <option value="ARCHIVED">Archivés</option>
            </select>
          </div>

          <div>
            <label className="label">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="ALL">Tous les types</option>
              <option value="CODE">Dev ({codeProjects})</option>
              <option value="TENDER">Offres ({tenderProjects})</option>
            </select>
          </div>

          <div>
            <label className="label">Trier par</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="input-field"
            >
              <option value="recent">Plus récents</option>
              <option value="name">Nom A-Z</option>
              <option value="progress">Progression</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {sortedProjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
            {searchQuery ? 'Aucun projet trouvé' : 'Aucun projet'}
          </p>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
            {searchQuery ? 'Essayez de modifier votre recherche' : 'Commencez par créer votre premier projet'}
          </p>
          {!searchQuery && (
            <Link to="/projects/new" className="btn-primary">
              Créer un Projet
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {sortedProjects.map(({ project, progressPercent, health, tasksDone, tasksTotal, blockedCount }) => (
            <div key={project.id} className="card">
              <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <Link
                      to={`/projects/${project.id}`}
                      style={{
                        fontSize: 'var(--text-xl)',
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
                    {health === 'LATE' && (
                      <span className="badge badge-error">En retard</span>
                    )}
                    {health === 'AT_RISK' && (
                      <span className="badge badge-warning">À risque</span>
                    )}
                    {blockedCount > 0 && (
                      <span className="badge badge-error">{blockedCount} bloqué{blockedCount > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
                    {project.description || 'Aucune description'}
                  </p>

                  <div className="flex items-center" style={{ gap: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    <span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{tasksDone}</strong> / {tasksTotal} tâches
                    </span>
                    <span>
                      Priorité: <strong style={{
                        color: project.priority === 'HIGH' ? 'var(--color-error)' :
                               project.priority === 'MED' ? 'var(--color-warning)' :
                               'var(--color-success)'
                      }}>
                        {project.priority}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center" style={{ gap: 'var(--space-5)' }}>
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                      {progressPercent}%
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${
                          health === 'ON_TRACK' ? 'success' :
                          health === 'AT_RISK' ? 'warning' :
                          'error'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex" style={{ gap: 'var(--space-2)' }}>
                    <Link to={`/projects/${project.id}`} className="btn-secondary btn-sm">
                      Voir
                    </Link>
                    {project.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleArchive(project.id)}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-secondary)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        className="hover:underline"
                      >
                        Archiver
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnarchive(project.id)}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-success)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        className="hover:underline"
                      >
                        Désarchiver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
