import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPublicSurvey, submitSurveyResponse } from '../lib/api';
import RatingInput from '../components/RatingInput';

export default function PublicSurveyView({ user }) {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Respondent answers state: { [qId]: { value, selected_option_id, selected_options, rating_value, text } }
  const [answers, setAnswers] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicSurvey(id);
      if (!data) {
        setError('Survey not found. Please verify the URL.');
        return;
      }
      setSurvey(data);
    } catch (err) {
      console.error('Failed to load public survey:', err);
      setError('Unable to load this survey right now.');
    } finally {
      setLoading(false);
    }
  };

  // Answer handler for single choice
  const handleSingleChoice = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected_option_id: optionId,
      },
    }));
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  // Answer handler for multiple choice
  const handleMultipleChoice = (questionId, optionId) => {
    const current = answers[questionId]?.selected_options || [];
    let updated;
    if (current.includes(optionId)) {
      updated = current.filter((opt) => opt !== optionId);
    } else {
      updated = [...current, optionId];
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected_options: updated,
      },
    }));

    if (validationErrors[questionId]) {
      setValidationErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  // Answer handler for rating
  const handleRating = (questionId, rating) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        rating_value: rating,
      },
    }));
    if (validationErrors[questionId]) {
      setValidationErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  // Answer handler for text
  const handleText = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        text,
      },
    }));
    if (validationErrors[questionId] && text.trim().length > 0) {
      setValidationErrors((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  // Validate required questions
  const validateForm = () => {
    const errors = {};
    let firstErrorQId = null;

    survey.questions.forEach((q) => {
      if (q.is_required) {
        const ans = answers[q.id];
        let isValid = false;

        if (q.question_type === 'single_choice' && ans?.selected_option_id) {
          isValid = true;
        } else if (q.question_type === 'multiple_choice' && ans?.selected_options?.length > 0) {
          isValid = true;
        } else if (q.question_type === 'rating' && ans?.rating_value) {
          isValid = true;
        } else if (q.question_type === 'text' && ans?.text?.trim().length > 0) {
          isValid = true;
        }

        if (!isValid) {
          errors[q.id] = 'This question is required.';
          if (!firstErrorQId) firstErrorQId = q.id;
        }
      }
    });

    setValidationErrors(errors);

    if (firstErrorQId) {
      const el = document.getElementById(`q-${firstErrorQId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await submitSurveyResponse(survey.id, answers, user);

      setSubmitted(true);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#3b82f6', '#f59e0b'],
        });
      } catch (cErr) {
        console.warn('Confetti error:', cErr);
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate completion progress
  const answeredCount = survey?.questions
    ? survey.questions.filter((q) => {
        const a = answers[q.id];
        if (!a) return false;
        if (q.question_type === 'single_choice') return Boolean(a.selected_option_id);
        if (q.question_type === 'multiple_choice') return a.selected_options?.length > 0;
        if (q.question_type === 'rating') return Boolean(a.rating_value);
        if (q.question_type === 'text') return Boolean(a.text?.trim().length > 0);
        return false;
      }).length
    : 0;

  const progressPercent = survey?.questions?.length
    ? Math.round((answeredCount / survey.questions.length) * 100)
    : 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium mt-3">Loading survey...</p>
      </div>
    );
  }

  // Error State
  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Survey Not Found</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {error || 'This survey does not exist or may have been removed by its creator.'}
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Go to PulseSurveys Home
          </Link>
        </div>
      </div>
    );
  }

  // Unavailable State (Draft or Closed)
  if (survey.status !== 'published') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-8 sm:p-10 max-w-lg w-full text-center space-y-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
              survey.status === 'closed'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {survey.status === 'closed' ? <Clock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>

          <div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                survey.status === 'closed'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Survey {survey.status === 'closed' ? 'Closed' : 'Not Published'}
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{survey.title}</h2>
          </div>

          <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
            {survey.status === 'closed'
              ? 'This survey is no longer accepting new responses. Thank you for your interest!'
              : 'This survey is currently in draft mode by its creator and is not yet open for public responses.'}
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-gray-500" />
              Return to Platform Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Submitted Thank You State
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-elevated p-8 sm:p-12 max-w-lg w-full text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Thank You for Your Feedback!
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Your response to <strong>"{survey.title}"</strong> has been successfully recorded.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-800 space-y-1">
            <p className="font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Submission saved securely to Supabase backend
            </p>
            <p className="text-[11px] text-emerald-700/80">
              The survey creator will review aggregated responses in real-time.
            </p>
          </div>

          <div className="pt-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Explore PulseSurveys</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Sticky Progress Bar at Top */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="font-medium text-gray-500">
            {answeredCount} of {survey.questions.length} answered
          </span>
          <span className="font-bold text-brand-600">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-gray-100 h-1">
          <div
            className="bg-brand-500 h-1 progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Survey Welcome Header Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-card p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            Official Survey
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-sm text-gray-600 leading-relaxed pt-1 whitespace-pre-line">
              {survey.description}
            </p>
          )}
          <div className="pt-2 text-[11px] text-gray-400 font-medium">
            <span className="text-rose-500 font-bold">*</span> Indicates required field
          </div>
        </div>

        {/* Survey Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((q, idx) => {
            const hasError = Boolean(validationErrors[q.id]);
            const currentAns = answers[q.id];

            return (
              <div
                key={q.id}
                id={`q-${q.id}`}
                className={`bg-white rounded-3xl border transition-all duration-200 p-6 sm:p-8 space-y-5 shadow-card ${
                  hasError ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200/90 hover:border-gray-300'
                }`}
              >
                {/* Question Prompt Header */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                      Question {idx + 1}
                    </span>
                    {q.is_required && (
                      <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                        Required *
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 pt-1 leading-snug">
                    {q.question_text}
                  </h3>
                </div>

                {/* Error Banner if invalid */}
                {hasError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationErrors[q.id]}</span>
                  </div>
                )}

                {/* Answer Options Renderers */}
                <div className="pt-1">
                  {/* Single Choice (Radio) */}
                  {q.question_type === 'single_choice' && (
                    <div className="space-y-2.5">
                      {(q.options || []).map((opt) => {
                        const isSelected = currentAns?.selected_option_id === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 ${
                              isSelected
                                ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                                : 'bg-gray-50/40 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={opt.id}
                              checked={isSelected}
                              onChange={() => handleSingleChoice(q.id, opt.id)}
                              className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-800">
                              {opt.option_text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Multiple Choice (Checkboxes) */}
                  {q.question_type === 'multiple_choice' && (
                    <div className="space-y-2.5">
                      <p className="text-xs text-gray-400 mb-2">Select all that apply:</p>
                      {(q.options || []).map((opt) => {
                        const isChecked = currentAns?.selected_options?.includes(opt.id) || false;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 ${
                              isChecked
                                ? 'bg-brand-50/60 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                                : 'bg-gray-50/40 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              name={`question-${q.id}`}
                              value={opt.id}
                              checked={isChecked}
                              onChange={() => handleMultipleChoice(q.id, opt.id)}
                              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-800">
                              {opt.option_text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Rating Scale (Stars) */}
                  {q.question_type === 'rating' && (
                    <div className="py-2">
                      <RatingInput
                        value={currentAns?.rating_value || 0}
                        onChange={(val) => handleRating(q.id, val)}
                      />
                    </div>
                  )}

                  {/* Text Input (Short / Long) */}
                  {q.question_type === 'text' && (
                    <div>
                      <textarea
                        rows={3}
                        value={currentAns?.text || ''}
                        onChange={(e) => handleText(q.id, e.target.value)}
                        placeholder="Write your response here..."
                        className="w-full p-4 text-sm rounded-2xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400 text-gray-900 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Submit Action Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              Please double-check your answers before submitting.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Response...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Submit Survey</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Brand Credit */}
        <div className="pt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <span>Powered by</span>
          <strong className="text-gray-600 font-bold">PulseSurveys</strong>
          <span>• Built with React & Supabase</span>
        </div>
      </div>
    </div>
  );
}
