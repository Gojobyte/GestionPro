// ============================================================================
// CALENDAR PAGE - Timeline & Monthly Calendar for a Project
// ============================================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Project, CalendarEvent } from '../domain/types';
import { projectRepo } from '../storage/repos/projectRepo';
import { milestoneRepo } from '../storage/repos/milestoneRepo';
import { taskRepo } from '../storage/repos/taskRepo';
import { getProjectCalendarEvents, groupEventsByDate } from '../domain/calendar';

type ViewMode = 'TIMELINE' | 'CALENDAR';

export default function CalendarPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('TIMELINE');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    if (!projectId) return;

    try {
      const [projectData, milestonesData, tasksData] = await Promise.all([
        projectRepo.getById(projectId),
        milestoneRepo.getByProject(projectId),
        taskRepo.getByProject(projectId),
      ]);

      if (!projectData) {
        setLoading(false);
        return;
      }

      setProject(projectData);

      const calendarEvents = getProjectCalendarEvents(projectData, milestonesData, tasksData);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Calendrier & Timeline</h1>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Calendrier & Timeline</h1>
        <p className="text-red-600">Projet non trouvé.</p>
      </div>
    );
  }

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const eventsGrouped = groupEventsByDate(events);

  const getColorClass = (color?: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-300',
      green: 'bg-green-100 text-green-700 border-green-300',
      red: 'bg-red-100 text-red-700 border-red-300',
      orange: 'bg-orange-100 text-orange-700 border-orange-300',
      gray: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[color || 'gray'] || colors.gray;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendrier & Timeline</h1>
          <p className="text-gray-600">{project.name}</p>
        </div>
        <Link
          to={`/projects/${projectId}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Retour au projet
        </Link>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('TIMELINE')}
          className={`px-4 py-2 rounded ${
            viewMode === 'TIMELINE'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📅 Timeline
        </button>
        <button
          onClick={() => setViewMode('CALENDAR')}
          className={`px-4 py-2 rounded ${
            viewMode === 'CALENDAR'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📆 Calendrier Mensuel
        </button>
      </div>

      {/* Timeline View */}
      {viewMode === 'TIMELINE' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Timeline des Événements</h2>
          {events.length === 0 ? (
            <p className="text-gray-600">Aucun événement avec date.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`border-l-4 pl-4 py-2 ${getColorClass(event.color)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                    </div>
                    <span className="text-xs uppercase px-2 py-1 bg-white rounded">
                      {event.type === 'PROJECT' ? 'Projet' :
                       event.type === 'MILESTONE' ? 'Jalon' : 'Tâche'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'CALENDAR' && (
        <div className="bg-white p-6 rounded-lg shadow">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Mois Précédent
            </button>
            <h2 className="text-xl font-bold">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Mois Suivant →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center font-bold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Days */}
            {daysInMonth.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsGrouped[dateStr] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`border rounded p-2 min-h-24 ${
                    isToday ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${getColorClass(event.color)}`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 3} autres</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
