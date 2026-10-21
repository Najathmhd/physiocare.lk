"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('physiocare_admin_token');
    const isValid = token && token !== 'undefined' && token !== 'null';
    if (!isValid && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (isValid) {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  // Fetch clinic settings
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setSettings(d))
      .catch(() => { });
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('physiocare_admin_token');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin/dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard' },
    { href: '/admin/appointments', icon: 'fas fa-calendar-check', label: 'Appointments' },
    { href: '/admin/patients', icon: 'fas fa-users', label: 'Patients' },
    { href: '/admin/staff', icon: 'fas fa-user-md', label: 'Staff' },
    { href: '/admin/services', icon: 'fas fa-stethoscope', label: 'Services' },
    { href: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  if (pathname === '/admin/login') return <>{children}</>;
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2rem', color: '#0b6870' }}></i>
          <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  const clinicName = settings?.clinicName || 'Physio Care';

  return (
    <div className="admin-layout">

      {/* ── TOP BAR ── */}
      <header className="admin-topbar">
        {/* Hamburger (mobile only) */}
        <button
          className="admin-menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        {/* Brand */}
        <Link className="admin-topbar-brand" href="/admin/dashboard">
          <i className="fas fa-heartbeat"></i>
          <span>{clinicName} Admin</span>
        </Link>

        {/* User dropdown */}
        <div className="admin-user-menu" ref={dropdownRef}>
          <button
            className="admin-user-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            <i className="fas fa-user-circle"></i>
            <span className="d-none d-sm-inline">Admin</span>
            <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', opacity: 0.7 }}></i>
          </button>

          {isDropdownOpen && (
            <div className="admin-dropdown">
              <a href="/admin/settings" onClick={() => setIsDropdownOpen(false)}>
                <i className="fas fa-cog"></i> Settings
              </a>
              <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
              <button onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <span>Navigation</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${pathname && (pathname === item.href || pathname.startsWith(item.href + '/')) ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className={item.icon}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '8px 0', background: 'none',
              border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: '0.87rem', fontWeight: 500
            }}
          >
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </button>
          <div style={{ marginTop: '8px', fontSize: '0.73rem', color: 'rgba(255,255,255,0.38)' }}>
            Developed by <span style={{ color: '#5eead4', fontWeight: 600 }}>Najath Mohomed</span>
          </div>
        </div>
      </aside>

      {/* ── OVERLAY (mobile) ── */}
      <div
        className={`admin-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--nav-height))' }}>
        <div className="admin-content" style={{ flex: 1 }}>
          {children}
        </div>
        <footer style={{ padding: '14px 28px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
          <div>© {new Date().getFullYear()} {clinicName}. All rights reserved.</div>
          <div>Developed by <strong style={{ color: '#0b6870' }}>Najath Mohomed</strong></div>
        </footer>
      </main>
    </div>
  );
}