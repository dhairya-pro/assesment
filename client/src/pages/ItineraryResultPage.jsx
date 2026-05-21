import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Hotel, MapPin, UtensilsCrossed, Backpack, DollarSign, AlertCircle,
  CheckSquare, Share2, Download, RefreshCw, Star, ChevronDown, ChevronUp,
  ArrowLeft, Sparkles, Sun, Cloud, Copy, QrCode, MessageCircle, Send, X
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { itineraryAPI, shareAPI } from '../api/itinerary';
import { format } from '../utils/dateUtils.js';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Section = ({ title, icon: Icon, color, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      className="glass"
      style={{ marginBottom: '1rem', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={18} color={color} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div style={{ padding: '1.25rem' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ChatBot = ({ itineraryId, destination }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi! I'm your travel assistant for your trip to ${destination || 'your destination'}. Ask me anything about your itinerary! 🌍` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await itineraryAPI.chat(itineraryId, q);
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I could not process your question. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(99,102,241,0.5)',
          zIndex: 200,
        }}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '5rem',
              right: '2rem',
              width: 350,
              height: 450,
              background: 'var(--surface-elevated)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              zIndex: 200,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Sparkles size={16} color="#818cf8" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>AI Travel Assistant</span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.06)',
                    color: 'white',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '0.3rem', padding: '0.5rem' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.5rem' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your trip..."
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: 'white',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  padding: '0.5rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ItineraryResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  const fetchItinerary = async () => {
    setLoading(true);
    try {
      const res = await itineraryAPI.getOne(id);
      setItinerary(res.data.data.itinerary);
    } catch {
      toast.error('Itinerary not found');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await itineraryAPI.toggleFavorite(id);
      setItinerary((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
      toast.success(itinerary.isFavorite ? 'Removed from favorites' : 'Added to favorites ⭐');
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await shareAPI.create(id);
      setShareUrl(res.data.data.shareUrl);
      setShowShareModal(true);

      // Get QR code
      const qrRes = await shareAPI.getQR(id);
      setQrCode(qrRes.data.data.qrCode);
    } catch {
      toast.error('Failed to create share link');
    } finally {
      setSharing(false);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      toast.loading('Regenerating itinerary...', { id: 'regen', duration: 90000 });
      const res = await itineraryAPI.regenerate(id);
      setItinerary(res.data.data.itinerary);
      toast.success('Itinerary regenerated! ✨', { id: 'regen' });
    } catch {
      toast.error('Regeneration failed', { id: 'regen' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    const toastId = toast.loading('Preparing PDF...');
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 1.5, backgroundColor: '#0a0a0f' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${itinerary.title || 'itinerary'}.pdf`);
      toast.success('PDF downloaded!', { id: toastId });
    } catch {
      toast.error('PDF generation failed', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-bg)' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 260, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b' }}>Loading your itinerary...</p>
        </main>
      </div>
    );
  }

  if (!itinerary) return null;

  const ai = itinerary.aiItinerary || {};

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: 260, padding: '2rem', maxWidth: 960 }}>
        {/* Back + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleToggleFavorite} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <Star size={16} fill={itinerary.isFavorite ? '#f59e0b' : 'none'} color={itinerary.isFavorite ? '#f59e0b' : 'currentColor'} />
              {itinerary.isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            <button onClick={handleShare} disabled={sharing} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <Share2 size={16} /> Share
            </button>
            <button onClick={handleDownloadPDF} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <Download size={16} /> PDF
            </button>
            <button onClick={handleRegenerate} disabled={regenerating} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>
              <RefreshCw size={16} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '1.5rem',
            padding: '2rem',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 50%, rgba(245,158,11,0.05) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="orb orb-primary" style={{ width: 300, height: 300, top: -100, right: -50, opacity: 0.1 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              }}>
                <Plane size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                  {itinerary.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {itinerary.destination && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#818cf8', fontSize: '0.9rem' }}>
                      <MapPin size={14} /> {itinerary.destination}
                    </span>
                  )}
                  <span style={{ color: '#475569', fontSize: '0.8rem' }}>
                    Generated {format(new Date(itinerary.createdAt), 'MMM d, yyyy')}
                  </span>
                  <span className={`badge badge-${itinerary.status === 'completed' ? 'success' : 'error'}`}>
                    {itinerary.status}
                  </span>
                </div>
              </div>
            </div>

            {ai.overview && (
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                {ai.overview}
              </p>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <div ref={printRef}>
          {/* Day Plans */}
          {ai.dayPlans && ai.dayPlans.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>
                📅 Day-by-Day Itinerary
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ai.dayPlans.map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="day-card"
                  >
                    <div className="day-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ color: '#818cf8', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                            Day {day.day}
                          </span>
                          <span style={{ color: '#475569', fontSize: '0.85rem', marginLeft: '0.75rem' }}>{day.date}</span>
                        </div>
                        {day.estimatedCost && (
                          <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                            ~${day.estimatedCost}
                          </span>
                        )}
                      </div>
                      <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.25rem' }}>{day.title}</h3>
                    </div>

                    <div style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
                        {day.morning?.length > 0 && (
                          <div>
                            <p style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>🌅 Morning</p>
                            {day.morning.map((act, j) => (
                              <p key={j} style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>• {act}</p>
                            ))}
                          </div>
                        )}
                        {day.afternoon?.length > 0 && (
                          <div>
                            <p style={{ color: '#6366f1', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>☀️ Afternoon</p>
                            {day.afternoon.map((act, j) => (
                              <p key={j} style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>• {act}</p>
                            ))}
                          </div>
                        )}
                        {day.evening?.length > 0 && (
                          <div>
                            <p style={{ color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>🌙 Evening</p>
                            {day.evening.map((act, j) => (
                              <p key={j} style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>• {act}</p>
                            ))}
                          </div>
                        )}
                      </div>

                      {day.meals && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                          {Object.entries(day.meals).filter(([, v]) => v).map(([meal, food]) => (
                            <span key={meal} style={{
                              padding: '0.2rem 0.6rem',
                              background: 'rgba(16,185,129,0.1)',
                              border: '1px solid rgba(16,185,129,0.15)',
                              borderRadius: 6,
                              fontSize: '0.75rem',
                              color: '#6ee7b7',
                            }}>
                              🍽️ {meal}: {food}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Flight + Hotel Details */}
          {ai.flightDetails && (
            <Section title="Flight Details" icon={Plane} color="#6366f1">
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.9rem' }}>{ai.flightDetails}</p>
            </Section>
          )}

          {ai.accommodationDetails && (
            <Section title="Accommodation" icon={Hotel} color="#10b981">
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.9rem' }}>{ai.accommodationDetails}</p>
            </Section>
          )}

          {/* Attractions */}
          {ai.attractions && ai.attractions.length > 0 && (
            <Section title="Top Attractions" icon={MapPin} color="#f59e0b">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ai.attractions.map((a, i) => (
                  <div key={i} style={{
                    padding: '0.4rem 0.875rem',
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 100,
                    color: '#fbbf24',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}>
                    📍 {a}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Food */}
          {ai.foodRecommendations && ai.foodRecommendations.length > 0 && (
            <Section title="Food & Dining" icon={UtensilsCrossed} color="#ec4899">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ai.foodRecommendations.map((f, i) => (
                  <div key={i} style={{
                    padding: '0.4rem 0.875rem',
                    background: 'rgba(236,72,153,0.08)',
                    border: '1px solid rgba(236,72,153,0.2)',
                    borderRadius: 100,
                    color: '#f9a8d4',
                    fontSize: '0.8rem',
                  }}>
                    🍜 {f}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Packing + Checklist side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {ai.packingList && ai.packingList.length > 0 && (
              <Section title="Packing List" icon={Backpack} color="#8b5cf6" defaultOpen={false}>
                {ai.packingList.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </Section>
            )}

            {ai.travelChecklist && ai.travelChecklist.length > 0 && (
              <Section title="Travel Checklist" icon={CheckSquare} color="#10b981" defaultOpen={false}>
                {ai.travelChecklist.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    <CheckSquare size={14} color="#10b981" />
                    {item}
                  </div>
                ))}
              </Section>
            )}
          </div>

          {/* Budget */}
          {ai.budgetSummary && ai.budgetSummary.total > 0 && (
            <Section title="Budget Estimate" icon={DollarSign} color="#f59e0b" defaultOpen={false}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(ai.budgetSummary)
                  .filter(([k]) => !['total', 'currency'].includes(k))
                  .map(([key, val]) => (
                    <div key={key} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(245,158,11,0.05)', borderRadius: 10 }}>
                      <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>
                        {ai.budgetSummary.currency || '$'}{val}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'capitalize', marginTop: '0.25rem' }}>{key}</div>
                    </div>
                  ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Estimated Total</span>
                <span style={{ color: '#fbbf24', fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {ai.budgetSummary.currency || 'USD'} {ai.budgetSummary.total}
                </span>
              </div>
            </Section>
          )}

          {/* Weather + Emergency */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {ai.weatherTips && (
              <Section title="Weather Tips" icon={Cloud} color="#3b82f6" defaultOpen={false}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.875rem' }}>{ai.weatherTips}</p>
              </Section>
            )}

            {ai.emergencyNotes && (
              <Section title="Emergency Notes" icon={AlertCircle} color="#ef4444" defaultOpen={false}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.875rem' }}>{ai.emergencyNotes}</p>
              </Section>
            )}
          </div>
        </div>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 300,
                padding: '1rem',
              }}
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong"
                style={{ width: '100%', maxWidth: 420, padding: '2rem' }}
              >
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
                  Share Your Itinerary
                </h3>

                {qrCode && (
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src={qrCode} alt="QR Code" style={{ width: 150, height: 150, borderRadius: 12, background: 'white', padding: 8 }} />
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>Scan to open</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    value={shareUrl}
                    readOnly
                    className="input-field"
                    style={{ fontSize: '0.8rem' }}
                  />
                  <button onClick={copyShareUrl} className="btn-secondary" style={{ flexShrink: 0, padding: '0 1rem' }}>
                    <Copy size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out my travel itinerary: ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=My Travel Itinerary&body=${encodeURIComponent(`Check out my travel itinerary: ${shareUrl}`)}`}
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                  >
                    Email
                  </a>
                </div>

                <button
                  onClick={() => setShowShareModal(false)}
                  className="btn-ghost"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* AI Chat Bot */}
      <ChatBot itineraryId={id} destination={itinerary.destination} />
    </div>
  );
};

export default ItineraryResultPage;
