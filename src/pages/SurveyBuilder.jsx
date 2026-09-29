import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Star,
  CircleDot,
  CheckSquare,
  AlignLeft,
} from 'lucide-react';
import { getSurveyById, createSurvey, updateSurvey } from '../lib/api';
import QuestionCard from '../components/QuestionCard';

export default function SurveyBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft'); // 'draft' | 'published' | 'closed'
  const [questions, setQuestions] = useState([
    {
      id: 'new-q-1',
      question_text: '',
      question_type: 'single_choice',
      is_required: true,
      options: [
        { id: 'new-opt-1', option_text: 'Option 1', order_index: 0 },
        { id: 'new-opt-2', option_text: 'Option 2', order_index: 1 },
      ],
    },
  ]);

  useEffect(() => {
    if (isEditing) {
      loadExistingSurvey();
    }
  }, [id]);

  const loadExistingSurvey = async () => {
    try {
      setLoading(true);
      const survey = await getSurveyById(id);
      if (!survey) {
        setError('Survey not found.');
        return;
      }
      setTitle(survey.title || '');
      setDescription(survey.description || '');
      setStatus(survey.status || 'draft');
      setQuestions(survey.questions || []);
    } catch (err) {
      console.error('Failed to load survey:', err);
      setError('Failed to load survey data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (type = 'single_choice') => {
    const newId = 'new-q-' + Math.random().toString(36).substring(2, 7);
    const newQ = {
      id: newId,
      question_text: '',
      question_type: type,
      is_required: true,
      options: ['single_choice', 'multiple_choice'].includes(type)
        ? [
            { id: 'opt-new-1', option_text: 'Option 1', order_index: 0 },
            { id: 'opt-new-2', option_text: 'Option 2', order_index: 1 },
          ]
        : [],
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (index, updatedQuestion) => {
    const updated = [...questions];
    updated[index] = updatedQuestion;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    if (questions.length <= 1) {
      alert('A survey must have at least one question.');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
  };

  const handleMoveQuestion = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setQuestions(updated);
  };

  const validate = () => {
    if (!title.trim()) {
      setError('Please provide a survey title.');
      return false;
    }

    if (questions.length === 0) {
      setError('Please add at least one question.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.question_text.trim()) {
        setError(`Question #${i + 1} must have a title or prompt.`);
        return false;
      }
      if (['single_choice', 'multiple_choice'].includes(q.question_type)) {
        if (!q.options || q.options.length < 2) {
          setError(`Question #${i + 1} must have at least two choices.`);
          return false;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].option_text || !q.options[j].option_text.trim()) {
            setError(`Question #${i + 1}, Option #${j + 1} cannot be empty.`);
            return false;
          }
        }
      }
    }

    setError(null);
    return true;
  };

  const handleSave = async (forcedStatus = null) => {
    if (!validate()) return;

    try {
      setSaving(true);
      const effectiveStatus = forcedStatus || status;

      if (isEditing) {
        await updateSurvey(id, {
          title: title.trim(),
          description: description.trim(),
          status: effectiveStatus,
          questions,
        });
      } else {
        await createSurvey({
          title: title.trim(),
          description: description.trim(),
          status: effectiveStatus,
          questions,
        });
      }

      navigate('/');
    } catch (err) {
      console.error('Failed to save survey:', err);
      setError('An error occurred while saving the survey. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading survey editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-24">
      {/* Top Bar with Back Link & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {isEditing ? 'Edit Survey' : 'Create New Survey'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Design questions, configure options, and control publication status.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isEditing && (
            <a
              href={`/survey/${id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              Preview Public View
            </a>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {saving ? 'Publishing...' : 'Publish Survey'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave()}
            className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* Error message alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Survey Metadata Card */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-card p-6 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Survey Details & Publication
        </h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Survey Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Customer Feedback & Product Experience"
            className="w-full px-4 py-3 text-base rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-semibold text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Description / Welcome Message <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Introduce your survey and let respondents know how their answers will be used..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400 resize-none text-gray-800 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Survey Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'draft', label: 'Draft', desc: 'Private to creator, responses disabled' },
              { id: 'published', label: 'Published', desc: 'Live & collecting public responses' },
              { id: 'closed', label: 'Closed', desc: 'No longer accepting new submissions' },
            ].map((s) => (
              <label
                key={s.id}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  status === s.id
                    ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 capitalize">{s.label}</span>
                  <input
                    type="radio"
                    name="survey-status"
                    value={s.id}
                    checked={status === s.id}
                    onChange={() => setStatus(s.id)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                </div>
                <span className="text-[11px] text-gray-500 mt-1 leading-snug">{s.desc}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Questions Section Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Survey Questions ({questions.length})
            </h2>
            <p className="text-xs text-gray-500">
              Add, rearrange, and customize your question types and options.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 hidden sm:inline">Quick Add:</span>
            <button
              type="button"
              onClick={() => handleAddQuestion('single_choice')}
              className="p-1.5 text-xs font-semibold text-gray-700 hover:text-brand-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
              title="Add Single Choice Question"
            >
              <CircleDot className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Single</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('multiple_choice')}
              className="p-1.5 text-xs font-semibold text-gray-700 hover:text-brand-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
              title="Add Multiple Choice Question"
            >
              <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Multiple</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('rating')}
              className="p-1.5 text-xs font-semibold text-gray-700 hover:text-brand-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
              title="Add Rating Scale Question"
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Rating</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddQuestion('text')}
              className="p-1.5 text-xs font-semibold text-gray-700 hover:text-brand-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex items-center gap-1"
              title="Add Text Question"
            >
              <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Text</span>
            </button>
          </div>
        </div>

        {/* Dynamic Questions List */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id || idx}
              question={q}
              index={idx}
              totalQuestions={questions.length}
              onUpdate={(updated) => handleUpdateQuestion(idx, updated)}
              onDelete={() => handleDeleteQuestion(idx)}
              onMoveUp={() => handleMoveQuestion(idx, -1)}
              onMoveDown={() => handleMoveQuestion(idx, 1)}
            />
          ))}
        </div>

        {/* Big Add Question Button at Bottom */}
        <button
          type="button"
          onClick={() => handleAddQuestion('single_choice')}
          className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50/30 rounded-2xl text-sm font-semibold text-gray-600 hover:text-brand-700 transition-all flex items-center justify-center gap-2 group"
        >
          <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-brand-100 text-gray-500 group-hover:text-brand-700 flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add Another Question</span>
        </button>
      </div>

      {/* Floating Sticky Save Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-elevated">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Current status:{' '}
            <span className="font-semibold text-gray-900 capitalize">{status}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave()}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Survey'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
