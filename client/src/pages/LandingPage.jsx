import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plane, Sparkles, Upload, Brain, Share2, Shield, Star, ArrowRight,
  CheckCircle, Zap, Globe, MapPin
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: Upload,
    title: 'Smart Document Upload',
    desc: 'Drag & drop your flight tickets, hotel bookings, visas, and travel documents. Supports PDF, PNG, JPG.',
    color: '#6366f1',
  },
  {
    icon: Brain,
    title: 'AI-Powered OCR Extraction',
    desc: 'Automatically reads and extracts passenger names, flight numbers, dates, hotels, and more from any document.',
    color: '#8b5cf6',
  },
  {
    icon: Sparkles,
    title: 'Gemini AI Itinerary',
    desc: 'Generates a complete day-by-day travel plan with attractions, food, weather tips, packing lists, and budgets.',
    color: '#f59e0b',
  },
  {
    icon: Share2,
    title: 'Share & Export',
    desc: 'Share your itinerary via unique link, generate QR codes, or download as a beautiful PDF.',
    color: '#10b981',
  },
];

const steps = [
  { step: '01', title: 'Upload Documents', desc: 'Upload your flight tickets, hotel reservations, or any travel documents' },
  { step: '02', title: 'AI Extracts Data', desc: 'Our OCR engine reads and parses all travel details automatically' },
  { step: '03', title: 'Review & Edit', desc: 'Verify the extracted data and add any extra context or preferences' },
  { step: '04', title: 'Get Your Itinerary', desc: 'Receive a complete AI-crafted travel plan in seconds' },
];

const stats = [
  { value: '50K+', label: 'Itineraries Generated' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '120+', label: 'Countries Covered' },
  { value: '< 30s', label: 'Generation Time' },
];

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh' }}>
      <Navbar transparent />

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0f0c29 0%, #1a1a2e 60%, #0a0a0f 100%)',
        paddingTop: '5rem',
      }}>
        {/* Animated background orbs */}
        <div className="orb orb-primary animate-float" style={{ width: 600, height: 600, top: -200, left: -200, opacity: 0.12 }} />
        <div className="orb orb-pink animate-float" style={{ width: 400, height: 400, top: 100, right: -100, opacity: 0.08, animationDelay: '1s' }} />
        <div className="orb orb-accent animate-float" style={{ width: 300, height: 300, bottom: -100, left: '40%', opacity: 0.06, animationDelay: '2s' }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 900, padding: '0 2rem' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 100,
              color: '#818cf8',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '2rem',
              letterSpacing: '0.05em',
            }}>
              <Sparkles size={14} />
              POWERED BY GOOGLE GEMINI AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              color: 'white',
            }}
          >
            Turn Your Travel Docs
            <br />
            Into a{' '}
            <span className="gradient-text">Smart Itinerary</span>
            <br />
            in Seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              color: '#94a3b8',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: 600,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Upload your flight tickets, hotel bookings, and travel documents. Our AI extracts the data and creates a detailed day-by-day travel plan with recommendations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={isAuthenticated ? '/upload' : '/register'}
                className="btn-primary"
                style={{ padding: '1rem 2rem', fontSize: '1rem', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
              >
                <Sparkles size={20} />
                {isAuthenticated ? 'Create Itinerary' : 'Start for Free'}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" className="btn-ghost" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                <Plane size={18} />
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap' }}
          >
            {['No credit card required', 'Free to start', 'Instant results'].map((text) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
                <CheckCircle size={14} color="#10b981" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '5rem 2rem', background: 'var(--surface-card)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #818cf8, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Everything You Need for
            <span className="gradient-text"> Smarter Travel</span>
          </h2>
          <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
            From document upload to AI-powered recommendations — your entire travel planning in one place.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="glass"
                style={{ padding: '2rem' }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${feature.color}20`,
                  border: `1px solid ${feature.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Icon size={24} color={feature.color} />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>{feature.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '6rem 2rem', background: 'var(--surface-card)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
              How It Works
            </h2>
            <p style={{ color: '#64748b' }}>Four simple steps to your perfect travel itinerary</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                style={{ position: 'relative' }}
              >
                <div style={{
                  fontSize: '3rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.1))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '1rem',
                }}>
                  {step.step}
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-primary" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.08 }} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
              Ready to Plan Your Next Adventure?
            </h2>
            <p style={{ color: '#64748b', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Join thousands of travelers who plan smarter with AI.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
              <Link
                to={isAuthenticated ? '/upload' : '/register'}
                className="btn-primary"
                style={{ padding: '1.1rem 2.5rem', fontSize: '1.05rem', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
              >
                <Sparkles size={20} />
                {isAuthenticated ? 'Create Itinerary Now' : 'Get Started Free'}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: '#475569',
        fontSize: '0.85rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Plane size={16} color="#6366f1" />
          <span style={{ color: '#818cf8', fontWeight: 600 }}>AI Travel Planner</span>
        </div>
        <p>© 2025 AI Travel Planner. Built with ❤️ and Gemini AI.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
