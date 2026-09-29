import React from 'react';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  Star,
  CheckSquare,
  CircleDot,
  AlignLeft,
} from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'single_choice', label: 'Single Choice', icon: CircleDot, desc: 'Radio buttons (one selection)' },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare, desc: 'Checkboxes (multiple selections)' },
  { value: 'rating', label: 'Rating Scale', icon: Star, desc: '1 to 5 clickable stars' },
  { value: 'text', label: 'Short / Long Text', icon: AlignLeft, desc: 'Freeform text response' },
];

export default function QuestionCard({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  const isChoiceType = ['single_choice', 'multiple_choice'].includes(question.question_type);

  const handleTextChange = (text) => {
    onUpdate({ ...question, question_text: text });
  };

  const handleTypeChange = (type) => {
    let options = question.options || [];
    if (['single_choice', 'multiple_choice'].includes(type) && (!options || options.length === 0)) {
      options = [
        { id: 'opt-new-1', option_text: 'Option 1', order_index: 0 },
        { id: 'opt-new-2', option_text: 'Option 2', order_index: 1 },
      ];
    }
    onUpdate({ ...question, question_type: type, options });
  };

  const handleRequiredToggle = () => {
    onUpdate({ ...question, is_required: !question.is_required });
  };

  const handleAddOption = () => {
    const currentOptions = question.options || [];
    const newOption = {
      id: 'opt-new-' + Math.random().toString(36).substring(2, 7),
      option_text: `Option ${currentOptions.length + 1}`,
      order_index: currentOptions.length,
    };
    onUpdate({
      ...question,
      options: [...currentOptions, newOption],
    });
  };

  const handleOptionChange = (optIndex, newText) => {
    const newOptions = [...(question.options || [])];
    newOptions[optIndex] = {
      ...newOptions[optIndex],
      option_text: newText,
    };
    onUpdate({ ...question, options: newOptions });
  };

  const handleRemoveOption = (optIndex) => {
    const newOptions = (question.options || []).filter((_, idx) => idx !== optIndex);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-card p-5 sm:p-6 transition-all hover:border-gray-300">
      {/* Question Header & Order Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center border border-gray-200">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Question #{index + 1}
          </span>
        </div>

        {/* Action Controls: Move Up, Move Down, Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className={`p-1.5 rounded-lg border transition-colors ${
              index === 0
                ? 'text-gray-300 border-transparent cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-900 border-gray-200 hover:bg-gray-100'
            }`}
            title="Move Question Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === totalQuestions - 1}
            onClick={onMoveDown}
            className={`p-1.5 rounded-lg border transition-colors ${
              index === totalQuestions - 1
                ? 'text-gray-300 border-transparent cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-900 border-gray-200 hover:bg-gray-100'
            }`}
            title="Move Question Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg border border-transparent text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-colors ml-1"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Question Fields */}
      <div className="space-y-4">
        {/* Question Text & Type Selector in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Question Title / Prompt <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={question.question_text || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="e.g. How satisfied are you with our onboarding experience?"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Answer Format
            </label>
            <div className="relative">
              <select
                value={question.question_type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all font-medium text-gray-800"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Options for Choice Questions */}
        {isChoiceType && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Options {question.question_type === 'single_choice' ? '(Radio Choices)' : '(Checkbox Choices)'}
            </label>
            <div className="space-y-2.5 pl-1">
              {(question.options || []).map((opt, optIdx) => (
                <div key={opt.id || optIdx} className="flex items-center gap-2 group">
                  <span className="text-xs font-mono text-gray-400 w-4 text-center">
                    {optIdx + 1}.
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={opt.option_text || ''}
                      onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={(question.options || []).length <= 2}
                    onClick={() => handleRemoveOption(optIdx)}
                    className={`p-2 rounded-lg transition-colors ${
                      (question.options || []).length <= 2
                        ? 'text-gray-200 cursor-not-allowed'
                        : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Remove Option"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddOption}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors border border-dashed border-brand-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Option
              </button>
            </div>
          </div>
        )}

        {/* Rating Scale Indicator */}
        {question.question_type === 'rating' && (
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Standard 5-point rating scale (1 = Poor to 5 = Excellent).</span>
            </div>
            <span className="font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
              1 to 5 Stars
            </span>
          </div>
        )}

        {/* Text Input Indicator */}
        {question.question_type === 'text' && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            <span>Respondents will have a clean responsive textarea for multi-line text input.</span>
          </div>
        )}

        {/* Footer: Required toggle switch */}
        <div className="pt-3 flex items-center justify-between border-t border-gray-100 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!question.is_required}
                onChange={handleRequiredToggle}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                  question.is_required ? 'bg-brand-600' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                    question.is_required ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="font-medium text-gray-700">
                Required Question {question.is_required ? '(Must be answered)' : '(Optional)'}
              </span>
            </label>
          </div>

          <div className="text-gray-400 text-[11px]">
            {isChoiceType
              ? `${(question.options || []).length} Options`
              : question.question_type === 'rating'
              ? 'Rating 1-5'
              : 'Text Response'}
          </div>
        </div>
      </div>
    </div>
  );
}
