import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import {
  getActiveSupabaseCredentials,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  isSupabaseConfigured,
} from '../lib/supabase';
import { resetMockStore } from '../lib/api';

const SCHEMA_PREVIEW = `-- 1. surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'closed')) DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'rating')),
    is_required BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. question_options table
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. answers table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    selected_options UUID[] DEFAULT NULL,
    rating_value INTEGER CHECK (rating_value IS NULL OR (rating_value >= 1 AND rating_value <= 5)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS) is enabled with full creator CRUD & public response permissions
-- See supabase/schema.sql for complete RLS policies and performance indexes.`;

export default function SupabaseStatusModal({ isOpen, onClose }) {
  const currentCreds = getActiveSupabaseCredentials();
  const [activeTab, setActiveTab] = useState('connection'); // 'connection' | 'schema'
  const [url, setUrl] = useState(currentCreds?.url || '');
  const [key, setKey] = useState(currentCreds?.key || '');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const isLive = isSupabaseConfigured();

  const handleSave = (e) => {
    e.preventDefault();
    if (!url || !key) {
      alert('Please provide both Supabase Project URL and Anon Public Key.');
      return;
    }
    saveStoredSupabaseConfig(url, key);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleResetToDemo = () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleResetDemoData = () => {
    resetMockStore();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      window.location.reload();
    }, 800);
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SCHEMA_PREVIEW);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-elevated border border-gray-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Supabase & Backend Configuration
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                    isLive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {isLive ? '● Live Supabase Active' : '● Demo & Mock Mode Active'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your PostgreSQL database connection, RLS policies, and SQL migration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-white gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'connection'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Server className="w-4 h-4" />
            Connection Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Copy className="w-4 h-4" />
            SQL Migration & RLS
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'connection' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border bg-slate-50/70 border-slate-200 text-sm space-y-2">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Instant Interactive Zero-Hassle Architecture
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  The application is currently running in full-featured mode with pre-populated demo surveys, real-time analytics charts, CSV export, and persistent browser storage. You can seamlessly switch to your real Supabase instance below at any time!
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-mono text-xs placeholder:text-gray-400"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Found in your Supabase Dashboard under <strong>Project Settings → API</strong>.
                  </p>
                </div>

                {savedSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Configuration updated! Reloading application...</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Save & Connect
                    </button>
                    {isLive && (
                      <button
                        type="button"
                        onClick={handleResetToDemo}
                        className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                      >
                        Disconnect to Demo
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleResetDemoData}
                    className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resetSuccess ? 'Demo Data Restored!' : 'Reset Demo Surveys'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">PostgreSQL Schema & Row Level Security</h3>
                  <p className="text-xs text-gray-500">
                    File located at <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">supabase/schema.sql</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                  {SCHEMA_PREVIEW}
                </pre>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Quick Setup Instructions for Supabase
                </p>
                <ol className="list-decimal list-inside space-y-1 text-amber-800 text-[11px] pl-1">
                  <li>Open your Supabase project dashboard at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-semibold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5 inline" /></a></li>
                  <li>Click on the <strong>SQL Editor</strong> tab on the left sidebar</li>
                  <li>Paste the script from <code>supabase/schema.sql</code> and click <strong>Run</strong></li>
                  <li>Done! All 5 tables and RLS security policies are live instantly.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
