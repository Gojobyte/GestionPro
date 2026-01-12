// ============================================================================
// DOCUMENTS LIBRARY PAGE
// ============================================================================

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DocumentMeta, Project } from '../domain/types';
import { documentRepo } from '../storage/repos/documentRepo';
import { projectRepo } from '../storage/repos/projectRepo';
import { fileStore } from '../storage/fileStore';

type FilterMode = 'ALL' | 'GLOBAL' | 'PROJECT';
type StorageFilter = 'ALL' | 'EMBEDDED' | 'WORKSPACE';

export default function DocumentsLibraryPage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [storageFilter, setStorageFilter] = useState<StorageFilter>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [workspaceLinked, setWorkspaceLinked] = useState(false);
  const [storageStats, setStorageStats] = useState({
    embeddedCount: 0,
    embeddedSizeMb: 0,
    workspaceCount: 0,
    workspaceSizeMb: 0,
    totalCount: 0,
    totalSizeMb: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProjectId, setUploadProjectId] = useState<string>('');
  const [uploadTags, setUploadTags] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [docsData, projectsData, stats] = await Promise.all([
        documentRepo.getAll(),
        projectRepo.getAll(),
        fileStore.getStorageStats(),
      ]);

      setDocuments(docsData);
      setProjects(projectsData);
      setStorageStats(stats);
      setWorkspaceLinked(fileStore.isWorkspaceLinked());
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const tags = uploadTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await fileStore.uploadFile(file, uploadProjectId || undefined, tags);
      await loadData();
      setShowUploadModal(false);
      setUploadProjectId('');
      setUploadTags('');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Échec de l\'upload du fichier. Vérifiez les permissions workspace si fichier > 20MB.');
    }
  }

  async function handleDownload(doc: DocumentMeta) {
    try {
      const blob = await fileStore.downloadFile(doc.id);
      if (!blob) {
        alert('Impossible de télécharger le fichier');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Échec du téléchargement');
    }
  }

  async function handleDelete(doc: DocumentMeta) {
    if (!confirm(`Supprimer le document "${doc.title}" ?`)) return;

    try {
      await fileStore.deleteFile(doc.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Échec de la suppression');
    }
  }

  async function handleLinkWorkspace() {
    try {
      const granted = await fileStore.requestWorkspaceAccess();
      if (granted) {
        setWorkspaceLinked(true);
        alert('Workspace lié avec succès !');
      } else {
        alert('Accès refusé au workspace');
      }
    } catch (error) {
      console.error('Failed to link workspace:', error);
      alert('Échec de la liaison workspace');
    }
  }

  // Filter documents
  let filteredDocs = documents;

  if (filterMode === 'GLOBAL') {
    filteredDocs = filteredDocs.filter((d) => !d.projectId || d.projectId === '');
  } else if (filterMode === 'PROJECT' && selectedProjectId) {
    filteredDocs = filteredDocs.filter((d) => d.projectId === selectedProjectId);
  }

  if (storageFilter !== 'ALL') {
    filteredDocs = filteredDocs.filter((d) => d.storageMode === storageFilter);
  }

  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredDocs = filteredDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(lowerQuery) ||
        d.fileName.toLowerCase().includes(lowerQuery) ||
        d.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  if (loading) {
    return (
      <div className="section">
        <h1 className="section-title">Bibliothèque de Documents</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="section-title">Bibliothèque de Documents</h1>
        <div className="flex" style={{ gap: 'var(--space-3)' }}>
          {!workspaceLinked && (
            <button
              onClick={handleLinkWorkspace}
              className="btn-secondary"
              style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
            >
              🔗 Lier Workspace
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            + Upload Fichier
            </button>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Documents</div>
          <div className="stat-card-value" style={{ color: 'var(--color-primary)' }}>{storageStats.totalCount}</div>
          <div className="stat-card-sublabel">{storageStats.totalSizeMb.toFixed(2)} MB</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Mode Embedded</div>
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>{storageStats.embeddedCount}</div>
          <div className="stat-card-sublabel">{storageStats.embeddedSizeMb.toFixed(2)} MB</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Mode Workspace</div>
          <div className="stat-card-value" style={{ color: '#9333EA' }}>{storageStats.workspaceCount}</div>
          <div className="stat-card-sublabel">{storageStats.workspaceSizeMb.toFixed(2)} MB</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Workspace Status</div>
          <div
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'bold',
              color: workspaceLinked ? 'var(--color-success)' : 'var(--color-text-tertiary)'
            }}
          >
            {workspaceLinked ? '✓ Lié' : '✗ Non lié'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-5)' }}>
          {/* Filter Mode */}
          <div>
            <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
              Filtre Projet
            </label>
            <select
              value={filterMode}
              onChange={(e) => {
                setFilterMode(e.target.value as FilterMode);
                setSelectedProjectId('');
              }}
              className="input-field"
            >
              <option value="ALL">Tous les documents</option>
              <option value="GLOBAL">Documents globaux</option>
              <option value="PROJECT">Par projet</option>
            </select>
          </div>

          {/* Project Selector */}
          {filterMode === 'PROJECT' && (
            <div>
              <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                Projet
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="input-field"
              >
                <option value="">Sélectionner un projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Storage Filter */}
          <div>
            <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
              Mode Stockage
            </label>
            <select
              value={storageFilter}
              onChange={(e) => setStorageFilter(e.target.value as StorageFilter)}
              className="input-field"
            >
              <option value="ALL">Tous les modes</option>
              <option value="EMBEDDED">Embedded seulement</option>
              <option value="WORKSPACE">Workspace seulement</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
              Recherche
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Titre, nom fichier, tags..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Aucun document trouvé.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <tr>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Titre
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Projet
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Tags
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Taille
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Stockage
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Date
                </th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const project = projects.find((p) => p.id === doc.projectId);
                const sizeMb = (doc.sizeBytes / (1024 * 1024)).toFixed(2);

                return (
                  <tr
                    key={doc.id}
                    style={{ borderTop: '1px solid var(--color-border-light)' }}
                    className="hover:bg-gray-50"
                  >
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{doc.title}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{doc.fileName}</div>
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      {project ? (
                        <Link
                          to={`/projects/${project.id}`}
                          style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                          className="hover:underline"
                        >
                          {project.name}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>Global</span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div className="flex flex-wrap" style={{ gap: 'var(--space-1)' }}>
                        {doc.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: 'var(--space-1) var(--space-2)',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              fontSize: 'var(--text-xs)',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {sizeMb} MB
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <span
                        style={{
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: '500',
                          backgroundColor: doc.storageMode === 'EMBEDDED' ? 'var(--color-success-light)' : '#F3E8FF',
                          color: doc.storageMode === 'EMBEDDED' ? 'var(--color-success)' : '#9333EA'
                        }}
                      >
                        {doc.storageMode}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div className="flex" style={{ gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => handleDownload(doc)}
                          style={{
                            color: 'var(--color-primary)',
                            fontSize: 'var(--text-sm)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none'
                          }}
                          className="hover:underline"
                        >
                          ⬇️ Télécharger
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          style={{
                            color: 'var(--color-error)',
                            fontSize: 'var(--text-sm)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'none'
                          }}
                          className="hover:underline"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50 }}
        >
          <div className="card" style={{ maxWidth: '28rem', width: '100%', padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', marginBottom: 'var(--space-5)', color: 'var(--color-text-primary)' }}>
              Upload Fichier
            </h2>

            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                Projet (optionnel)
              </label>
              <select
                value={uploadProjectId}
                onChange={(e) => setUploadProjectId(e.target.value)}
                className="input-field"
              >
                <option value="">Document global</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                Tags (séparés par virgule)
              </label>
              <input
                type="text"
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="spec, design, backend..."
                className="input-field"
              />
            </div>

            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
                Fichier
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="input-field"
              />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-2)' }}>
                Fichiers &lt; 20 MB : Embedded (IndexedDB)
                <br />
                Fichiers ≥ 20 MB : Workspace (nécessite liaison)
              </p>
            </div>

            <div className="flex justify-end" style={{ gap: 'var(--space-3)' }}>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadProjectId('');
                  setUploadTags('');
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
