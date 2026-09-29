import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Check,
  ShieldAlert,
  Inbox,
  ExternalLink,
} from 'lucide-react';
import { listPublishedSurveysForUser } from '../lib/api';

export default function UserPortal({ user }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSurveys();
  }, [user]);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await listPublishedSurveysForUser(user);
      setSurveys(data || []);
    } catch (err) {
      console.error('Failed to load published surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurveys = surveys.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completedCount = surveys.filter((s) => s.has_submitted).length;
  const availableCount = surveys.filter((s) => !s.has_submitted).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            User Participant Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Respondent'}!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Your voice shapes product decisions and team culture. Explore active surveys below to share your perspectives.
          </p>
        </div>

        {/* Quick Stats Pill on Banner */}
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center gap-4 text-xs font-medium text-white/90">
          <div>
            Available to take: <strong className="font-bold text-white">{availableCount}</strong>
          </div>
          <span>•</span>
          <div>
            Completed by you: <strong className="font-bold text-white">{completedCount}</strong>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-subtle">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active surveys..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredSurveys.length} public surveys
        </div>
      </div>

      {/* Surveys Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading published surveys...</p>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3 max-w-md mx-auto">
          <Inbox className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No active surveys found</h3>
          <p className="text-xs text-gray-500">
            Check back later for new questionnaires and pulse polls.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-3.5 flex-1">
                {/* Top Badge: Completed vs Open */}
                <div className="flex items-center justify-between">
                  {survey.has_submitted ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Open for Responses
                    </span>
                  )}

                  <span className="text-xs text-gray-400 font-medium">
                    {survey.question_count || 4} Questions
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {survey.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                    {survey.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Card Bottom CTA */}
              <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium">
                  {survey.has_submitted
                    ? `Submitted on ${new Date(survey.submitted_at).toLocaleDateString()}`
                    : '~ 2-3 mins to complete'}
                </span>

                <Link
                  to={`/survey/${survey.id}`}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                    survey.has_submitted
                      ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      : 'bg-brand-600 hover:bg-brand-700 text-white'
                  }`}
                >
                  <span>{survey.has_submitted ? 'Retake Survey' : 'Take Survey'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Notice Callout */}
      <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span>Need to create or manage surveys? Administrator credentials are required.</span>
        </div>
        <Link
          to="/login?role=admin"
          className="text-purple-700 font-bold hover:underline whitespace-nowrap"
        >
          Go to Administrator Sign In →
        </Link>
      </div>
    </div>
  );
}
