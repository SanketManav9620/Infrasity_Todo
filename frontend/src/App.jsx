import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  // Loading spinner while verifying existing token
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F8] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#800020] mb-3" />
        <p className="text-sm font-semibold text-stone-600">Restoring your session...</p>
      </div>
    );
  }

  // If authenticated, display protected dashboard
  if (isAuthenticated) {
    return <Dashboard />;
  }

  // Otherwise, display Login or Register
  if (authView === 'register') {
    return <Register onSwitchToLogin={() => setAuthView('login')} />;
  }

  return <Login onSwitchToRegister={() => setAuthView('register')} />;
}
