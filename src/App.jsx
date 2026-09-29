import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UserPortal from './pages/UserPortal';
import SurveyBuilder from './pages/SurveyBuilder';
import PublicSurveyView from './pages/PublicSurveyView';
import SurveyResults from './pages/SurveyResults';
import Auth from './pages/Auth';
import AdminRestricted from './components/AdminRestricted';
import { getCurrentUser, isAdmin } from './lib/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (e) {
      console.warn('Auth check error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Determine if current route is the public respondent view
  // /survey/:id (and NOT /survey/:id/results)
  const isPublicSurveyRoute =
    location.pathname.startsWith('/survey/') &&
    !location.pathname.endsWith('/results');

  const userIsAdmin = isAdmin(user);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Initializing PulseSurveys...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Show Navbar on all views except public respondent view */}
      {!isPublicSurveyRoute && <Navbar user={user} />}

      <main className="flex-1">
        <Routes>
          {/* Main Home Route: Shows Admin Dashboard to Admins, and User Portal to standard users */}
          <Route
            path="/"
            element={
              user ? (
                userIsAdmin ? (
                  <Dashboard user={user} />
                ) : (
                  <UserPortal user={user} />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Survey Builder (Admin Restricted) */}
          <Route
            path="/surveys/new"
            element={
              user ? (
                userIsAdmin ? (
                  <SurveyBuilder />
                ) : (
                  <AdminRestricted user={user} />
                )
              ) : (
                <Navigate to="/login?role=admin" replace />
              )
            }
          />
          <Route
            path="/surveys/:id/edit"
            element={
              user ? (
                userIsAdmin ? (
                  <SurveyBuilder />
                ) : (
                  <AdminRestricted user={user} />
                )
              ) : (
                <Navigate to="/login?role=admin" replace />
              )
            }
          />

          {/* Survey Analytics & Results (Admin Restricted) */}
          <Route
            path="/survey/:id/results"
            element={
              user ? (
                userIsAdmin ? (
                  <SurveyResults />
                ) : (
                  <AdminRestricted user={user} />
                )
              ) : (
                <Navigate to="/login?role=admin" replace />
              )
            }
          />

          {/* Public Respondent View (Open to everyone) */}
          <Route path="/survey/:id" element={<PublicSurveyView user={user} />} />

          {/* Auth (Supports both User login/signup and Admin credential login) */}
          <Route
            path="/login"
            element={<Auth onAuthSuccess={(u) => setUser(u)} />}
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
