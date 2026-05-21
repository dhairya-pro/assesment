import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('travel_user') || 'null'),
  token: localStorage.getItem('travel_token') || null,
  loading: false,
  initialized: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        initialized: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        initialized: true,
      };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_INITIALIZED':
      return { ...state, initialized: true };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('travel_token');
      if (!token) {
        dispatch({ type: 'SET_INITIALIZED' });
        return;
      }

      try {
        const res = await authAPI.getMe();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: res.data.data, token },
        });
      } catch {
        localStorage.removeItem('travel_token');
        localStorage.removeItem('travel_user');
        dispatch({ type: 'LOGOUT' });
      }
    };

    verifyToken();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authAPI.login(credentials);
      const { token, user } = res.data.data;

      localStorage.setItem('travel_token', token);
      localStorage.setItem('travel_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authAPI.register(userData);
      const { token, user } = res.data.data;

      localStorage.setItem('travel_token', token);
      localStorage.setItem('travel_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('travel_token');
    localStorage.removeItem('travel_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updated = { ...state.user, ...userData };
    localStorage.setItem('travel_user', JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!state.token && !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
