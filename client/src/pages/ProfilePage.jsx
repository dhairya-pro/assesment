import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Camera, Trash2, Shield } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    currentPassword: '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-bg)' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: 260, padding: '2rem', maxWidth: 800 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
            Profile Settings
          </h1>
          <p style={{ color: '#64748b' }}>Manage your account information and preferences</p>
        </motion.div>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 16,
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 0 25px rgba(99,102,241,0.4)',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>
              {user?.name}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{user?.email}</p>
            <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025'}
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  borderRadius: 10,
                  border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? '#818cf8' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass"
          style={{ padding: '2rem' }}
        >
          <form onSubmit={handleSave}>
            {activeTab === 'profile' && (
              <>
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
                      className="input-field"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-field"
                      style={{ paddingLeft: '2.5rem', opacity: 0.5 }}
                    />
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.3rem' }}>Email cannot be changed</p>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter current password"
                      className="input-field"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="input-field"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                </div>
              </>
            )}

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              className="btn-primary"
              style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
          style={{ marginTop: '1.5rem', padding: '1.5rem' }}
        >
          <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem' }}>Travel Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Trips', value: user?.stats?.totalTrips || 0 },
              { label: 'Documents', value: user?.stats?.totalDocuments || 0 },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#818cf8' }}>{stat.value}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;
