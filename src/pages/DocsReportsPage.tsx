// ============================================================================
// DOCS & REPORTS PAGE - Document Generation & Project Documentation
// ============================================================================

import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Project } from '../domain/types';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { activityEventRepo } from '../storage/repos/activityEventRepo';
import { generateDocument, getDocumentFilename, type DocType } from '../domain/docgen';
import { generateWordDocument } from '../domain/docgenWord';
import { exportProject, importProject, getBackupFilename } from '../domain/backup';

const DOC_TYPES: Array<{ type: DocType; label: string; description: string }> = [
  { type: 'README', label: 'README', description: 'Project overview with progress and milestones' },
  { type: 'SPEC', label: 'Technical Spec', description: 'Detailed technical specification' },
  { type: 'ARCHITECTURE', label: 'Architecture', description: 'System architecture and component breakdown' },
  { type: 'RUNBOOK', label: 'Runbook', description: 'Operational guide for daily workflow' },
  { type: 'CHANGELOG', label: 'Changelog', description: 'Timeline of changes and activity' },
  { type: 'ADR', label: 'ADR', description: 'Architecture Decision Records' },
];

export default function DocsReportsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocType | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    if (!projectId) return;

    try {
      const projectData = await projectRepo.getById(projectId);
      if (!projectData) {
        setLoading(false);
        return;
      }

      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateDoc(docType: DocType, downloadDirectly = false) {
    if (!project || !projectId) return;

    setGenerating(true);
    setSelectedDocType(docType);

    try {
      const [milestones, tasks, activityEvents] = await Promise.all([
        milestoneRepo.getByProject(projectId),
        taskRepo.getByProject(projectId),
        activityEventRepo.getByProject(projectId, 50),
      ]);

      if (downloadDirectly) {
        // Generate and download Word document directly
        await generateWordDocument(docType, project, milestones, tasks, activityEvents);
        alert('Document Word généré avec succès !');
      } else {
        // Generate preview in Markdown
        const content = generateDocument(docType, project, milestones, tasks, activityEvents);
        setPreviewContent(content);
      }
    } catch (error) {
      console.error('Failed to generate document:', error);
      alert('Échec de la génération du document');
    } finally {
      setGenerating(false);
    }
  }

  function handleDownloadDoc() {
    if (!project || !selectedDocType || !previewContent) return;

    const filename = getDocumentFilename(selectedDocType, project.name);
    const blob = new Blob([previewContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopyToClipboard() {
    if (!previewContent) return;

    navigator.clipboard.writeText(previewContent).then(
      () => alert('Contenu copié dans le presse-papier'),
      () => alert('Échec de la copie')
    );
  }

  async function handleExportBackup() {
    if (!project || !projectId) return;

    setExporting(true);
    try {
      const zipBlob = await exportProject(projectId);
      const filename = getBackupFilename(project.name);

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Backup exporté avec succès !');
    } catch (error) {
      console.error('Failed to export backup:', error);
      alert('Échec de l\'export du backup');
    } finally {
      setExporting(false);
    }
  }

  async function handleImportBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const projectId = await importProject(file);
      alert('Backup importé avec succès !');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to import backup:', error);
      alert(`Échec de l'import: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Documentation & Reports</h1>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Documentation & Reports</h1>
        <p className="text-red-600">Projet non trouvé.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documentation & Reports</h1>
          <p className="text-gray-600">{project.name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/projects/${projectId}/docs/editor`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
          >
            ✏️ Éditeur de documents
          </Link>
          <button
            onClick={handleExportBackup}
            disabled={exporting}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
          >
            {exporting ? 'Export...' : '📦 Export Backup'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
          >
            {importing ? 'Import...' : '📥 Import Backup'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleImportBackup}
            className="hidden"
          />
          <Link
            to={`/projects/${projectId}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Retour au projet
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document Types */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-lg">Types de Documents</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {DOC_TYPES.map((docType) => (
                <div
                  key={docType.type}
                  className={`p-4 ${
                    selectedDocType === docType.type ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{docType.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{docType.description}</div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleGenerateDoc(docType.type, false)}
                      disabled={generating}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                    >
                      📄 Prévisualiser
                    </button>
                    <button
                      onClick={() => handleGenerateDoc(docType.type, true)}
                      disabled={generating}
                      className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:bg-gray-400 font-semibold"
                    >
                      📥 Word (.docx)
                    </button>
                  </div>
                  {generating && selectedDocType === docType.type && (
                    <div className="text-xs text-blue-600 mt-2 text-center">⏳ Génération...</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              💡 Guide d'utilisation
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">📄</span>
                <span><strong>Prévisualiser</strong>: Voir le contenu en Markdown dans le navigateur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">📥</span>
                <span><strong>Word (.docx)</strong>: Télécharger directement un document Word professionnel avec mise en forme complète</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✨</span>
                <span>Les documents Word incluent: hiérarchie des titres, mise en forme riche, styles professionnels</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="md:col-span-2">
          {previewContent ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-bold text-lg">
                  Preview: {DOC_TYPES.find((d) => d.type === selectedDocType)?.label}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    📋 Copier
                  </button>
                  <button
                    onClick={handleDownloadDoc}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ⬇️ Télécharger .md
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                  {previewContent}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-lg mb-2">Sélectionnez un type de document</p>
              <p className="text-sm">
                Choisissez un type de document dans la liste de gauche pour le générer et le prévisualiser
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
