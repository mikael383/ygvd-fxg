import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || 'draft').toLowerCase();

  const configs = {
    published: {
      label: 'Published',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    draft: {
      label: 'Draft',
      bg: 'bg-slate-100 border-slate-200 text-slate-700',
      dot: 'bg-slate-400',
    },
    closed: {
      label: 'Closed',
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      dot: 'bg-amber-500',
    },
  };

  const current = configs[normalized] || configs.draft;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
