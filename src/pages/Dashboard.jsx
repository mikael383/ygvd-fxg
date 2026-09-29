import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  Edit3,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Users,
  Calendar,
  Search,
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { listSurveys, deleteSurvey } from '../lib/api';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await listSurveys();
      setSurveys(data || []);
    } catch (err) {
      console.error('Failed to load surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (surveyId) => {
    const publicUrl = `${window.location.origin}/survey/${surveyId}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedId(surveyId);
      showToast('Public survey link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleDelete = async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this survey? All questions and submissions will be permanently removed.')) {
      return;
    }

    try {
      setDeletingId(surveyId);
      await deleteSurvey(surveyId);
      setSurveys(prev => prev.filter(s => s.id !== surveyId));
      showToast('Survey successfully deleted.');
    } catch (err) {
      console.error('Failed to delete survey:', err);
      alert('Error deleting survey.');
    } finally {
      setDeletingId(null);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSurveys = surveys.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick metrics
  const totalSubmissions = surveys.reduce((acc, curr) => acc + (curr.response_count || 0), 0);
  const publishedCount = surveys.filter(s => s.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm animate-slide-up border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero / Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Survey Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Build, publish, and monitor real-time feedback across all your surveys.
          </p>
        </div>

        <Link
          to="/surveys/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Survey
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Surveys</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{surveys.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Published</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{publishedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Submissions</p>
            <p className="text-2xl font-bold text-brand-600 mt-1">{totalSubmissions}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-subtle">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search surveys by title or description..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-gray-400 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {['all', 'published', 'draft', 'closed'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Survey Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading your surveys...</p>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No surveys found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or filter settings.'
                : 'Get started by creating your first survey and share the public link with respondents.'}
            </p>
          </div>
          <Link
            to="/surveys/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Survey Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => {
            const formattedDate = new Date(survey.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={survey.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-gray-300"
              >
                {/* Card Top Section */}
                <div className="p-5 sm:p-6 space-y-3.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={survey.status} />
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                      {survey.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {survey.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100/90 text-gray-700 text-xs font-semibold">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      {survey.response_count || 0} Responses
                    </span>
                  </div>
                </div>

                {/* Card Footer Quick Actions */}
                <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                  {/* Left: View Results & Edit */}
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/survey/${survey.id}/results`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-700 hover:text-brand-600 hover:bg-white font-medium transition-colors border border-transparent hover:border-gray-200"
                      title="View Survey Analytics & Charts"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Results</span>
                    </Link>

                    <Link
                      to={`/surveys/${survey.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-white font-medium transition-colors border border-transparent hover:border-gray-200"
                      title="Edit Survey Questions"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                      <span>Edit</span>
                    </Link>
                  </div>

                  {/* Right: Copy Link & Delete */}
                  <div className="flex items-center gap-1">
                    {survey.status === 'published' ? (
                      <button
                        type="button"
                        onClick={() => handleCopyLink(survey.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          copiedId === survey.id
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-white border-transparent hover:border-gray-200'
                        }`}
                        title="Copy Public Survey Link"
                      >
                        {copiedId === survey.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    ) : (
                      <span
                        className="p-1.5 text-gray-300"
                        title="Only published surveys have public respondent links"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <a
                      href={`/survey/${survey.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
                      title="Open Public Respondent View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      disabled={deletingId === survey.id}
                      onClick={() => handleDelete(survey.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                      title="Delete Survey"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
