// ============================================================================
// FILE STORE - Embedded + Workspace Storage Management
// ============================================================================

import { generateId } from '../utils/id';
import { documentRepo } from './repos/documentRepo';
import { embeddedFileRepo } from './repos/embeddedFileRepo';
import type { DocumentMeta, EmbeddedFile } from '../domain/types';

const EMBED_LIMIT_MB = 20;

/**
 * Upload a file and determine storage mode
 */
export async function uploadFile(
  file: File,
  projectId?: string,
  tags: string[] = []
): Promise<DocumentMeta> {
  const fileSizeBytes = file.size;
  const fileSizeMb = fileSizeBytes / (1024 * 1024);

  // Determine storage mode
  const storageMode = fileSizeMb < EMBED_LIMIT_MB ? 'EMBEDDED' : 'WORKSPACE';

  const docMeta: DocumentMeta = {
    id: generateId(),
    projectId: projectId || '',
    title: file.name,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: fileSizeBytes,
    tags,
    storageMode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (storageMode === 'EMBEDDED') {
    // Store in IndexedDB
    const embeddedKey = `embedded-${docMeta.id}`;
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    const embeddedFile: EmbeddedFile = {
      key: embeddedKey,
      blob,
      sizeBytes: fileSizeBytes,
    };

    await embeddedFileRepo.store(embeddedFile);
    docMeta.embeddedKey = embeddedKey;
  } else {
    // Store in File System (Workspace mode)
    const workspaceFileName = await saveToWorkspace(file, docMeta.id);
    docMeta.workspaceFileName = workspaceFileName;
  }

  await documentRepo.create(docMeta);
  return docMeta;
}

/**
 * Download/retrieve a file
 */
export async function downloadFile(docId: string): Promise<Blob | null> {
  const docMeta = await documentRepo.getById(docId);
  if (!docMeta) return null;

  if (docMeta.storageMode === 'EMBEDDED' && docMeta.embeddedKey) {
    const embeddedFile = await embeddedFileRepo.getByKey(docMeta.embeddedKey);
    return embeddedFile?.blob || null;
  } else if (docMeta.storageMode === 'WORKSPACE' && docMeta.workspaceFileName) {
    return await loadFromWorkspace(docMeta.workspaceFileName);
  }

  return null;
}

/**
 * Delete a file (from both metadata and storage)
 */
export async function deleteFile(docId: string): Promise<void> {
  const docMeta = await documentRepo.getById(docId);
  if (!docMeta) return;

  // Delete from storage
  if (docMeta.storageMode === 'EMBEDDED' && docMeta.embeddedKey) {
    await embeddedFileRepo.delete(docMeta.embeddedKey);
  } else if (docMeta.storageMode === 'WORKSPACE' && docMeta.workspaceFileName) {
    await deleteFromWorkspace(docMeta.workspaceFileName);
  }

  // Delete metadata
  await documentRepo.delete(docId);
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  embeddedCount: number;
  embeddedSizeMb: number;
  workspaceCount: number;
  workspaceSizeMb: number;
  totalCount: number;
  totalSizeMb: number;
}> {
  const allDocs = await documentRepo.getAll();
  const embeddedDocs = allDocs.filter((d) => d.storageMode === 'EMBEDDED');
  const workspaceDocs = allDocs.filter((d) => d.storageMode === 'WORKSPACE');

  const embeddedSizeBytes = embeddedDocs.reduce((sum, d) => sum + d.sizeBytes, 0);
  const workspaceSizeBytes = workspaceDocs.reduce((sum, d) => sum + d.sizeBytes, 0);

  return {
    embeddedCount: embeddedDocs.length,
    embeddedSizeMb: embeddedSizeBytes / (1024 * 1024),
    workspaceCount: workspaceDocs.length,
    workspaceSizeMb: workspaceSizeBytes / (1024 * 1024),
    totalCount: allDocs.length,
    totalSizeMb: (embeddedSizeBytes + workspaceSizeBytes) / (1024 * 1024),
  };
}

// ============================================================================
// WORKSPACE FILE SYSTEM OPERATIONS (File System Access API)
// ============================================================================

let workspaceDirectoryHandle: FileSystemDirectoryHandle | null = null;

/**
 * Request workspace directory access (File System Access API)
 */
export async function requestWorkspaceAccess(): Promise<boolean> {
  if (!('showDirectoryPicker' in window)) {
    console.error('File System Access API not supported');
    return false;
  }

  try {
    workspaceDirectoryHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
    });
    return true;
  } catch (error) {
    console.error('Failed to access workspace directory:', error);
    return false;
  }
}

/**
 * Check if workspace is linked
 */
export function isWorkspaceLinked(): boolean {
  return workspaceDirectoryHandle !== null;
}

/**
 * Save file to workspace directory
 */
async function saveToWorkspace(file: File, docId: string): Promise<string> {
  if (!workspaceDirectoryHandle) {
    const granted = await requestWorkspaceAccess();
    if (!granted) {
      throw new Error('Workspace access required for large files');
    }
  }

  const fileName = `${docId}-${file.name}`;
  const fileHandle = await workspaceDirectoryHandle!.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(await file.arrayBuffer());
  await writable.close();

  return fileName;
}

/**
 * Load file from workspace directory
 */
async function loadFromWorkspace(fileName: string): Promise<Blob | null> {
  if (!workspaceDirectoryHandle) {
    console.error('Workspace not linked');
    return null;
  }

  try {
    const fileHandle = await workspaceDirectoryHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return file;
  } catch (error) {
    console.error('Failed to load file from workspace:', error);
    return null;
  }
}

/**
 * Delete file from workspace directory
 */
async function deleteFromWorkspace(fileName: string): Promise<void> {
  if (!workspaceDirectoryHandle) {
    console.warn('Workspace not linked, cannot delete file');
    return;
  }

  try {
    await workspaceDirectoryHandle.removeEntry(fileName);
  } catch (error) {
    console.error('Failed to delete file from workspace:', error);
  }
}

export const fileStore = {
  uploadFile,
  downloadFile,
  deleteFile,
  getStorageStats,
  requestWorkspaceAccess,
  isWorkspaceLinked,
  EMBED_LIMIT_MB,
};
