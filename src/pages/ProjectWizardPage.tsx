// ============================================================================
// PROJECT WIZARD PAGE - 2 Steps
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/id';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import type { Project, Milestone, Task, ProjectPriority } from '../domain/types';

interface ProjectInfo {
  name: string;
  description: string;
  objectives: string[];
  tags: string[];
  startDate: string;
  targetDate: string;
  priority: ProjectPriority;
}

interface MilestoneInput {
  id: string;
  title: string;
  weight: number;
  dueDate: string;
}

interface TaskInput {
  id: string;
  title: string;
  milestoneId: string;
  points: number;
}

export default function ProjectWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Project Info
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: '',
    description: '',
    objectives: [''],
    tags: [],
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    priority: 'MED',
  });

  // Step 2: Milestones & Tasks
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: generateId(), title: 'GENERAL', weight: 10, dueDate: '' },
  ]);

  const [tasks, setTasks] = useState<TaskInput[]>([
    { id: generateId(), title: '', milestoneId: '', points: 1 },
  ]);

  const handleNextStep = () => {
    if (step === 1 && projectInfo.name.trim()) {
      setStep(2);
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const addObjective = () => {
    setProjectInfo((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ''],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setProjectInfo((prev) => {
      const newObjectives = [...prev.objectives];
      newObjectives[index] = value;
      return { ...prev, objectives: newObjectives };
    });
  };

  const removeObjective = (index: number) => {
    setProjectInfo((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { id: generateId(), title: '', weight: 10, dueDate: '' },
    ]);
  };

  const updateMilestone = (id: string, field: keyof MilestoneInput, value: any) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    // Remove tasks linked to this milestone
    setTasks((prev) => prev.filter((t) => t.milestoneId !== id));
  };

  const addTask = () => {
    setTasks((prev) => [
      ...prev,
      { id: generateId(), title: '', milestoneId: '', points: 1 },
    ]);
  };

  const updateTask = (id: string, field: keyof TaskInput, value: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const now = new Date().toISOString();
      const projectId = generateId();

      // Create project
      const project: Project = {
        id: projectId,
        name: projectInfo.name.trim(),
        description: projectInfo.description.trim(),
        status: 'ACTIVE',
        priority: projectInfo.priority,
        type: 'CODE', // Default type for old wizard
        tags: projectInfo.tags,
        objectives: projectInfo.objectives.filter((o) => o.trim()),
        startDate: projectInfo.startDate || undefined,
        targetDate: projectInfo.targetDate || undefined,
        createdAt: now,
        updatedAt: now,
      };

      await projectRepo.create(project);

      // Create milestones
      const validMilestones = milestones.filter((m) => m.title.trim());
      const milestoneIdMap: Record<string, string> = {};

      for (const m of validMilestones) {
        const realMilestoneId = generateId();
        milestoneIdMap[m.id] = realMilestoneId;

        const milestone: Milestone = {
          id: realMilestoneId,
          projectId,
          title: m.title.trim(),
          status: 'TODO',
          weight: m.weight,
          dueDate: m.dueDate || undefined,
          createdAt: now,
          updatedAt: now,
        };

        await milestoneRepo.create(milestone);
      }

      // Create tasks
      const validTasks = tasks.filter((t) => t.title.trim());
      const generalMilestone = validMilestones.find((m) => m.title === 'GENERAL');
      const generalMilestoneRealId = generalMilestone
        ? milestoneIdMap[generalMilestone.id]
        : undefined;

      for (let i = 0; i < validTasks.length; i++) {
        const t = validTasks[i];
        const realMilestoneId = t.milestoneId
          ? milestoneIdMap[t.milestoneId]
          : generalMilestoneRealId;

        const task: Task = {
          id: generateId(),
          projectId,
          milestoneId: realMilestoneId,
          title: t.title.trim(),
          status: 'TODO',
          points: t.points,
          order: i,
          createdAt: now,
          updatedAt: now,
        };

        await taskRepo.create(task);
      }

      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="section-title">Créer un Nouveau Projet</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Étape {step} sur 2
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div className={`progress-bar-fill ${step >= 1 ? 'success' : ''}`} style={{ width: step >= 1 ? '100%' : '0%' }} />
        </div>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div className={`progress-bar-fill ${step >= 2 ? 'success' : ''}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
        </div>
      </div>

      {step === 1 && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: 'var(--space-5)' }}>
            Étape 1 : Informations du Projet
          </h2>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Nom du Projet *</label>
            <input
              type="text"
              className="input-field"
              value={projectInfo.name}
              onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
              placeholder="Mon Super Projet"
            />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              value={projectInfo.description}
              onChange={(e) =>
                setProjectInfo({ ...projectInfo, description: e.target.value })
              }
              placeholder="Courte description (1-2 lignes)"
            />
          </div>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Objectifs</label>
            {projectInfo.objectives.map((obj, index) => (
              <div key={index} className="flex" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1 }}
                  value={obj}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  placeholder="Objectif..."
                />
                {projectInfo.objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="btn-danger btn-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addObjective}
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0'
              }}
              className="hover:underline"
            >
              + Ajouter un Objectif
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Priorité</label>
              <select
                className="input-field"
                value={projectInfo.priority}
                onChange={(e) =>
                  setProjectInfo({
                    ...projectInfo,
                    priority: e.target.value as ProjectPriority,
                  })
                }
              >
                <option value="LOW">Basse</option>
                <option value="MED">Moyenne</option>
                <option value="HIGH">Haute</option>
              </select>
            </div>

            <div>
              <label className="label">Date de Début</label>
              <input
                type="date"
                className="input-field"
                value={projectInfo.startDate}
                onChange={(e) =>
                  setProjectInfo({ ...projectInfo, startDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="label">Date Cible</label>
              <input
                type="date"
                className="input-field"
                value={projectInfo.targetDate}
                onChange={(e) =>
                  setProjectInfo({ ...projectInfo, targetDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!projectInfo.name.trim()}
              className="btn-primary"
            >
              Suivant : Jalons & Tâches
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: 'var(--space-5)' }}>
            Étape 2 : Jalons & Tâches
          </h2>

          {/* Milestones */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
              Jalons (3-6 recommandés)
            </h3>
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1 }}
                  value={m.title}
                  onChange={(e) => updateMilestone(m.id, 'title', e.target.value)}
                  placeholder="Titre du jalon"
                />
                <input
                  type="number"
                  className="input-field"
                  style={{ width: '100px' }}
                  value={m.weight}
                  onChange={(e) =>
                    updateMilestone(m.id, 'weight', parseInt(e.target.value) || 1)
                  }
                  placeholder="Poids"
                  min="1"
                />
                <input
                  type="date"
                  className="input-field"
                  style={{ width: '150px' }}
                  value={m.dueDate}
                  onChange={(e) => updateMilestone(m.id, 'dueDate', e.target.value)}
                />
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    className="btn-danger btn-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMilestone}
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0'
              }}
              className="hover:underline"
            >
              + Ajouter un Jalon
            </button>
          </div>

          {/* Tasks */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
              Tâches (min 5 recommandées)
            </h3>
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1 }}
                  value={t.title}
                  onChange={(e) => updateTask(t.id, 'title', e.target.value)}
                  placeholder="Titre de la tâche"
                />
                <select
                  className="input-field"
                  style={{ width: '200px' }}
                  value={t.milestoneId}
                  onChange={(e) => updateTask(t.id, 'milestoneId', e.target.value)}
                >
                  <option value="">Aucun jalon</option>
                  {milestones
                    .filter((m) => m.title.trim())
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  className="input-field"
                  style={{ width: '80px' }}
                  value={t.points}
                  onChange={(e) =>
                    updateTask(t.id, 'points', parseInt(e.target.value) || 1)
                  }
                  placeholder="Pts"
                  min="1"
                />
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="btn-danger btn-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTask}
              style={{
                color: 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0'
              }}
              className="hover:underline"
            >
              + Ajouter une Tâche
            </button>
          </div>

          <div className="flex justify-end" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button
              type="button"
              onClick={handlePreviousStep}
              className="btn-secondary"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-success"
            >
              {loading ? 'Création...' : 'Créer le Projet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
