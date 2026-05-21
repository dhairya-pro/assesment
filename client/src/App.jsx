import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ItineraryResultPage from './pages/ItineraryResultPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SharedItineraryPage from './pages/SharedItineraryPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--surface-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: '#64748b', fontFamily: 'var(--font-sans)' }}>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public route — redirect to dashboard if authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/share/:token" element={<SharedItineraryPage />} />
      <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
      <Route path="/itinerary/:id" element={<ProtectedRoute><ItineraryResultPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#0a0a0f' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' },
              },
              loading: {
                iconTheme: { primary: '#6366f1', secondary: '#0a0a0f' },
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
