// ============================================================================
// APP - Root Component
// ============================================================================

import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useEffect, useState } from 'react';
import { initializeDB } from './storage/db';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDB()
      .then(() => {
        setDbReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize DB:', err);
        setError('Failed to initialize database');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
