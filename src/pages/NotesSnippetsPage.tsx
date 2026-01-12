// ============================================================================
// NOTES & SNIPPETS PAGE
// ============================================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Note, Snippet, Project } from '../domain/types';
import { noteRepo } from '../storage/repos/noteRepo';
import { snippetRepo } from '../storage/repos/snippetRepo';
import { projectRepo } from '../storage/repos/projectRepo';
import { generateId } from '../utils/id';

type TabMode = 'NOTES' | 'SNIPPETS';
type FilterMode = 'ALL' | 'GLOBAL' | 'PROJECT';

export default function NotesSnippetsPage() {
  const [tabMode, setTabMode] = useState<TabMode>('NOTES');
  const [notes, setNotes] = useState<Note[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteProjectId, setNoteProjectId] = useState('');

  // Snippet form state
  const [snippetTitle, setSnippetTitle] = useState('');
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLanguage, setSnippetLanguage] = useState('javascript');
  const [snippetTags, setSnippetTags] = useState('');
  const [snippetProjectId, setSnippetProjectId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [notesData, snippetsData, projectsData] = await Promise.all([
        noteRepo.getAll(),
        snippetRepo.getAll(),
        projectRepo.getAll(),
      ]);

      setNotes(notesData);
      setSnippets(snippetsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  function openNoteModal(note?: Note) {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.contentMd);
      setNoteTags(note.tags.join(', '));
      setNoteProjectId(note.projectId || '');
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
      setNoteProjectId('');
    }
    setShowNoteModal(true);
  }

  function openSnippetModal(snippet?: Snippet) {
    if (snippet) {
      setEditingSnippet(snippet);
      setSnippetTitle(snippet.title);
      setSnippetCode(snippet.code);
      setSnippetLanguage(snippet.language);
      setSnippetTags(snippet.tags.join(', '));
      setSnippetProjectId(snippet.projectId || '');
    } else {
      setEditingSnippet(null);
      setSnippetTitle('');
      setSnippetCode('');
      setSnippetLanguage('javascript');
      setSnippetTags('');
      setSnippetProjectId('');
    }
    setShowSnippetModal(true);
  }

  async function handleSaveNote() {
    if (!noteTitle.trim()) {
      alert('Le titre est requis');
      return;
    }

    const tags = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingNote) {
        await noteRepo.update(editingNote.id, {
          title: noteTitle,
          contentMd: noteContent,
          tags,
          projectId: noteProjectId || '',
        });
      } else {
        const newNote: Note = {
          id: generateId(),
          projectId: noteProjectId || '',
          title: noteTitle,
          contentMd: noteContent,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await noteRepo.create(newNote);
      }

      await loadData();
      setShowNoteModal(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Échec de la sauvegarde');
    }
  }

  async function handleSaveSnippet() {
    if (!snippetTitle.trim()) {
      alert('Le titre est requis');
      return;
    }

    const tags = snippetTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (editingSnippet) {
        await snippetRepo.update(editingSnippet.id, {
          title: snippetTitle,
          code: snippetCode,
          language: snippetLanguage,
          tags,
          projectId: snippetProjectId || '',
        });
      } else {
        const newSnippet: Snippet = {
          id: generateId(),
          projectId: snippetProjectId || '',
          title: snippetTitle,
          code: snippetCode,
          language: snippetLanguage,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await snippetRepo.create(newSnippet);
      }

      await loadData();
      setShowSnippetModal(false);
    } catch (error) {
      console.error('Failed to save snippet:', error);
      alert('Échec de la sauvegarde');
    }
  }

  async function handleDeleteNote(note: Note) {
    if (!confirm(`Supprimer la note "${note.title}" ?`)) return;

    try {
      await noteRepo.delete(note.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Échec de la suppression');
    }
  }

  async function handleDeleteSnippet(snippet: Snippet) {
    if (!confirm(`Supprimer le snippet "${snippet.title}" ?`)) return;

    try {
      await snippetRepo.delete(snippet.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete snippet:', error);
      alert('Échec de la suppression');
    }
  }

  // Filter notes
  let filteredNotes = notes;
  if (filterMode === 'GLOBAL') {
    filteredNotes = filteredNotes.filter((n) => !n.projectId || n.projectId === '');
  } else if (filterMode === 'PROJECT' && selectedProjectId) {
    filteredNotes = filteredNotes.filter((n) => n.projectId === selectedProjectId);
  }
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredNotes = filteredNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(lowerQuery) ||
        n.contentMd.toLowerCase().includes(lowerQuery) ||
        n.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Filter snippets
  let filteredSnippets = snippets;
  if (filterMode === 'GLOBAL') {
    filteredSnippets = filteredSnippets.filter((s) => !s.projectId || s.projectId === '');
  } else if (filterMode === 'PROJECT' && selectedProjectId) {
    filteredSnippets = filteredSnippets.filter((s) => s.projectId === selectedProjectId);
  }
  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    filteredSnippets = filteredSnippets.filter(
      (s) =>
        s.title.toLowerCase().includes(lowerQuery) ||
        s.code.toLowerCase().includes(lowerQuery) ||
        s.language.toLowerCase().includes(lowerQuery) ||
        s.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  if (loading) {
    return (
      <div className="section">
        <h1 className="section-title">Notes & Snippets</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="section-title">Notes & Snippets</h1>
        <button
          onClick={() => (tabMode === 'NOTES' ? openNoteModal() : openSnippetModal())}
          className="btn-primary"
        >
          + {tabMode === 'NOTES' ? 'Nouvelle Note' : 'Nouveau Snippet'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => setTabMode('NOTES')}
          className={tabMode === 'NOTES' ? 'btn-primary' : 'btn-secondary'}
        >
          📝 Notes ({notes.length})
        </button>
        <button
          onClick={() => setTabMode('SNIPPETS')}
          className={tabMode === 'SNIPPETS' ? 'btn-primary' : 'btn-secondary'}
        >
          💻 Snippets ({snippets.length})
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-5)' }}>
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
              <option value="ALL">Tous</option>
              <option value="GLOBAL">Globaux</option>
              <option value="PROJECT">Par projet</option>
            </select>
          </div>

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

          <div>
            <label className="block" style={{ fontSize: 'var(--text-sm)', fontWeight: '500', marginBottom: 'var(--space-2)' }}>
              Recherche
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Titre, contenu, tags..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Notes Tab */}
      {tabMode === 'NOTES' && (
        <div>
          {filteredNotes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <p style={{ color: 'var(--color-text-secondary)' }}>Aucune note trouvée.</p>
            </div>
          ) : (
            <div className="grid-cards-3">
              {filteredNotes.map((note) => {
                const project = projects.find((p) => p.id === note.projectId);
                return (
                  <div key={note.id} className="card">
                    <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                      <h3 style={{ fontWeight: 'bold', fontSize: 'var(--text-lg)', color: 'var(--color-text-primary)' }}>
                        {note.title}
                      </h3>
                      <div className="flex" style={{ gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => openNoteModal(note)}
                          style={{
                            color: 'var(--color-primary)',
                            fontSize: 'var(--text-sm)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note)}
                          style={{
                            color: 'var(--color-error)',
                            fontSize: 'var(--text-sm)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div
                      className="line-clamp-3 whitespace-pre-wrap"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-4)'
                      }}
                    >
                      {note.contentMd}
                    </div>

                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap" style={{ gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
                        {note.tags.map((tag, idx) => (
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
                    )}

                    <div className="flex items-center justify-between" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      {project ? (
                        <Link
                          to={`/projects/${project.id}`}
                          style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                          className="hover:underline"
                        >
                          {project.name}
                        </Link>
                      ) : (
                        <span style={{ fontStyle: 'italic' }}>Global</span>
                      )}
                      <span>{format(new Date(note.updatedAt), 'dd/MM/yyyy', { locale: fr })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Snippets Tab */}
      {tabMode === 'SNIPPETS' && (
        <div>
          {filteredSnippets.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-600">Aucun snippet trouvé.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSnippets.map((snippet) => {
                const project = projects.find((p) => p.id === snippet.projectId);
                return (
                  <div key={snippet.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{snippet.title}</h3>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {snippet.language}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openSnippetModal(snippet)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSnippet(snippet)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-3 max-h-48">
                      <code>{snippet.code}</code>
                    </pre>

                    {snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {snippet.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {project ? (
                        <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-800">
                          {project.name}
                        </Link>
                      ) : (
                        <span className="italic">Global</span>
                      )}
                      <span>{format(new Date(snippet.updatedAt), 'dd/MM/yyyy', { locale: fr })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingNote ? 'Modifier Note' : 'Nouvelle Note'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Titre de la note"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Contenu (Markdown)</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
                rows={12}
                placeholder="# Titre\n\nContenu en Markdown..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tags (séparés par virgule)</label>
              <input
                type="text"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="important, todo, idea..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Projet (optionnel)</label>
              <select
                value={noteProjectId}
                onChange={(e) => setNoteProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Note globale</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingNote ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snippet Modal */}
      {showSnippetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingSnippet ? 'Modifier Snippet' : 'Nouveau Snippet'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Titre *</label>
              <input
                type="text"
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Titre du snippet"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Langage</label>
              <select
                value={snippetLanguage}
                onChange={(e) => setSnippetLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="markdown">Markdown</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Code</label>
              <textarea
                value={snippetCode}
                onChange={(e) => setSnippetCode(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
                rows={15}
                placeholder="// Code ici..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tags (séparés par virgule)</label>
              <input
                type="text"
                value={snippetTags}
                onChange={(e) => setSnippetTags(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="utils, api, react..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Projet (optionnel)</label>
              <select
                value={snippetProjectId}
                onChange={(e) => setSnippetProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Snippet global</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSnippetModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSnippet}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingSnippet ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
