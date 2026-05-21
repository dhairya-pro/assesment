import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Plane, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthPage = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const isLogin = mode === 'login';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = isLogin
      ? await login({ email: formData.email, password: formData.password })
      : await register(formData);

    if (result.success) {
      toast.success(isLogin ? 'Welcome back! 🎉' : 'Account created! Welcome aboard! 🚀');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Something went wrong');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-hero)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div className="orb orb-primary" style={{ width: 400, height: 400, top: -100, left: -100 }} />
      <div className="orb orb-pink" style={{ width: 300, height: 300, bottom: -50, right: -50 }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
            }}>
              <Plane size={24} color="white" />
            </div>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            {isLogin ? 'Sign in to access your travel itineraries' : 'Start planning smarter trips with AI'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-strong" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                {errors.name && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.name}</p>}
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={isLogin ? 'Your password' : 'Min 6 characters (letters + numbers)'}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <>
                  <Sparkles size={18} />
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/register' : '/login'}
              style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}
            >
              {isLogin ? 'Sign up free' : 'Sign in'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
