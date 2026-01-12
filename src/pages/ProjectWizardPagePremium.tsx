// ============================================================================
// PROJECT WIZARD PAGE - Professional Design
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/id';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { activityEventRepo } from '../storage/repos/activityEventRepo';
import type { Project, Milestone, Task, ProjectPriority, ProjectType } from '../domain/types';

interface ProjectInfo {
  name: string;
  description: string;
  type: ProjectType;
  objectives: string[];
  tags: string[];
  startDate: string;
  targetDate: string;
  priority: ProjectPriority;

  // TENDER specific
  tenderDeadline?: string;
  tenderBudget?: number;
  tenderClient?: string;
  tenderStatus?: 'DRAFT' | 'SUBMITTED' | 'WON' | 'LOST';

  // CODE specific
  repositoryUrl?: string;
  techStack?: string[];
}

interface MilestoneInput {
  id: string;
  title: string;
  description: string;
  weight: number;
  dueDate: string;
}

interface TaskInput {
  id: string;
  title: string;
  description: string;
  milestoneId: string;
  points: number;
  dueDate: string;
  priority: 'LOW' | 'MED' | 'HIGH';
}

export default function ProjectWizardPagePremium() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basic Info
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: '',
    description: '',
    type: 'CODE',
    objectives: [''],
    tags: [],
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    priority: 'MED',
    techStack: [],
  });

  // Step 2: Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: generateId(), title: 'GENERAL', description: 'Tâches générales et planification', weight: 10, dueDate: '' },
  ]);

  // Step 3: Initial Tasks
  const [tasks, setTasks] = useState<TaskInput[]>([]);

  // Tags management
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !projectInfo.tags.includes(tagInput.trim())) {
      setProjectInfo(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setProjectInfo(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  // Tech Stack management
  const [techInput, setTechInput] = useState('');

  const addTech = () => {
    if (techInput.trim() && !projectInfo.techStack?.includes(techInput.trim())) {
      setProjectInfo(prev => ({
        ...prev,
        techStack: [...(prev.techStack || []), techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setProjectInfo(prev => ({
      ...prev,
      techStack: (prev.techStack || []).filter(t => t !== tech),
    }));
  };

  // Objectives management
  const addObjective = () => {
    setProjectInfo(prev => ({
      ...prev,
      objectives: [...prev.objectives, ''],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setProjectInfo(prev => {
      const newObjectives = [...prev.objectives];
      newObjectives[index] = value;
      return { ...prev, objectives: newObjectives };
    });
  };

  const removeObjective = (index: number) => {
    setProjectInfo(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  // Milestones management
  const addMilestone = () => {
    setMilestones(prev => [
      ...prev,
      { id: generateId(), title: '', description: '', weight: 10, dueDate: '' },
    ]);
  };

  const updateMilestone = (id: string, field: keyof MilestoneInput, value: any) => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    setTasks(prev => prev.filter(t => t.milestoneId !== id));
  };

  // Tasks management
  const addTask = () => {
    setTasks(prev => [
      ...prev,
      { id: generateId(), title: '', description: '', milestoneId: '', points: 1, dueDate: '', priority: 'MED' },
    ]);
  };

  const updateTask = (id: string, field: keyof TaskInput, value: any) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleNext = () => {
    if (currentStep === 1 && !projectInfo.name.trim()) {
      alert('Veuillez entrer un nom de projet');
      return;
    }
    if (currentStep === 1 && !projectInfo.description.trim()) {
      alert('Veuillez entrer une description');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const projectId = generateId();
      const now = new Date().toISOString();

      const validObjectives = projectInfo.objectives.filter(o => o.trim() !== '');

      // Create project
      const project: Project = {
        id: projectId,
        name: projectInfo.name.trim(),
        description: projectInfo.description.trim(),
        status: 'ACTIVE',
        priority: projectInfo.priority,
        type: projectInfo.type,
        objectives: validObjectives,
        tags: projectInfo.tags,
        startDate: projectInfo.startDate || undefined,
        targetDate: projectInfo.targetDate || undefined,

        // TENDER specific fields
        ...(projectInfo.type === 'TENDER' && {
          tenderDeadline: projectInfo.tenderDeadline || undefined,
          tenderBudget: projectInfo.tenderBudget || undefined,
          tenderClient: projectInfo.tenderClient || undefined,
          tenderStatus: projectInfo.tenderStatus || 'DRAFT',
        }),

        // CODE specific fields
        ...(projectInfo.type === 'CODE' && {
          repositoryUrl: projectInfo.repositoryUrl || undefined,
          techStack: projectInfo.techStack || [],
        }),

        createdAt: now,
        updatedAt: now,
      };

      await projectRepo.create(project);

      // Create milestones
      const validMilestones = milestones.filter(m => m.title.trim() !== '');
      for (const milestone of validMilestones) {
        const newMilestone: Milestone = {
          id: milestone.id,
          projectId,
          title: milestone.title.trim(),
          status: 'TODO',
          weight: milestone.weight,
          dueDate: milestone.dueDate || undefined,
          createdAt: now,
          updatedAt: now,
        };
        await milestoneRepo.create(newMilestone);
      }

      // Create tasks
      const validTasks = tasks.filter(t => t.title.trim() !== '');
      for (let i = 0; i < validTasks.length; i++) {
        const task = validTasks[i];
        const newTask: Task = {
          id: task.id,
          projectId,
          milestoneId: task.milestoneId || undefined,
          title: task.title.trim(),
          status: 'TODO',
          points: task.points,
          order: i,
          dueDate: task.dueDate || undefined,
          createdAt: now,
          updatedAt: now,
        };
        await taskRepo.create(newTask);
      }

      // Create activity event
      await activityEventRepo.create({
        id: generateId(),
        projectId,
        type: 'TASK_DONE',
        description: `Projet "${project.name}" créé avec ${validMilestones.length} jalons et ${validTasks.length} tâches`,
        createdAt: now,
        payload: {},
      });

      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Échec de la création du projet. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Informations de Base',
    'Jalons & Objectifs',
    'Tâches Initiales',
    'Révision & Lancement',
  ];

  return (
    <div className="section">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="section-title">Créer un Nouveau Projet</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Étape {currentStep} sur 4 : {stepTitles[currentStep - 1]}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="progress-bar" style={{ flex: 1 }}>
            <div
              className={`progress-bar-fill ${step <= currentStep ? 'success' : ''}`}
              style={{ width: step <= currentStep ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: 'var(--space-5)' }}>
            Étape 1 : Informations de Base
          </h2>

          {/* Project Type */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <label className="label">Type de projet *</label>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProjectInfo(prev => ({ ...prev, type: 'CODE' }))}
                className="card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: projectInfo.type === 'CODE' ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: projectInfo.type === 'CODE' ? 'var(--color-primary-light)' : 'var(--color-bg-primary)',
                }}
              >
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>💻</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                  Développement
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Projet de développement logiciel
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProjectInfo(prev => ({ ...prev, type: 'TENDER' }))}
                className="card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: projectInfo.type === 'TENDER' ? 'var(--color-success)' : 'var(--color-border)',
                  backgroundColor: projectInfo.type === 'TENDER' ? 'var(--color-success-light)' : 'var(--color-bg-primary)',
                }}
              >
                <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>📋</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                  Appel d'offres
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  Réponse à un appel d'offres
                </div>
              </button>
            </div>
          </div>

          {/* Project Name */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Nom du Projet *</label>
            <input
              type="text"
              className="input-field"
              value={projectInfo.name}
              onChange={(e) => setProjectInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex: Refonte Plateforme E-commerce"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Description *</label>
            <textarea
              className="input-field"
              rows={5}
              value={projectInfo.description}
              onChange={(e) => setProjectInfo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez les objectifs, le contexte et les résultats attendus..."
            />
          </div>

          {/* Objectives */}
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
                    ×
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

          {/* Priority */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Priorité</label>
            <div className="grid md:grid-cols-3 gap-3">
              {(['LOW', 'MED', 'HIGH'] as const).map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setProjectInfo(prev => ({ ...prev, priority }))}
                  className={projectInfo.priority === priority ? 'btn-primary' : 'btn-secondary'}
                >
                  {priority === 'LOW' ? 'Basse' : priority === 'MED' ? 'Moyenne' : 'Haute'}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4" style={{ marginBottom: 'var(--space-4)' }}>
            <div>
              <label className="label">Date de début</label>
              <input
                type="date"
                className="input-field"
                value={projectInfo.startDate}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="label">Date cible</label>
              <input
                type="date"
                className="input-field"
                value={projectInfo.targetDate}
                onChange={(e) => setProjectInfo(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>
          </div>

          {/* CODE specific fields */}
          {projectInfo.type === 'CODE' && (
            <>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">URL du Dépôt (optionnel)</label>
                <input
                  type="text"
                  className="input-field"
                  value={projectInfo.repositoryUrl || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, repositoryUrl: e.target.value }))}
                  placeholder="https://github.com/..."
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Stack Technique</label>
                <div className="flex" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1 }}
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                    placeholder="ex: React, Node.js, PostgreSQL..."
                  />
                  <button type="button" onClick={addTech} className="btn-primary">
                    Ajouter
                  </button>
                </div>
                {projectInfo.techStack && projectInfo.techStack.length > 0 && (
                  <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    {projectInfo.techStack.map(tech => (
                      <span key={tech} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => removeTech(tech)}>
                        {tech} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TENDER specific fields */}
          {projectInfo.type === 'TENDER' && (
            <>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Client</label>
                <input
                  type="text"
                  className="input-field"
                  value={projectInfo.tenderClient || ''}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, tenderClient: e.target.value }))}
                  placeholder="Nom du client"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4" style={{ marginBottom: 'var(--space-4)' }}>
                <div>
                  <label className="label">Date limite</label>
                  <input
                    type="date"
                    className="input-field"
                    value={projectInfo.tenderDeadline || ''}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, tenderDeadline: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label">Budget (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={projectInfo.tenderBudget || ''}
                    onChange={(e) => setProjectInfo(prev => ({ ...prev, tenderBudget: parseFloat(e.target.value) || undefined }))}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Statut</label>
                <select
                  className="input-field"
                  value={projectInfo.tenderStatus || 'DRAFT'}
                  onChange={(e) => setProjectInfo(prev => ({ ...prev, tenderStatus: e.target.value as any }))}
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="SUBMITTED">Soumis</option>
                  <option value="WON">Gagné</option>
                  <option value="LOST">Perdu</option>
                </select>
              </div>
            </>
          )}

          {/* Tags */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="label">Tags</label>
            <div className="flex" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <input
                type="text"
                className="input-field"
                style={{ flex: 1 }}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag..."
              />
              <button type="button" onClick={addTag} className="btn-primary">
                Ajouter
              </button>
            </div>
            {projectInfo.tags.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                {projectInfo.tags.map(tag => (
                  <span key={tag} className="badge badge-gray" style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)}>
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">
              Annuler
            </button>
            <button type="button" onClick={handleNext} className="btn-primary">
              Suivant : Jalons
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Milestones */}
      {currentStep === 2 && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: 'var(--space-5)' }}>
            Étape 2 : Jalons & Objectifs
          </h2>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
            Définissez les jalons majeurs de votre projet (3-6 recommandés)
          </p>

          {milestones.map((m) => (
            <div key={m.id} className="card" style={{ marginBottom: 'var(--space-4)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Titre du jalon *</label>
                <input
                  type="text"
                  className="input-field"
                  value={m.title}
                  onChange={(e) => updateMilestone(m.id, 'title', e.target.value)}
                  placeholder="ex: Phase de Conception"
                />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Description</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={m.description}
                  onChange={(e) => updateMilestone(m.id, 'description', e.target.value)}
                  placeholder="Décrivez ce jalon..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Poids</label>
                  <input
                    type="number"
                    className="input-field"
                    value={m.weight}
                    onChange={(e) => updateMilestone(m.id, 'weight', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>

                <div>
                  <label className="label">Date limite</label>
                  <input
                    type="date"
                    className="input-field"
                    value={m.dueDate}
                    onChange={(e) => updateMilestone(m.id, 'dueDate', e.target.value)}
                  />
                </div>
              </div>

              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="btn-danger btn-sm"
                  style={{ marginTop: 'var(--space-3)' }}
                >
                  Supprimer ce jalon
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addMilestone}
            className="btn-secondary"
            style={{ marginBottom: 'var(--space-5)' }}
          >
            + Ajouter un Jalon
          </button>

          <div className="flex justify-end" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="button" onClick={handlePrevious} className="btn-secondary">
              Précédent
            </button>
            <button type="button" onClick={handleNext} className="btn-primary">
              Suivant : Tâches
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Tasks */}
      {currentStep === 3 && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: 'var(--space-5)' }}>
            Étape 3 : Tâches Initiales (optionnel)
          </h2>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
            Ajoutez quelques tâches initiales pour démarrer (vous pourrez en ajouter plus tard)
          </p>

          {tasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                Aucune tâche ajoutée. Vous pouvez passer à l'étape suivante ou ajouter des tâches maintenant.
              </p>
            </div>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="card" style={{ marginBottom: 'var(--space-4)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="label">Titre de la tâche *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={t.title}
                    onChange={(e) => updateTask(t.id, 'title', e.target.value)}
                    placeholder="ex: Créer le schéma de base de données"
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="label">Description</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={t.description}
                    onChange={(e) => updateTask(t.id, 'description', e.target.value)}
                    placeholder="Décrivez cette tâche..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4" style={{ marginBottom: 'var(--space-3)' }}>
                  <div>
                    <label className="label">Jalon</label>
                    <select
                      className="input-field"
                      value={t.milestoneId}
                      onChange={(e) => updateTask(t.id, 'milestoneId', e.target.value)}
                    >
                      <option value="">Aucun jalon</option>
                      {milestones.filter(m => m.title.trim()).map(m => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Points</label>
                    <input
                      type="number"
                      className="input-field"
                      value={t.points}
                      onChange={(e) => updateTask(t.id, 'points', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="label">Priorité</label>
                    <select
                      className="input-field"
                      value={t.priority}
                      onChange={(e) => updateTask(t.id, 'priority', e.target.value as any)}
                    >
                      <option value="LOW">Basse</option>
                      <option value="MED">Moyenne</option>
                      <option value="HIGH">Haute</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="label">Date limite</label>
                  <input
                    type="date"
                    className="input-field"
                    value={t.dueDate}
                    onChange={(e) => updateTask(t.id, 'dueDate', e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeTask(t.id)}
                  className="btn-danger btn-sm"
                >
                  Supprimer cette tâche
                </button>
              </div>
            ))
          )}

          <button
            type="button"
            onClick={addTask}
            className="btn-secondary"
            style={{ marginBottom: 'var(--space-5)' }}
          >
            + Ajouter une Tâche
          </button>

          <div className="flex justify-end" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="button" onClick={handlePrevious} className="btn-secondary">
              Précédent
            </button>
            <button type="button" onClick={handleNext} className="btn-primary">
              Suivant : Révision
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 4 && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: '600', marginBottom: 'var(--space-5)' }}>
            Étape 4 : Révision & Lancement
          </h2>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>
            Vérifiez les informations avant de créer votre projet
          </p>

          {/* Project Summary */}
          <div className="card" style={{ backgroundColor: 'var(--color-bg-secondary)', marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
              Informations du Projet
            </h3>

            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Nom</div>
                <div style={{ fontWeight: '600' }}>{projectInfo.name}</div>
              </div>

              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Type</div>
                <span className={`badge ${projectInfo.type === 'TENDER' ? 'badge-success' : 'badge-primary'}`}>
                  {projectInfo.type === 'TENDER' ? '📋 Appel d\'offres' : '💻 Développement'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Description</div>
                <div>{projectInfo.description}</div>
              </div>

              {projectInfo.objectives.filter(o => o.trim()).length > 0 && (
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Objectifs</div>
                  <ul style={{ marginLeft: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
                    {projectInfo.objectives.filter(o => o.trim()).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Priorité</div>
                <span className={`badge ${
                  projectInfo.priority === 'HIGH' ? 'badge-error' :
                  projectInfo.priority === 'MED' ? 'badge-warning' : 'badge-success'
                }`}>
                  {projectInfo.priority === 'HIGH' ? 'Haute' : projectInfo.priority === 'MED' ? 'Moyenne' : 'Basse'}
                </span>
              </div>

              {projectInfo.tags.length > 0 && (
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Tags</div>
                  <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                    {projectInfo.tags.map(tag => (
                      <span key={tag} className="badge badge-gray">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {projectInfo.type === 'CODE' && projectInfo.techStack && projectInfo.techStack.length > 0 && (
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Stack Technique</div>
                  <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                    {projectInfo.techStack.map(tech => (
                      <span key={tech} className="badge badge-primary">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {projectInfo.type === 'TENDER' && projectInfo.tenderClient && (
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Client</div>
                  <div>{projectInfo.tenderClient}</div>
                </div>
              )}
            </div>
          </div>

          {/* Milestones Summary */}
          <div className="card" style={{ backgroundColor: 'var(--color-bg-secondary)', marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
              Jalons ({milestones.filter(m => m.title.trim()).length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {milestones.filter(m => m.title.trim()).map(m => (
                <div key={m.id} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '600' }}>{m.title}</div>
                  {m.description && (
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                      {m.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Summary */}
          {tasks.filter(t => t.title.trim()).length > 0 && (
            <div className="card" style={{ backgroundColor: 'var(--color-bg-secondary)', marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
                Tâches Initiales ({tasks.filter(t => t.title.trim()).length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {tasks.filter(t => t.title.trim()).map(t => (
                  <div key={t.id} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: '600' }}>{t.title}</div>
                    {t.description && (
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                        {t.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <button type="button" onClick={handlePrevious} className="btn-secondary">
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
