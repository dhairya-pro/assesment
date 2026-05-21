import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, Map, Star, TrendingUp, Plus, FileText, Plane, Clock, Sparkles
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { itineraryAPI } from '../api/itinerary';
import { format } from '../utils/dateUtils.js';

const SkeletonCard = () => (
  <div className="card" style={{ padding: '1.25rem' }}>
    <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: '0.75rem' }} />
    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '0.5rem' }} />
    <div className="skeleton" style={{ height: 14, width: '40%' }} />
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          itineraryAPI.getStats(),
          itineraryAPI.getAll({ page: 1, limit: 5 }),
        ]);
        setStats(statsRes.data.data);
        setRecentItineraries(listRes.data.data || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Itineraries',
      value: stats?.totalItineraries ?? '—',
      icon: Map,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    },
    {
      label: 'Favorites',
      value: stats?.favorites ?? '—',
      icon: Star,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    },
    {
      label: 'Documents Uploaded',
      value: user?.stats?.totalDocuments ?? '—',
      icon: FileText,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
    },
    {
      label: 'Top Destination',
      value: stats?.topDestinations?.[0]?._id || 'None yet',
      icon: Plane,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
      isText: true,
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: 260, padding: '2rem', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Link to="/upload" className="btn-primary">
              <Plus size={18} />
              New Itinerary
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="stat-card"
                style={{ background: stat.gradient, border: `1px solid ${stat.color}20` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={20} color={stat.color} />
                  </div>
                </div>
                <div style={{
                  fontSize: stat.isText ? '1rem' : '1.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: 'white',
                  marginBottom: '0.25rem',
                }}>
                  {loading ? <div className="skeleton" style={{ height: 28, width: 80 }} /> : stat.value}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Upload CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            marginBottom: '2rem',
            padding: '2rem',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Sparkles size={22} color="#818cf8" />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
                Create a New AI Itinerary
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Upload your travel documents and let AI generate your perfect travel plan in seconds.
            </p>
          </div>
          <Link to="/upload" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Upload size={18} />
            Upload Documents
          </Link>
        </motion.div>

        {/* Recent Itineraries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
              Recent Itineraries
            </h2>
            <Link to="/history" style={{ color: '#818cf8', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : recentItineraries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--surface-card)',
              borderRadius: 16,
              border: '1px dashed rgba(255,255,255,0.1)',
            }}>
              <Map size={48} color="#1e293b" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#475569', fontWeight: 600, marginBottom: '0.5rem' }}>No itineraries yet</h3>
              <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Upload travel documents to create your first AI itinerary
              </p>
              <Link to="/upload" className="btn-primary">
                <Plus size={16} /> Create First Itinerary
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {recentItineraries.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/itinerary/${item._id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-interactive" style={{ padding: '1.25rem', position: 'relative' }}>
                      {/* Status badge */}
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                        <span className={`badge badge-${item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'warning'}`}>
                          {item.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Plane size={18} color="#818cf8" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.15rem' }}>
                            {item.title}
                          </h3>
                          <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {item.destination || 'Unknown destination'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.75rem' }}>
                        <Clock size={12} />
                        {format(new Date(item.createdAt), 'MMM d, yyyy')}
                        {item.isFavorite && (
                          <span style={{ marginLeft: 'auto' }}>
                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
