import { Link, useNavigate } from 'react-router-dom';
import { Plane, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ transparent = false }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: transparent ? 'transparent' : 'rgba(10, 10, 15, 0.8)',
      backdropFilter: transparent ? 'none' : 'blur(20px)',
      borderBottom: transparent ? 'none' : '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
        }}>
          <Plane size={20} color="white" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.1rem',
          background: 'linear-gradient(135deg, #818cf8, #c4b5fd)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI Travel
        </span>
      </Link>

      {/* Desktop Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="hidden md:flex">
        {!isAuthenticated ? (
          <>
            <Link to="/login" style={{
              textDecoration: 'none',
              color: '#94a3b8',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = 'white'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
              <Sparkles size={16} />
              Get Started Free
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" style={{
              textDecoration: 'none',
              color: '#94a3b8',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              Dashboard
            </Link>
            <Link to="/upload" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
              <Sparkles size={16} />
              New Itinerary
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu toggle */}
      <button
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'none' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
};

export default Navbar;
