import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  User,
  AlertCircle,
  Database,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  signInAdmin,
  signInUser,
  signUpUser,
  signInDemoAdmin,
  signInDemoUser,
} from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';
import { REGISTERED_ADMINS } from '../lib/demoData';

export default function Auth({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role: 'user' | 'admin'
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'user';
  const [role, setRole] = useState(initialRole);

  // User Mode: 'login' | 'register' (Admins CANNOT register!)
  const [userMode, setUserMode] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLive = isSupabaseConfigured();

  // Sync role if query parameter changes
  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'admin' || r === 'user') {
      setRole(r);
      setError(null);
    }
  }, [searchParams]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === 'admin') {
      setUserMode('login'); // strictly login only for admins
      setEmail('admin@pulsesurveys.io');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let authenticatedUser;

      if (role === 'admin') {
        // ADMIN LOGIN ONLY
        authenticatedUser = await signInAdmin({ email, password });
      } else {
        // USER LOGIN OR USER SIGN UP
        if (userMode === 'login') {
          authenticatedUser = await signInUser({ email, password });
        } else {
          authenticatedUser = await signUpUser({ email, password, fullName });
        }
      }

      if (onAuthSuccess) onAuthSuccess(authenticatedUser);

      // Navigate appropriately based on role
      if (role === 'admin') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      const admin = await signInDemoAdmin();
      if (onAuthSuccess) onAuthSuccess(admin);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await signInDemoUser();
      if (onAuthSuccess) onAuthSuccess(u);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {role === 'admin'
              ? 'Administrator Portal'
              : userMode === 'login'
              ? 'Welcome to PulseSurveys'
              : 'Create Respondent Account'}
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {role === 'admin'
              ? 'Sign in with registered credentials to build surveys, manage questions, and analyze results.'
              : userMode === 'login'
              ? 'Sign in to explore active surveys, submit responses, and track your activity.'
              : 'Join as a user to answer surveys, vote on polls, and provide valuable feedback.'}
          </p>
        </div>

        {/* Role Selector Tabs (User vs Admin) */}
        <div className="bg-gray-200/80 p-1 rounded-2xl flex items-center gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleChange('user')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'user'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-brand-600" />
            <span>User Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'admin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-card p-7 sm:p-8 space-y-5">
          {/* Mode Indicator & Backend pill */}
          <div className="flex items-center justify-between text-xs pb-1">
            <div className="flex items-center gap-1.5 font-medium text-gray-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  role === 'admin' ? 'bg-purple-500' : 'bg-brand-500'
                }`}
              />
              <span className="font-semibold text-gray-800">
                {role === 'admin' ? 'Admin Credential Login' : 'User Account Access'}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              {isLive ? 'Supabase Postgres' : 'Interactive Demo Store'}
            </span>
          </div>

          {/* Special Admin Restriction Banner */}
          {role === 'admin' && (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Pre-Registered Administrator Access Only</span>
              </div>
              <p className="text-[11px] text-purple-800/90 leading-relaxed">
                Public registration is disabled for administrators. You must use an existing registered administrator credential.
              </p>
            </div>
          )}

          {/* Quick 1-Click Demo Buttons */}
          {role === 'admin' ? (
            <button
              type="button"
              onClick={handleInstantDemoAdmin}
              className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-xl border border-purple-200 transition-all flex items-center justify-center gap-2 group shadow-subtle"
            >
              <Sparkles className="w-4 h-4 text-purple-600 group-hover:rotate-12 transition-transform" />
              <span>Instant Admin Login (admin@pulsesurveys.io)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleInstantDemoUser}
              className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-100 text-brand-900 text-xs font-bold rounded-xl border border-brand-200 transition-all flex items-center justify-center gap-2 group shadow-subtle"
            >
              <Sparkles className="w-4 h-4 text-brand-600 group-hover:rotate-12 transition-transform" />
              <span>Instant Demo User Login (user@pulsesurveys.io)</span>
            </button>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-[11px] uppercase tracking-wider font-semibold">
              Or enter credentials
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for User Sign Up */}
            {role === 'user' && userMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {role === 'admin' ? 'Registered Admin Email' : 'Email Address'} <span className="text-rose-500">*</span>
                </label>
                {role === 'admin' && (
                  <span className="text-[10px] text-purple-700 font-mono">admin@pulsesurveys.io</span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@pulsesurveys.io' : 'user@example.com'}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                {role === 'admin' && (
                  <span className="text-[10px] text-purple-700 font-mono">admin123</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                role === 'admin'
                  ? 'bg-purple-700 hover:bg-purple-800'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {role === 'admin'
                      ? 'Sign In as Administrator'
                      : userMode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* User Sign In / Sign Up Toggle (Hidden for Admin) */}
          {role === 'user' ? (
            <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
              {userMode === 'login' ? (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMode('register');
                      setError(null);
                    }}
                    className="text-brand-600 font-bold hover:underline"
                  >
                    Sign up free
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMode('login');
                      setError(null);
                    }}
                    className="text-brand-600 font-bold hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          ) : (
            <div className="pt-2 text-center text-[11px] text-gray-400 border-t border-gray-100">
              <span>Are you a survey respondent? </span>
              <button
                type="button"
                onClick={() => handleRoleChange('user')}
                className="text-purple-600 font-bold hover:underline"
              >
                Go to User Portal
              </button>
            </div>
          )}
        </div>

        {/* Demo Registered Admin Credentials Cheat-sheet */}
        {role === 'admin' && (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <Info className="w-4 h-4 text-purple-600" />
              <span>Registered Administrator Directory:</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-gray-700 pl-5">
              <div>• <strong>admin@pulsesurveys.io</strong> (Pass: <code>admin123</code>)</div>
              <div>• <strong>director@pulsesurveys.io</strong> (Pass: <code>admin123</code>)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
