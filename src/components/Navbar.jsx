import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Database,
  LogOut,
  Sparkles,
  FileCode2,
  ShieldCheck,
  UserCheck,
  Compass,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { signOut, isAdmin } from '../lib/api';
import SupabaseStatusModal from './SupabaseStatusModal';

export default function Navbar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const isLive = isSupabaseConfigured();
  const userIsAdmin = isAdmin(user);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                    Pulse<span className="text-brand-600 font-extrabold">Surveys</span>
                  </span>
                </div>
              </Link>

              {/* Navigation Links according to user role */}
              {user && (
                <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                  {userIsAdmin ? (
                    <>
                      <Link
                        to="/"
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          isActive('/')
                            ? 'bg-gray-100 text-gray-900 font-semibold'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/surveys/new"
                        className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                          isActive('/surveys/new')
                            ? 'bg-gray-100 text-gray-900 font-semibold'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-600" />
                        New Survey
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/"
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                        isActive('/')
                          ? 'bg-gray-100 text-gray-900 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Compass className="w-4 h-4 text-brand-600" />
                      Browse Surveys
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-3.5">
              {/* Role Indicator Badge */}
              {user && (
                <div
                  className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    userIsAdmin
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                  title={userIsAdmin ? 'Administrator Account' : 'Standard User Account'}
                >
                  {userIsAdmin ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Admin</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>User</span>
                    </>
                  )}
                </div>
              )}

              {/* Database Status Button (Admin only or all) */}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isLive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70'
                }`}
                title="Click to view database connection status and SQL migration"
              >
                <Database className="w-3.5 h-3.5 text-brand-600" />
                <span className="hidden sm:inline">
                  {isLive ? 'Supabase' : 'Demo Store'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              {/* If user is a regular user, show quick switch to Admin Sign In */}
              {user && !userIsAdmin && (
                <Link
                  to="/login?role=admin"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                  title="Sign in with administrator credentials"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Sign In</span>
                </Link>
              )}

              {/* User profile pill */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-gray-800 leading-tight">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[11px] text-gray-400 leading-tight truncate max-w-[120px]">
                      {user.email}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full text-white font-semibold text-xs flex items-center justify-center uppercase shadow-sm ${
                      userIsAdmin ? 'bg-purple-800' : 'bg-slate-800'
                    }`}
                  >
                    {(user.user_metadata?.full_name || user.email || 'A')[0]}
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-0.5"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login?role=user"
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    User Login
                  </Link>
                  <Link
                    to="/login?role=admin"
                    className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Supabase connection & SQL modal */}
      <SupabaseStatusModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
