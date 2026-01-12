// ============================================================================
// MILESTONES & TASKS PAGE - Kanban View
// ============================================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { generateId } from '../utils/id';
import type { Project, Milestone, Task, TaskStatus } from '../domain/types';

export default function MilestonesTasksPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMilestone, setFilterMilestone] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Add task modal
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    milestoneId: '',
    points: 1,
    dueDate: '',
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filterMilestone]);

  const loadData = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const [proj, miles, tsks] = await Promise.all([
        projectRepo.getById(projectId),
        milestoneRepo.getByProject(projectId),
        taskRepo.getByProject(projectId),
      ]);

      if (proj) setProject(proj);
      setMilestones(miles);
      setTasks(tsks);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filterMilestone !== 'ALL') {
      if (filterMilestone === 'NONE') {
        filtered = filtered.filter((t) => !t.milestoneId);
      } else {
        filtered = filtered.filter((t) => t.milestoneId === filterMilestone);
      }
    }

    setFilteredTasks(filtered);
  };

  const handleAddTask = async () => {
    if (!projectId || !newTask.title.trim()) return;

    try {
      const task: Task = {
        id: generateId(),
        projectId,
        milestoneId: newTask.milestoneId || undefined,
        title: newTask.title.trim(),
        status: 'TODO',
        points: newTask.points,
        order: tasks.length,
        dueDate: newTask.dueDate || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await taskRepo.create(task);
      setTasks([...tasks, task]);
      setShowAddTask(false);
      setNewTask({ title: '', milestoneId: '', points: 1, dueDate: '' });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      if (newStatus === 'BLOCKED') {
        const reason = prompt('Raison du blocage:');
        if (!reason) return;
        await taskRepo.updateStatus(taskId, newStatus, reason);
      } else {
        await taskRepo.updateStatus(taskId, newStatus);
      }

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
            : t
        )
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Supprimer cette tâche ?')) return;

    try {
      await taskRepo.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  const getMilestoneName = (milestoneId?: string) => {
    if (!milestoneId) return 'Sans jalon';
    const milestone = milestones.find((m) => m.id === milestoneId);
    return milestone ? milestone.title : 'Unknown';
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 border-gray-300';
      case 'DOING': return 'bg-blue-50 border-blue-300';
      case 'DONE': return 'bg-green-50 border-green-300';
      case 'BLOCKED': return 'bg-red-50 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Projet non trouvé.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <Link to={`/projects/${projectId}`} className="text-blue-600 hover:underline text-sm">
              ← Retour au Dashboard
            </Link>
            <h1 className="text-3xl font-bold mt-2">{project.name} - Tâches</h1>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nouvelle Tâche
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Liste
            </button>
          </div>

          <div className="flex gap-2 items-center flex-1">
            <label className="text-sm font-medium">Jalon:</label>
            <select
              value={filterMilestone}
              onChange={(e) => setFilterMilestone(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="ALL">Tous</option>
              <option value="NONE">Sans jalon</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {filteredTasks.length} tâche(s)
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['TODO', 'DOING', 'DONE', 'BLOCKED'] as TaskStatus[]).map((status) => {
            const statusTasks = getTasksByStatus(status);
            const statusLabels = {
              TODO: 'À Faire',
              DOING: 'En Cours',
              DONE: 'Terminé',
              BLOCKED: 'Bloqué',
            };

            return (
              <div key={status} className="flex flex-col">
                <div className="bg-white rounded-lg shadow mb-2 p-3">
                  <h3 className="font-semibold text-gray-700">
                    {statusLabels[status]} ({statusTasks.length})
                  </h3>
                </div>
                <div className="space-y-3 flex-1">
                  {statusTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white rounded-lg shadow p-4 border-l-4 ${getStatusColor(
                        status
                      )}`}
                    >
                      <h4 className="font-medium mb-2">{task.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {getMilestoneName(task.milestoneId)} • {task.points} pts
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500 mb-2">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {task.blockedReason && (
                        <p className="text-xs text-red-600 mb-2">
                          🚫 {task.blockedReason}
                        </p>
                      )}
                      <div className="flex gap-1 mt-3 flex-wrap">
                        {status !== 'TODO' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'TODO')}
                            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            → TODO
                          </button>
                        )}
                        {status !== 'DOING' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'DOING')}
                            className="text-xs px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
                          >
                            → DOING
                          </button>
                        )}
                        {status !== 'DONE' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'DONE')}
                            className="text-xs px-2 py-1 bg-green-200 rounded hover:bg-green-300"
                          >
                            → DONE
                          </button>
                        )}
                        {status !== 'BLOCKED' && (
                          <button
                            onClick={() => handleStatusChange(task.id, 'BLOCKED')}
                            className="text-xs px-2 py-1 bg-red-200 rounded hover:bg-red-300"
                          >
                            → BLOCK
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Suppr
                        </button>
                      </div>
                    </div>
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      Aucune tâche
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tâche</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jalon</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Points</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.blockedReason && (
                        <p className="text-xs text-red-600 mt-1">🚫 {task.blockedReason}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getMilestoneName(task.milestoneId)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="TODO">TODO</option>
                      <option value="DOING">DOING</option>
                      <option value="DONE">DONE</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm">{task.points}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Aucune tâche trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nouvelle Tâche</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Titre *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Titre de la tâche"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Jalon</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newTask.milestoneId}
                  onChange={(e) => setNewTask({ ...newTask, milestoneId: e.target.value })}
                >
                  <option value="">Sans jalon</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Points</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newTask.points}
                  onChange={(e) =>
                    setNewTask({ ...newTask, points: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
