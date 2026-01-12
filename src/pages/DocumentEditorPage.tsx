// ============================================================================
// DOCUMENT EDITOR PAGE - Rich Text Editor with Design System
// ============================================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import type { Project, Milestone, Task, ActivityEvent } from '../domain/types';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { activityEventRepo } from '../storage/repos/activityEventRepo';
import { generateWordDocument, type DocType } from '../domain/docgenWord';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DOC_TYPES: Array<{ type: DocType; label: string; icon: string }> = [
  { type: 'README', label: 'README', icon: '📖' },
  { type: 'SPEC', label: 'Spec Technique', icon: '🔧' },
  { type: 'ARCHITECTURE', label: 'Architecture', icon: '🏗️' },
  { type: 'RUNBOOK', label: 'Runbook', icon: '📋' },
  { type: 'CHANGELOG', label: 'Changelog', icon: '📅' },
  { type: 'ADR', label: 'ADR', icon: '📝' },
];

export default function DocumentEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectForTemplate, setSelectedProjectForTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState<DocType>('README');
  const [documentTitle, setDocumentTitle] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TiptapLink,
      Image,
      TextStyle,
      Color,
    ],
    content: '<p>Commencez à écrire...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none',
        style: 'min-height: 600px; padding: 24px;',
      },
    },
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    if (selectedProjectForTemplate && editor) {
      loadProjectDataAndGenerateTemplate(selectedProjectForTemplate);
    }
  }, [selectedDocType, selectedProjectForTemplate, editor]);

  async function loadData() {
    try {
      const projectsData = await projectRepo.getAll();
      setProjects(projectsData);

      if (projectId) {
        const projectData = await projectRepo.getById(projectId);
        if (projectData) {
          setSelectedProjectForTemplate(projectId);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjectDataAndGenerateTemplate(selectedProjectId: string) {
    if (!selectedProjectId || !editor) return;

    try {
      const [projectData, milestonesData, tasksData, eventsData] = await Promise.all([
        projectRepo.getById(selectedProjectId),
        milestoneRepo.getByProject(selectedProjectId),
        taskRepo.getByProject(selectedProjectId),
        activityEventRepo.getByProject(selectedProjectId, 50),
      ]);

      if (!projectData) return;

      generateTemplateContent(projectData, milestonesData, tasksData, eventsData);
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  }

  function generateTemplateContent(
    projectData: Project,
    milestonesData: Milestone[],
    tasksData: Task[],
    eventsData: ActivityEvent[]
  ) {
    if (!editor) return;

    let html = '';
    let title = '';

    switch (selectedDocType) {
      case 'README':
        title = `${projectData.name} - README`;
        html = `
          <h1>${projectData.name}</h1>
          <h2>Description</h2>
          <p>${projectData.description || 'Description du projet...'}</p>
          <h2>Statut du projet</h2>
          <p><strong>Statut:</strong> ${projectData.status}</p>
          <p><strong>Priorité:</strong> ${projectData.priority}</p>
          ${projectData.startDate ? `<p><strong>Date de début:</strong> ${projectData.startDate}</p>` : ''}
          ${projectData.targetDate ? `<p><strong>Date de fin:</strong> ${projectData.targetDate}</p>` : ''}
          <h2>Objectifs</h2>
          <ul>
            ${(projectData.objectives || []).map(obj => `<li>${obj}</li>`).join('')}
          </ul>
          <h2>Jalons</h2>
          <ol>
            ${milestonesData.map(m => `<li><strong>${m.title}</strong> (poids: ${m.weight})</li>`).join('')}
          </ol>
          <h2>Progression des tâches</h2>
          <p>Total: ${tasksData.length} tâches</p>
          <ul>
            <li>Complétées: ${tasksData.filter(t => t.status === 'DONE').length}</li>
            <li>En cours: ${tasksData.filter(t => t.status === 'DOING').length}</li>
            <li>À faire: ${tasksData.filter(t => t.status === 'TODO').length}</li>
          </ul>
        `;
        break;

      case 'SPEC':
        title = `${projectData.name} - Spécification Technique`;
        html = `
          <h1>Spécification Technique - ${projectData.name}</h1>
          <h2>Vue d'ensemble</h2>
          <p>${projectData.description || 'Description du projet...'}</p>
          <h2>Objectifs du projet</h2>
          <ul>
            ${(projectData.objectives || []).map(obj => `<li>${obj}</li>`).join('')}
          </ul>
          <h2>Exigences fonctionnelles</h2>
          ${milestonesData.map((m, i) => `
            <h3>${i + 1}. ${m.title}</h3>
            <p><strong>Poids:</strong> ${m.weight}</p>
            ${m.dueDate ? `<p><strong>Date limite:</strong> ${m.dueDate}</p>` : ''}
            <p><strong>Tâches associées:</strong> ${tasksData.filter(t => t.milestoneId === m.id).length}</p>
          `).join('')}
          <h2>Exigences techniques</h2>
          <p><em>À compléter selon les besoins du projet...</em></p>
        `;
        break;

      case 'ARCHITECTURE':
        title = `${projectData.name} - Architecture`;
        html = `
          <h1>Architecture - ${projectData.name}</h1>
          <h2>Vue d'ensemble du système</h2>
          <p>${projectData.description || 'Description du projet...'}</p>
          <h2>Composants principaux</h2>
          ${milestonesData.map((m, i) => {
            const milestoneTasks = tasksData.filter(t => t.milestoneId === m.id);
            return `
              <h3>${i + 1}. ${m.title}</h3>
              <p><strong>Poids:</strong> ${m.weight}</p>
              <p><strong>Nombre de tâches:</strong> ${milestoneTasks.length}</p>
              <p><strong>Responsabilités:</strong></p>
              <ul>
                ${milestoneTasks.slice(0, 5).map(t => `<li>${t.title}</li>`).join('')}
                ${milestoneTasks.length > 5 ? `<li><em>... et ${milestoneTasks.length - 5} autres tâches</em></li>` : ''}
              </ul>
            `;
          }).join('')}
        `;
        break;

      case 'RUNBOOK':
        const inProgress = tasksData.filter(t => t.status === 'DOING');
        const todo = tasksData.filter(t => t.status === 'TODO');
        const blocked = tasksData.filter(t => t.status === 'BLOCKED');
        title = `${projectData.name} - Runbook`;
        html = `
          <h1>Runbook - ${projectData.name}</h1>
          <h2>Guide opérationnel quotidien</h2>
          <p>Ce document décrit les tâches courantes et les procédures opérationnelles pour le projet ${projectData.name}.</p>
          <h2>Tâches en cours</h2>
          ${inProgress.length > 0 ? `
            <ul>
              ${inProgress.map(t => {
                const milestone = milestonesData.find(m => m.id === t.milestoneId);
                return `<li><strong>${t.title}</strong> (${t.points} pts) - Jalon: ${milestone?.title || 'GENERAL'}</li>`;
              }).join('')}
            </ul>
          ` : '<p><em>Aucune tâche en cours actuellement.</em></p>'}
          <h2>Prochaines tâches</h2>
          <ul>
            ${todo.slice(0, 10).map(t => {
              const milestone = milestonesData.find(m => m.id === t.milestoneId);
              return `<li>${t.title} (${t.points} pts) - Jalon: ${milestone?.title || 'GENERAL'}</li>`;
            }).join('')}
          </ul>
          ${blocked.length > 0 ? `
            <h2>🚨 Bloqueurs</h2>
            <ul>
              ${blocked.map(t => `<li><strong>${t.title}</strong><br/><em>Raison: ${t.blockedReason || 'Non spécifiée'}</em></li>`).join('')}
            </ul>
          ` : ''}
        `;
        break;

      case 'CHANGELOG':
        const completed = tasksData.filter(t => t.status === 'DONE');
        title = `${projectData.name} - Changelog`;
        html = `
          <h1>Changelog - ${projectData.name}</h1>
          <h2>Historique des modifications</h2>
          <p><strong>Dernière mise à jour:</strong> ${format(new Date(projectData.updatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
          <h2>Tâches complétées</h2>
          ${completed.length > 0 ? `
            <ul>
              ${completed.map(t => {
                const milestone = milestonesData.find(m => m.id === t.milestoneId);
                return `<li>✅ <strong>${t.title}</strong> - Jalon: ${milestone?.title || 'GENERAL'} • ${t.points} points • ${format(new Date(t.updatedAt), 'dd/MM/yyyy', { locale: fr })}</li>`;
              }).join('')}
            </ul>
          ` : '<p><em>Aucune tâche complétée pour le moment.</em></p>'}
          <h2>Activité récente</h2>
          <ul>
            ${eventsData.slice(0, 20).map(e =>
              `<li><strong>${format(new Date(e.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</strong> - ${e.description || e.type}</li>`
            ).join('')}
          </ul>
        `;
        break;

      case 'ADR':
        title = `${projectData.name} - ADR`;
        html = `
          <h1>Architecture Decision Records - ${projectData.name}</h1>
          <h2>ADR-001: Structure par jalons pondérés</h2>
          <p><strong>Date:</strong> ${format(new Date(projectData.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
          <p><strong>Statut:</strong> Accepté</p>
          <h3>Contexte</h3>
          <p>Besoin d'une méthode robuste pour suivre la progression du projet à travers plusieurs flux de travail avec différents niveaux d'importance.</p>
          <h3>Décision</h3>
          <p>Implémenter un système de jalons pondérés où chaque jalon a un poids (≥ 1) et la progression globale = somme pondérée de la progression des jalons.</p>
          <h3>Conséquences</h3>
          <ul>
            <li>✅ Visibilité claire de la progression</li>
            <li>✅ Organisation flexible du travail</li>
            <li>⚠️ Nécessite une planification initiale des jalons</li>
          </ul>
          <h2>Métriques du projet</h2>
          <ul>
            <li><strong>Jalons totaux:</strong> ${milestonesData.length}</li>
            <li><strong>Poids total:</strong> ${milestonesData.reduce((sum, m) => sum + m.weight, 0)}</li>
            <li><strong>Tâches totales:</strong> ${tasksData.length}</li>
            <li><strong>Points totaux:</strong> ${tasksData.reduce((sum, t) => sum + t.points, 0)}</li>
          </ul>
        `;
        break;
    }

    setDocumentTitle(title);
    editor.commands.setContent(html);
  }

  async function handleDownloadWord() {
    if (!selectedProjectForTemplate) {
      alert('Veuillez sélectionner un projet pour générer le document Word.');
      return;
    }

    const projectData = projects.find(p => p.id === selectedProjectForTemplate);
    if (!projectData) return;

    try {
      const [milestonesData, tasksData, eventsData] = await Promise.all([
        milestoneRepo.getByProject(selectedProjectForTemplate),
        taskRepo.getByProject(selectedProjectForTemplate),
        activityEventRepo.getByProject(selectedProjectForTemplate, 50),
      ]);

      await generateWordDocument(selectedDocType, projectData, milestonesData, tasksData, eventsData);
      alert('Document Word généré avec succès !');
    } catch (error) {
      console.error('Failed to generate Word document:', error);
      alert('Échec de la génération du document');
    }
  }

  function handleSave() {
    setLastSaved(new Date());
    alert('Document sauvegardé !');
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="section">
        <h1 className="section-title">Éditeur de documents</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="section-title">Éditeur de Documents</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Créez et éditez vos documents avec des modèles pré-configurés
          </p>
        </div>
        {projectId && (
          <Link
            to={`/projects/${projectId}/docs`}
            className="btn-secondary"
          >
            ← Retour
          </Link>
        )}
      </div>

      {/* Document Title and Actions */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between" style={{ gap: 'var(--space-4)' }}>
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <label className="label">Titre du Document</label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="input-field"
              placeholder="Mon Document..."
            />
          </div>
          <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
            {lastSaved && (
              <span className="badge badge-gray" style={{ alignSelf: 'center' }}>
                Sauvegardé à {format(lastSaved, 'HH:mm')}
              </span>
            )}
            <button
              onClick={handleSave}
              className="btn-primary"
            >
              💾 Sauvegarder
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary"
            >
              🖨️ Imprimer
            </button>
            <button
              onClick={handleDownloadWord}
              className="btn-success"
            >
              📥 Word
            </button>
          </div>
        </div>
      </div>

      {/* Template Configuration */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>
          Configuration du Modèle
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
          {/* Project Selector */}
          <div>
            <label className="label">Projet Source</label>
            <select
              value={selectedProjectForTemplate}
              onChange={(e) => setSelectedProjectForTemplate(e.target.value)}
              className="input-field"
            >
              <option value="">Sélectionner un projet</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>
              Sélectionnez un projet pour charger ses données dans le modèle
            </p>
          </div>

          {/* Document Type Selector */}
          <div>
            <label className="label">Type de Document</label>
            <div className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
              {DOC_TYPES.map((dt) => (
                <button
                  key={dt.type}
                  onClick={() => setSelectedDocType(dt.type)}
                  className={selectedDocType === dt.type ? 'badge badge-primary' : 'badge badge-gray'}
                  style={{
                    cursor: 'pointer',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  {dt.icon} {dt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
          <div className="flex flex-wrap items-center" style={{ gap: 'var(--space-2)' }}>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="btn-secondary btn-sm"
              style={{
                fontWeight: editor.isActive('bold') ? 'bold' : 'normal',
                backgroundColor: editor.isActive('bold') ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Gras"
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="btn-secondary btn-sm"
              style={{
                fontStyle: 'italic',
                backgroundColor: editor.isActive('italic') ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Italique"
            >
              I
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="btn-secondary btn-sm"
              style={{
                textDecoration: 'underline',
                backgroundColor: editor.isActive('underline') ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Souligné"
            >
              U
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className="btn-secondary btn-sm"
              style={{
                textDecoration: 'line-through',
                backgroundColor: editor.isActive('strike') ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Barré"
            >
              S
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 var(--space-1)' }} />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="btn-secondary btn-sm"
              style={{
                fontWeight: 'bold',
                backgroundColor: editor.isActive('heading', { level: 1 }) ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Titre 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="btn-secondary btn-sm"
              style={{
                fontWeight: 'bold',
                backgroundColor: editor.isActive('heading', { level: 2 }) ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Titre 2"
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className="btn-secondary btn-sm"
              style={{
                fontWeight: 'bold',
                backgroundColor: editor.isActive('heading', { level: 3 }) ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Titre 3"
            >
              H3
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 var(--space-1)' }} />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="btn-secondary btn-sm"
              style={{
                backgroundColor: editor.isActive('bulletList') ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Liste à puces"
            >
              • Liste
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="btn-secondary btn-sm"
              style={{
                backgroundColor: editor.isActive('orderedList') ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Liste numérotée"
            >
              1. Liste
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 var(--space-1)' }} />
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className="btn-secondary btn-sm"
              style={{
                backgroundColor: editor.isActive({ textAlign: 'left' }) ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Aligner à gauche"
            >
              ⬅
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className="btn-secondary btn-sm"
              style={{
                backgroundColor: editor.isActive({ textAlign: 'center' }) ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Centrer"
            >
              ↔
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className="btn-secondary btn-sm"
              style={{
                backgroundColor: editor.isActive({ textAlign: 'right' }) ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Aligner à droite"
            >
              ➡
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className="btn-secondary btn-sm"
              style={{
                backgroundColor: editor.isActive({ textAlign: 'justify' }) ? 'var(--color-primary-light)' : 'transparent',
              }}
              title="Justifier"
            >
              ⬌
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <style>{`
          .ProseMirror {
            min-height: 600px;
            padding: 24px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: var(--color-text-primary);
          }
          .ProseMirror h1 {
            font-size: 28pt;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 12px;
            color: var(--color-text-primary);
          }
          .ProseMirror h2 {
            font-size: 18pt;
            font-weight: bold;
            margin-top: 16px;
            margin-bottom: 8px;
            color: var(--color-text-primary);
          }
          .ProseMirror h3 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 12px;
            margin-bottom: 6px;
            color: var(--color-text-primary);
          }
          .ProseMirror p {
            margin-bottom: 10px;
          }
          .ProseMirror ul, .ProseMirror ol {
            padding-left: 24px;
            margin-bottom: 10px;
          }
          .ProseMirror:focus {
            outline: none;
          }
          @media print {
            .ProseMirror {
              padding: 0 !important;
            }
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: 'var(--space-6)', backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>
          💡 Conseils d'utilisation
        </h4>
        <ul style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', paddingLeft: 'var(--space-5)', lineHeight: '1.8' }}>
          <li>Sélectionnez un projet pour charger automatiquement ses données dans le modèle</li>
          <li>Choisissez un type de document pour obtenir un modèle pré-formaté</li>
          <li>Utilisez la barre d'outils pour formater votre texte (gras, italique, listes, etc.)</li>
          <li>Cliquez sur "Sauvegarder" pour enregistrer vos modifications localement</li>
          <li>Utilisez "📥 Word" pour télécharger une version .docx du document</li>
        </ul>
      </div>
    </div>
  );
}
