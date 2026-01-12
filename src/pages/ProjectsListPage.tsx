// ============================================================================
// PROJECTS LIST PAGE
// ============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectRepo } from '../storage/repos/projectRepo';
import type { Project, ProjectStatus } from '../domain/types';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'ALL' | ProjectStatus>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [filter]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      let result: Project[];
      if (filter === 'ALL') {
        result = await projectRepo.getAll();
      } else {
        result = filter === 'ACTIVE'
          ? await projectRepo.getActive()
          : await projectRepo.getArchived();
      }
      setProjects(result.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Archive this project?')) {
      await projectRepo.archive(id);
      loadProjects();
    }
  };

  const handleUnarchive = async (id: string) => {
    if (confirm('Unarchive this project?')) {
      await projectRepo.unarchive(id);
      loadProjects();
    }
  };

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'HIGH': return { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' };
      case 'MED': return { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' };
      case 'LOW': return { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' };
      default: return { backgroundColor: 'var(--color-border-light)', color: 'var(--color-text-secondary)' };
    }
  };

  return (
    <div className="section">
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="section-title">Projects</h1>
        <Link
          to="/projects/new"
          className="btn-primary"
        >
          + New Project
        </Link>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)' }}>
        <button
          onClick={() => setFilter('ALL')}
          className={filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setFilter('ACTIVE')}
          className={filter === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('ARCHIVED')}
          className={filter === 'ARCHIVED' ? 'btn-primary' : 'btn-secondary'}
        >
          Archived
        </button>
      </div>

      {/* Projects List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderBottom: '2px solid var(--color-primary)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-4)' }}>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--color-bg-tertiary)' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>No projects found.</p>
          <Link
            to="/projects/new"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
            className="hover:underline"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {projects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="flex-1">
                  <Link
                    to={`/projects/${project.id}`}
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: '600',
                      color: 'var(--color-primary)',
                      textDecoration: 'none'
                    }}
                    className="hover:underline"
                  >
                    {project.name}
                  </Link>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>
                    {project.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: '500',
                      ...getPriorityColors(project.priority)
                    }}
                  >
                    {project.priority}
                  </span>
                  {project.status === 'ARCHIVED' && (
                    <span
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        backgroundColor: 'var(--color-border-light)',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      Archived
                    </span>
                  )}
                </div>
              </div>

              {project.objectives.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Objectives:
                  </p>
                  <ul className="list-disc list-inside" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                    {project.objectives.slice(0, 3).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                    {project.objectives.length > 3 && (
                      <li style={{ color: 'var(--color-text-tertiary)' }}>
                        + {project.objectives.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {project.tags.length > 0 && (
                <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-5)' }}>
                <div className="flex" style={{ gap: 'var(--space-4)' }}>
                  {project.startDate && (
                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                  )}
                  {project.targetDate && (
                    <span>Target: {new Date(project.targetDate).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex" style={{ gap: 'var(--space-3)' }}>
                  <Link
                    to={`/projects/${project.id}`}
                    style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                    className="hover:underline"
                  >
                    View
                  </Link>
                  {project.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleArchive(project.id)}
                      style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                      className="hover:underline"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnarchive(project.id)}
                      style={{ color: 'var(--color-success)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                      className="hover:underline"
                    >
                      Unarchive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
