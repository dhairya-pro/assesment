import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, History, Star, User, LogOut,
  Map, Plane, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/upload', icon: Upload, label: 'Upload Documents' },
  { path: '/history', icon: History, label: 'My Itineraries' },
  { path: '/history?filter=favorites', icon: Star, label: 'Favorites' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    const basePath = path.split('?')[0];
    return location.pathname === basePath;
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        background: 'var(--surface-card)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
        }}>
          <Plane size={18} color="white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #818cf8, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                AI Travel
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{ textDecoration: 'none', display: 'block', marginBottom: '0.25rem' }}
            >
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem' : '0.75rem 1rem',
                  borderRadius: 12,
                  background: active
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))'
                    : 'transparent',
                  border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon
                  size={20}
                  color={active ? '#818cf8' : '#64748b'}
                  style={{ flexShrink: 0 }}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? '#e2e8f0' : '#64748b',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        {!collapsed && user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            marginBottom: '0.5rem',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '0.75rem',
            padding: collapsed ? '0.75rem' : '0.75rem 1rem',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: 12,
            cursor: 'pointer',
            color: '#ef4444',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <LogOut size={18} />
          {!collapsed && <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          top: '50%',
          right: -12,
          transform: 'translateY(-50%)',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--surface-elevated)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#64748b',
          zIndex: 60,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
