// ============================================================================
// ROUTING CONFIGURATION
// ============================================================================

import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DashboardPage from '../pages/DashboardPage';
import ProjectsPage from '../pages/ProjectsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import ProjectWizardPagePremium from '../pages/ProjectWizardPagePremium';
import MilestonesTasksPage from '../pages/MilestonesTasksPage';
import DocumentsLibraryPage from '../pages/DocumentsLibraryPage';
import NotesSnippetsPage from '../pages/NotesSnippetsPage';
import CalendarPage from '../pages/CalendarPage';
import DocsReportsPage from '../pages/DocsReportsPage';
import WeeklyReportsPage from '../pages/WeeklyReportsPage';
import DocumentEditorPage from '../pages/DocumentEditorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'projects/new',
        element: <ProjectWizardPagePremium />,
      },
      {
        path: 'projects/:projectId',
        element: <ProjectDetailPage />,
      },
      {
        path: 'projects/:projectId/tasks',
        element: <MilestonesTasksPage />,
      },
      {
        path: 'projects/:projectId/calendar',
        element: <CalendarPage />,
      },
      {
        path: 'projects/:projectId/docs',
        element: <DocsReportsPage />,
      },
      {
        path: 'projects/:projectId/docs/editor',
        element: <DocumentEditorPage />,
      },
      {
        path: 'projects/:projectId/reports',
        element: <WeeklyReportsPage />,
      },
      {
        path: 'documents',
        element: <DocumentsLibraryPage />,
      },
      {
        path: 'notes',
        element: <NotesSnippetsPage />,
      },
      {
        path: 'editor',
        element: <DocumentEditorPage />,
      },
    ],
  },
]);
