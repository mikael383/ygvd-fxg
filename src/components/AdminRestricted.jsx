import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminRestricted({ user }) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-8 max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-purple-100 text-purple-800">
            Administrator Access Only
          </span>
          <h2 className="text-xl font-bold text-gray-900 pt-1">
            Restricted Page
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
            You are currently signed in as a standard user (
            <strong className="text-gray-700">{user?.email}</strong>). Survey creation, editing, and analytics are restricted to pre-registered administrators.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/login?role=admin"
            className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In with Administrator Credentials</span>
          </Link>

          <Link
            to="/"
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
