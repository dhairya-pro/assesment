import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, Star, Trash2, Plane, MapPin, Clock,
  SortAsc, History, Plus
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { itineraryAPI } from '../api/itinerary';
import { format } from '../utils/dateUtils.js';
import toast from 'react-hot-toast';

const HistoryPage = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchItineraries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itineraryAPI.getAll({
        page,
        limit: 12,
        search,
        favorite: filterFav,
        sortBy,
        sortOrder: 'desc',
      });
      setItineraries(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterFav, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchItineraries, 300);
    return () => clearTimeout(timer);
  }, [fetchItineraries]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this itinerary?')) return;
    setDeleting(id);
    try {
      await itineraryAPI.delete(id);
      setItineraries((prev) => prev.filter((i) => i._id !== id));
      toast.success('Itinerary deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleFav = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await itineraryAPI.toggleFavorite(id);
      setItineraries((prev) =>
        prev.map((i) => i._id === id ? { ...i, isFavorite: !i.isFavorite } : i)
      );
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const statusColor = (status) => {
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'error';
    return 'warning';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: 260, padding: '2rem' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white' }}>
              My Itineraries
            </h1>
            <Link to="/upload" className="btn-primary">
              <Plus size={16} /> New Itinerary
            </Link>
          </div>
          <p style={{ color: '#64748b' }}>All your AI-generated travel plans in one place</p>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              type="text"
              placeholder="Search itineraries..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Favorite filter */}
          <button
            onClick={() => { setFilterFav(!filterFav); setPage(1); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 12,
              border: `1px solid ${filterFav ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`,
              background: filterFav ? 'rgba(245,158,11,0.1)' : 'transparent',
              color: filterFav ? '#fbbf24' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <Star size={16} fill={filterFav ? '#fbbf24' : 'none'} />
            Favorites
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: 150 }}
          >
            <option value="createdAt">Newest First</option>
            <option value="title">Name A-Z</option>
            <option value="destination">Destination</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <div className="skeleton" style={{ height: 24, width: '70%', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: 16, width: '40%' }} />
              </div>
            ))}
          </div>
        ) : itineraries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'var(--surface-card)',
              borderRadius: 20,
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <History size={56} color="#1e293b" style={{ marginBottom: '1.25rem' }} />
            <h3 style={{ color: '#475569', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {search || filterFav ? 'No itineraries found' : 'No itineraries yet'}
            </h3>
            <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              {search || filterFav ? 'Try adjusting your filters' : 'Create your first AI travel itinerary'}
            </p>
            {!search && !filterFav && (
              <Link to="/upload" className="btn-primary">
                <Plus size={16} /> Create First Itinerary
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {itineraries.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/itinerary/${item._id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-interactive" style={{ padding: '1.25rem', height: '100%' }}>
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Plane size={20} color="#818cf8" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button
                            onClick={(e) => handleToggleFav(item._id, e)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: item.isFavorite ? '#f59e0b' : '#475569' }}
                          >
                            <Star size={16} fill={item.isFavorite ? '#f59e0b' : 'none'} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item._id, e)}
                            disabled={deleting === item._id}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#475569' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        {item.title}
                      </h3>

                      {item.destination && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#818cf8', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                          <MapPin size={12} />
                          {item.destination}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontSize: '0.75rem' }}>
                          <Clock size={12} />
                          {format(new Date(item.createdAt), 'MMM d, yyyy')}
                        </div>
                        <span className={`badge badge-${statusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: `1px solid ${p === page ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      background: p === page ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: p === page ? '#818cf8' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: p === page ? 700 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
