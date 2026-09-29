import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Calendar,
  Users,
  Star,
  BarChart3,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  AlignLeft,
  CircleDot,
  CheckSquare,
  MessageSquare,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { getSurveyAnalytics } from '../lib/api';
import { exportSurveyToCsv } from '../lib/exportCsv';
import StatusBadge from '../components/StatusBadge';

export default function SurveyResults() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' | 'submissions'
  const [copied, setCopied] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getSurveyAnalytics(id);
      setAnalytics(data);
      if (data?.submissions?.length > 0) {
        setSelectedSubmissionId(data.submissions[0].id);
      }
    } catch (err) {
      console.error('Failed to load survey analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!analytics || !analytics.survey) return;
    exportSurveyToCsv(analytics.survey, analytics);
  };

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/survey/${id}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Crunching survey analytics...</p>
      </div>
    );
  }

  if (!analytics || !analytics.survey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Survey Not Found</h2>
        <p className="text-sm text-gray-500">
          The survey results you are looking for do not exist or you do not have permission to view them.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { survey, totalSubmissions, latestSubmissionDate, breakdownPerQuestion, submissions = [], rawAnswers = [] } = analytics;

  const formattedLatestDate = latestSubmissionDate
    ? new Date(latestSubmissionDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No responses yet';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge status={survey.status} size="sm" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                {survey.title}
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Survey Analytics, Visual Breakdown & Response Explorer
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
            {copied ? 'Link Copied!' : 'Copy Public Link'}
          </button>

          <Link
            to={`/surveys/${survey.id}/edit`}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
            Edit Survey
          </Link>

          <a
            href={`/survey/${survey.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            Preview Form
          </a>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={totalSubmissions === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Submissions</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalSubmissions}</p>
            <p className="text-[11px] text-gray-500 mt-1">Verified respondent submissions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Latest Submission</p>
            <p className="text-sm font-bold text-gray-900 mt-2 truncate max-w-[200px]">{formattedLatestDate}</p>
            <p className="text-[11px] text-gray-500 mt-1">Real-time timestamp (UTC)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Questions</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{survey.questions?.length || 0}</p>
            <p className="text-[11px] text-gray-500 mt-1">Configured in survey builder</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs: Visual Breakdown vs Individual Submissions */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'charts'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Visual Breakdown ({breakdownPerQuestion.length} Questions)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Raw Submissions Explorer ({totalSubmissions})</span>
        </button>
      </div>

      {/* TAB 1: VISUAL BREAKDOWN CHARTS */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {totalSubmissions === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3 max-w-lg mx-auto">
              <Inbox className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="text-base font-bold text-gray-900">No responses recorded yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Share your public survey link with respondents or submit a test response to see live charts.
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-brand-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Public Link
              </button>
            </div>
          ) : (
            breakdownPerQuestion.map((item, idx) => {
              const { question, totalResponses, optionsData, average, distributionData, textResponses } = item;

              return (
                <div
                  key={question.id || idx}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-card p-6 sm:p-7 space-y-5"
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {question.question_type.replace('_', ' ')}
                        </span>
                        {question.is_required && (
                          <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {question.question_text}
                      </h3>
                    </div>

                    <div className="text-xs text-gray-500 font-medium whitespace-nowrap bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <strong>{totalResponses}</strong> responses
                    </div>
                  </div>

                  {/* Question Type: Single Choice or Multiple Choice Bar Chart */}
                  {['single_choice', 'multiple_choice'].includes(question.question_type) && (
                    <div className="space-y-3.5 pt-1">
                      {optionsData?.map((opt) => (
                        <div key={opt.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                            <span className="truncate max-w-md">{opt.text}</span>
                            <span className="font-semibold text-gray-900 flex items-center gap-2">
                              <span>{opt.count} votes</span>
                              <span className="text-gray-400 font-normal">({opt.percentage}%)</span>
                            </span>
                          </div>
                          {/* Progress Bar Container */}
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
                            <div
                              className="bg-brand-500 h-2 rounded-full progress-bar-fill"
                              style={{ width: `${Math.max(opt.percentage, 0)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Question Type: Rating Scale */}
                  {question.question_type === 'rating' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-1">
                      {/* Left: Score Badge */}
                      <div className="p-6 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          Average Score
                        </span>
                        <div className="text-4xl font-extrabold text-amber-900 flex items-baseline gap-1">
                          {average}
                          <span className="text-base font-normal text-amber-600">/ 5.0</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(Number(average))
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-amber-200 fill-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-amber-800 pt-1 font-medium">
                          Based on {totalResponses} rating submissions
                        </p>
                      </div>

                      {/* Right: Star Distribution Bars */}
                      <div className="md:col-span-2 space-y-2.5">
                        {distributionData?.map((d) => (
                          <div key={d.star} className="flex items-center gap-3 text-xs">
                            <div className="w-14 font-semibold text-gray-700 flex items-center gap-1">
                              <span>{d.star}</span>
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />
                            </div>

                            <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-amber-400 h-2.5 rounded-full progress-bar-fill"
                                style={{ width: `${d.percentage}%` }}
                              />
                            </div>

                            <div className="w-20 text-right text-gray-500 font-medium">
                              <span className="font-semibold text-gray-900">{d.count}</span> ({d.percentage}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Question Type: Short / Long Text Responses */}
                  {question.question_type === 'text' && (
                    <div className="space-y-3 pt-1">
                      {textResponses && textResponses.length > 0 ? (
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {textResponses.map((res, rIdx) => (
                            <div
                              key={res.id || rIdx}
                              className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1.5 hover:bg-gray-100/60 transition-colors"
                            >
                              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                                "{res.text}"
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-200/50">
                                <span className="font-mono">Response #{rIdx + 1}</span>
                                {res.date && (
                                  <span>{new Date(res.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No text answers submitted yet.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: RAW SUBMISSIONS EXPLORER */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-card overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              No submissions recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* Left Column: Submissions List */}
              <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
                <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    All Submissions ({submissions.length})
                  </span>
                </div>
                {submissions.map((sub, sIdx) => {
                  const isSelected = sub.id === selectedSubmissionId;
                  const dateStr = new Date(sub.submitted_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubmissionId(sub.id)}
                      className={`w-full text-left p-4 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-brand-50/60 border-l-4 border-brand-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-900">
                          Respondent #{submissions.length - sIdx}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate max-w-[160px]">
                          {sub.id}
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">{dateStr}</div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Submission Details Viewer */}
              <div className="md:col-span-2 p-6 max-h-[600px] overflow-y-auto space-y-5">
                {selectedSubmissionId ? (
                  (() => {
                    const selectedSub = submissions.find((s) => s.id === selectedSubmissionId);
                    if (!selectedSub) return null;

                    return (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">
                              Submission Details
                            </h3>
                            <p className="text-xs font-mono text-gray-400 mt-0.5">
                              ID: {selectedSub.id}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            Submitted at {new Date(selectedSub.submitted_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Question by question answers */}
                        <div className="space-y-4">
                          {survey.questions.map((q, qIdx) => {
                            const ans = rawAnswers.find(
                              (a) => a.submission_id === selectedSub.id && a.question_id === q.id
                            );

                            return (
                              <div
                                key={q.id}
                                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1.5"
                              >
                                <div className="text-xs font-semibold text-gray-500">
                                  Q{qIdx + 1}. {q.question_text}
                                </div>

                                <div className="text-sm font-medium text-gray-900 pt-0.5">
                                  {!ans ? (
                                    <span className="text-gray-400 italic text-xs">Skipped / No answer</span>
                                  ) : q.question_type === 'single_choice' ? (
                                    <span>
                                      {q.options?.find((o) => o.id === ans.selected_option_id)?.option_text ||
                                        'Unknown Option'}
                                    </span>
                                  ) : q.question_type === 'multiple_choice' ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {ans.selected_options?.map((optId) => (
                                        <span
                                          key={optId}
                                          className="px-2 py-0.5 bg-brand-50 border border-brand-200 text-brand-800 text-xs rounded-md"
                                        >
                                          {q.options?.find((o) => o.id === optId)?.option_text || optId}
                                        </span>
                                      ))}
                                    </div>
                                  ) : q.question_type === 'rating' ? (
                                    <div className="flex items-center gap-1.5 text-amber-500">
                                      <span className="font-bold text-base text-gray-900">{ans.rating_value}</span>
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                      <span className="text-xs text-gray-500">/ 5 Stars</span>
                                    </div>
                                  ) : (
                                    <p className="text-xs leading-relaxed text-gray-800 whitespace-pre-line bg-white p-2.5 rounded-lg border border-gray-200">
                                      {ans.answer_text}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-12 text-center text-xs text-gray-400">
                    Select a submission on the left to inspect detailed answers.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
