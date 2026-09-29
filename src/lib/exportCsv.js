function escapeCsvField(field) {
  if (field === null || field === undefined) return '""';
  const stringField = String(field);
  // If field contains comma, quote, or newline, escape quotes and wrap in quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return `"${stringField}"`;
}

export function exportSurveyToCsv(survey, analytics) {
  if (!survey || !analytics) return;

  const { questions = [] } = survey;
  const { submissions = [], rawAnswers = [] } = analytics;

  // Build CSV Header row
  const headers = ['Submission ID', 'Submitted At'];
  questions.forEach((q, idx) => {
    headers.push(`Q${idx + 1}: ${q.question_text.replace(/\r?\n|\r/g, ' ')}`);
  });

  const rows = [];
  rows.push(headers.map(escapeCsvField).join(','));

  // Build rows for each submission
  submissions.forEach(sub => {
    const row = [sub.id, new Date(sub.submitted_at).toISOString()];

    questions.forEach(q => {
      const ans = rawAnswers.find(a => a.submission_id === sub.id && a.question_id === q.id);

      if (!ans) {
        row.push('');
        return;
      }

      if (q.question_type === 'single_choice') {
        const option = q.options?.find(opt => opt.id === ans.selected_option_id);
        row.push(option ? option.option_text : '');
      } else if (q.question_type === 'multiple_choice') {
        if (Array.isArray(ans.selected_options) && ans.selected_options.length > 0) {
          const selectedLabels = ans.selected_options
            .map(optId => q.options?.find(o => o.id === optId)?.option_text)
            .filter(Boolean);
          row.push(selectedLabels.join('; '));
        } else {
          row.push('');
        }
      } else if (q.question_type === 'rating') {
        row.push(ans.rating_value !== null && ans.rating_value !== undefined ? `${ans.rating_value} / 5` : '');
      } else if (q.question_type === 'text') {
        row.push(ans.answer_text || '');
      } else {
        row.push('');
      }
    });

    rows.push(row.map(escapeCsvField).join(','));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n'); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const sanitizedTitle = (survey.title || 'survey')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedTitle}_responses_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
