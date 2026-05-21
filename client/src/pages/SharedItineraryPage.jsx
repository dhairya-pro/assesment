import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, MapPin, Calendar, Share2, Download, Clock, CheckSquare, Backpack, DollarSign, AlertCircle, Star } from 'lucide-react';
import { shareAPI } from '../api/itinerary';
import { format } from '../utils/dateUtils.js';
import toast from 'react-hot-toast';

const SharedItineraryPage = () => {
  const { token } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await shareAPI.get(token);
        setItinerary(res.data.data.itinerary);
      } catch (err) {
        setError(err.response?.data?.message || 'Itinerary not found or no longer public');
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b' }}>Loading shared itinerary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
        <AlertCircle size={56} color="#ef4444" />
        <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Itinerary Not Found</h2>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: 400 }}>{error}</p>
        <Link to="/" className="btn-primary">Go to Homepage</Link>
      </div>
    );
  }

  const ai = itinerary?.aiItinerary || {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
      {/* Header Bar */}
      <div style={{
        background: 'var(--surface-card)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plane size={18} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontFamily: 'var(--font-display)' }}>AI Travel Planner</span>
          <span style={{ color: '#475569', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem' }}>
            Shared Itinerary
          </span>
        </div>
        <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Create Free Account
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '2rem',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: '2rem',
          }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
            {itinerary.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {itinerary.destination && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#818cf8' }}>
                <MapPin size={14} /> {itinerary.destination}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569', fontSize: '0.85rem' }}>
              <Clock size={14} /> {format(new Date(itinerary.createdAt), 'MMMM d, yyyy')}
            </span>
            {itinerary.shareViews > 0 && (
              <span style={{ color: '#475569', fontSize: '0.8rem' }}>👁 {itinerary.shareViews} views</span>
            )}
          </div>
          {ai.overview && (
            <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>{ai.overview}</p>
          )}
        </motion.div>

        {/* Day Plans */}
        {ai.dayPlans && ai.dayPlans.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem' }}>
              📅 Day-by-Day Plan
            </h2>
            {ai.dayPlans.map((day, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="day-card"
                style={{ marginBottom: '1rem' }}
              >
                <div className="day-card-header">
                  <span style={{ color: '#818cf8', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                    Day {day.day}
                  </span>
                  <span style={{ color: '#475569', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{day.date}</span>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.25rem' }}>{day.title}</h3>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: '🌅 Morning', items: day.morning },
                      { label: '☀️ Afternoon', items: day.afternoon },
                      { label: '🌙 Evening', items: day.evening },
                    ].filter(s => s.items?.length > 0).map(section => (
                      <div key={section.label}>
                        <p style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>{section.label}</p>
                        {section.items.map((a, j) => (
                          <p key={j} style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>• {a}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Key Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {ai.attractions?.length > 0 && (
            <div className="glass" style={{ padding: '1.25rem' }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>📍 Top Attractions</h3>
              {ai.attractions.slice(0, 5).map((a, i) => (
                <p key={i} style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>• {a}</p>
              ))}
            </div>
          )}

          {ai.packingList?.length > 0 && (
            <div className="glass" style={{ padding: '1.25rem' }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>🎒 Packing Essentials</h3>
              {ai.packingList.slice(0, 6).map((item, i) => (
                <p key={i} style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.3rem' }}>• {item}</p>
              ))}
            </div>
          )}

          {ai.budgetSummary?.total > 0 && (
            <div className="glass" style={{ padding: '1.25rem' }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>💰 Budget Estimate</h3>
              {Object.entries(ai.budgetSummary).filter(([k]) => !['total', 'currency'].includes(k)).slice(0, 5).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{ai.budgetSummary.currency} {val}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>Total</span>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>{ai.budgetSummary.currency} {ai.budgetSummary.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
          borderRadius: 16,
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Plan Your Own Adventure
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Create AI-powered itineraries from your own travel documents for free.
          </p>
          <Link to="/register" className="btn-primary">
            <Star size={16} /> Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedItineraryPage;
