// ============================================================================
// LAYOUT - Professional with Sidebar + Top Navbar (MSI/Apple/Notion inspired)
// ============================================================================

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/documents', label: 'Documents', icon: '📄' },
    { path: '/notes', label: 'Notes', icon: '📝' },
    { path: '/editor', label: 'Éditeur', icon: '✏️' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)' }}>
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '240px',
          background: 'var(--color-bg-sidebar)',
          borderRight: '1px solid var(--color-border-light)',
          zIndex: 100,
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: 'var(--space-6) var(--space-5)' }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'var(--gradient-primary)' }}
            >
              D
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Dev Organizer
              </h1>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Professional
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive(link.path) ? 'var(--color-primary-light)' : 'transparent',
                  color: isActive(link.path) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                <span style={{ fontSize: '1.125rem' }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* New Project Button */}
          <div style={{ marginTop: 'var(--space-8)' }}>
            <Link
              to="/projects/new"
              className="btn-primary w-full"
              onClick={() => setSidebarOpen(false)}
            >
              <span>+ New Project</span>
            </Link>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 'var(--space-5)',
            borderTop: '1px solid var(--color-border-light)',
            background: 'var(--color-bg-sidebar)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              All systems operational
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content with Top Navbar */}
      <div className="main-content flex flex-col" style={{ marginLeft: '240px', minHeight: '100vh', width: 'calc(100% - 240px)' }}>
        {/* Top Navbar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 200,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--color-border-light)',
            padding: 'var(--space-4) var(--space-6)',
          }}
        >
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden btn-ghost p-2"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb or Title */}
            <div className="hidden md:flex items-center gap-2">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {location.pathname === '/' ? 'Dashboard' :
                 location.pathname.startsWith('/projects') ? 'Projects' :
                 location.pathname.startsWith('/documents') ? 'Documents' :
                 location.pathname.startsWith('/notes') ? 'Notes' :
                 location.pathname.startsWith('/editor') ? 'Éditeur' : 'Dev Organizer'}
              </h2>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="btn-ghost">
                <span>🔔</span>
              </button>
              <button className="btn-ghost">
                <span>⚙️</span>
              </button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                style={{ background: 'var(--gradient-primary)' }}
              >
                U
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: 'var(--space-8) var(--space-6)', flex: '1 0 auto' }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer
          style={{
            marginTop: 'auto',
            padding: 'var(--space-6) var(--space-6)',
            borderTop: '1px solid var(--color-border-light)',
            background: 'var(--color-bg-surface)',
            flexShrink: 0,
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              © 2024 Dev Organizer - Professional Project Management
            </p>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              <Link to="/" className="hover:underline">About</Link>
              <Link to="/" className="hover:underline">Help</Link>
              <Link to="/" className="hover:underline">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 50,
          }}
          className="md:hidden"
        />
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 200ms ease-out;
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
