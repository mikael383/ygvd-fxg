export const REGISTERED_ADMINS = [
  {
    id: 'admin-001-uuid',
    email: 'admin@pulsesurveys.io',
    password: 'admin123',
    role: 'admin',
    user_metadata: { full_name: 'Alex Vance (Lead Admin)', role: 'admin' },
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'admin-002-uuid',
    email: 'director@pulsesurveys.io',
    password: 'admin123',
    role: 'admin',
    user_metadata: { full_name: 'Morgan Blake (Director)', role: 'admin' },
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_REGULAR_USER = {
  id: 'user-regular-001',
  email: 'user@pulsesurveys.io',
  password: 'user123',
  role: 'user',
  user_metadata: { full_name: 'Jordan Lee (Respondent)', role: 'user' },
  created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
};

// Default creator user is the primary admin
export const DEMO_USER = REGISTERED_ADMINS[0];

export const INITIAL_DEMO_SURVEYS = [
  {
    id: 'demo-survey-csat-101',
    user_id: 'admin-001-uuid',
    title: 'Customer Satisfaction & Product Feedback 2026',
    description: 'We are committed to building the best survey platform possible. Please share your candid feedback so we can continue improving your experience.',
    status: 'published',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-survey-wellness-202',
    user_id: 'demo-user-0001-uuid',
    title: 'Team Culture & Workplace Pulse Survey',
    description: 'Quarterly check-in on work-life balance, cross-functional collaboration, and team health. Your answers are completely confidential.',
    status: 'published',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-survey-concept-303',
    user_id: 'demo-user-0001-uuid',
    title: 'AI Insights & Automated Reporting Feedback',
    description: 'Early prototype questionnaire to validate our upcoming automated anomaly detection and executive summary features.',
    status: 'draft',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-survey-benchmark-404',
    user_id: 'demo-user-0001-uuid',
    title: '2025 Annual Developer Tooling Benchmark',
    description: 'Industry-wide benchmark tracking tooling preferences, deployment frequency, and workflow satisfaction.',
    status: 'closed',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_DEMO_QUESTIONS = [
  // Questions for demo-survey-csat-101
  {
    id: 'q-csat-1',
    survey_id: 'demo-survey-csat-101',
    question_text: 'Overall, how satisfied are you with our survey platform?',
    question_type: 'rating',
    is_required: true,
    order_index: 0,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q-csat-2',
    survey_id: 'demo-survey-csat-101',
    question_text: 'How frequently do you log into and use PulseSurveys?',
    question_type: 'single_choice',
    is_required: true,
    order_index: 1,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q-csat-3',
    survey_id: 'demo-survey-csat-101',
    question_text: 'Which platform capabilities bring the most value to your team?',
    question_type: 'multiple_choice',
    is_required: false,
    order_index: 2,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q-csat-4',
    survey_id: 'demo-survey-csat-101',
    question_text: 'What is the primary goal or project you are currently solving with surveys?',
    question_type: 'text',
    is_required: false,
    order_index: 3,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q-csat-5',
    survey_id: 'demo-survey-csat-101',
    question_text: 'Any additional feedback, requested integrations, or suggestions for us?',
    question_type: 'text',
    is_required: false,
    order_index: 4,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Questions for demo-survey-wellness-202
  {
    id: 'q-well-1',
    survey_id: 'demo-survey-wellness-202',
    question_text: 'How would you rate your team communication and clarity this month?',
    question_type: 'rating',
    is_required: true,
    order_index: 0,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'q-well-2',
    survey_id: 'demo-survey-wellness-202',
    question_text: 'What is your preferred working model?',
    question_type: 'single_choice',
    is_required: true,
    order_index: 1,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Questions for demo-survey-concept-303
  {
    id: 'q-concept-1',
    survey_id: 'demo-survey-concept-303',
    question_text: 'How valuable would automated natural language summaries of feedback be to you?',
    question_type: 'rating',
    is_required: true,
    order_index: 0,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_DEMO_OPTIONS = [
  // Options for q-csat-2 (Single Choice: Frequency)
  { id: 'opt-freq-1', question_id: 'q-csat-2', option_text: 'Daily', order_index: 0 },
  { id: 'opt-freq-2', question_id: 'q-csat-2', option_text: '2-3 times a week', order_index: 1 },
  { id: 'opt-freq-3', question_id: 'q-csat-2', option_text: 'Once a month', order_index: 2 },
  { id: 'opt-freq-4', question_id: 'q-csat-2', option_text: 'Only during major launches', order_index: 3 },

  // Options for q-csat-3 (Multiple Choice: Capabilities)
  { id: 'opt-feat-1', question_id: 'q-csat-3', option_text: 'Clean Question Builder', order_index: 0 },
  { id: 'opt-feat-2', question_id: 'q-csat-3', option_text: 'Real-time Visual Analytics', order_index: 1 },
  { id: 'opt-feat-2b', question_id: 'q-csat-3', option_text: 'Fast Mobile Respondent Form', order_index: 2 },
  { id: 'opt-feat-3', question_id: 'q-csat-3', option_text: 'Export to CSV / Spreadsheets', order_index: 3 },
  { id: 'opt-feat-4', question_id: 'q-csat-3', option_text: 'Public Link Instant Sharing', order_index: 4 },

  // Options for q-well-2 (Single Choice: Workplace)
  { id: 'opt-work-1', question_id: 'q-well-2', option_text: 'Fully Remote', order_index: 0 },
  { id: 'opt-work-2', question_id: 'q-well-2', option_text: 'Hybrid (1-2 office days)', order_index: 1 },
  { id: 'opt-work-3', question_id: 'q-well-2', option_text: 'Office-centric', order_index: 2 },
];

export const INITIAL_DEMO_SUBMISSIONS = [
  {
    id: 'sub-csat-01',
    survey_id: 'demo-survey-csat-101',
    submitted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-csat-02',
    survey_id: 'demo-survey-csat-101',
    submitted_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-csat-03',
    survey_id: 'demo-survey-csat-101',
    submitted_at: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-csat-04',
    survey_id: 'demo-survey-csat-101',
    submitted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-csat-05',
    survey_id: 'demo-survey-csat-101',
    submitted_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-csat-06',
    survey_id: 'demo-survey-csat-101',
    submitted_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
  },
  // Submissions for wellness
  {
    id: 'sub-well-01',
    survey_id: 'demo-survey-wellness-202',
    submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sub-well-02',
    survey_id: 'demo-survey-wellness-202',
    submitted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  }
];

export const INITIAL_DEMO_ANSWERS = [
  // Submission 1 (CSAT)
  {
    id: 'ans-01-1',
    submission_id: 'sub-csat-01',
    question_id: 'q-csat-1',
    rating_value: 5,
  },
  {
    id: 'ans-01-2',
    submission_id: 'sub-csat-01',
    question_id: 'q-csat-2',
    selected_option_id: 'opt-freq-1', // Daily
  },
  {
    id: 'ans-01-3',
    submission_id: 'sub-csat-01',
    question_id: 'q-csat-3',
    selected_options: ['opt-feat-1', 'opt-feat-2', 'opt-feat-3'],
  },
  {
    id: 'ans-01-4',
    submission_id: 'sub-csat-01',
    question_id: 'q-csat-4',
    answer_text: 'Collecting post-demo feedback from sales prospects and quarterly client satisfaction.',
  },
  {
    id: 'ans-01-5',
    submission_id: 'sub-csat-01',
    question_id: 'q-csat-5',
    answer_text: 'The UI is remarkably clean and lightning fast. Love the CSV export feature!',
  },

  // Submission 2 (CSAT)
  {
    id: 'ans-02-1',
    submission_id: 'sub-csat-02',
    question_id: 'q-csat-1',
    rating_value: 4,
  },
  {
    id: 'ans-02-2',
    submission_id: 'sub-csat-02',
    question_id: 'q-csat-2',
    selected_option_id: 'opt-freq-2', // 2-3 times
  },
  {
    id: 'ans-02-3',
    submission_id: 'sub-csat-02',
    question_id: 'q-csat-3',
    selected_options: ['opt-feat-2', 'opt-feat-4'],
  },
  {
    id: 'ans-02-4',
    submission_id: 'sub-csat-02',
    question_id: 'q-csat-4',
    answer_text: 'Gathering feedback after developer community workshops.',
  },
  {
    id: 'ans-02-5',
    submission_id: 'sub-csat-02',
    question_id: 'q-csat-5',
    answer_text: 'Would love dark mode support and webhook notifications on new submissions.',
  },

  // Submission 3 (CSAT)
  {
    id: 'ans-03-1',
    submission_id: 'sub-csat-03',
    question_id: 'q-csat-1',
    rating_value: 5,
  },
  {
    id: 'ans-03-2',
    submission_id: 'sub-csat-03',
    question_id: 'q-csat-2',
    selected_option_id: 'opt-freq-1', // Daily
  },
  {
    id: 'ans-03-3',
    submission_id: 'sub-csat-03',
    question_id: 'q-csat-3',
    selected_options: ['opt-feat-1', 'opt-feat-2b', 'opt-feat-3'],
  },
  {
    id: 'ans-03-4',
    submission_id: 'sub-csat-03',
    question_id: 'q-csat-4',
    answer_text: 'Product research for our mobile app redesign.',
  },

  // Submission 4 (CSAT)
  {
    id: 'ans-04-1',
    submission_id: 'sub-csat-04',
    question_id: 'q-csat-1',
    rating_value: 4,
  },
  {
    id: 'ans-04-2',
    submission_id: 'sub-csat-04',
    question_id: 'q-csat-2',
    selected_option_id: 'opt-freq-2', // 2-3 times
  },
  {
    id: 'ans-04-3',
    submission_id: 'sub-csat-04',
    question_id: 'q-csat-3',
    selected_options: ['opt-feat-1', 'opt-feat-4'],
  },
  {
    id: 'ans-04-4',
    submission_id: 'sub-csat-04',
    question_id: 'q-csat-4',
    answer_text: 'HR pulse surveys and employee onboarding evaluation.',
  },
  {
    id: 'ans-04-5',
    submission_id: 'sub-csat-04',
    question_id: 'q-csat-5',
    answer_text: 'Clean and uncluttered compared to Typeform or Google Forms. Great job!',
  },

  // Submission 5 (CSAT)
  {
    id: 'ans-05-1',
    submission_id: 'sub-csat-05',
    question_id: 'q-csat-1',
    rating_value: 5,
  },
  {
    id: 'ans-05-2',
    submission_id: 'sub-csat-05',
    question_id: 'q-csat-2',
    selected_option_id: 'opt-freq-1', // Daily
  },
  {
    id: 'ans-05-3',
    submission_id: 'sub-csat-05',
    question_id: 'q-csat-3',
    selected_options: ['opt-feat-1', 'opt-feat-2', 'opt-feat-2b', 'opt-feat-3', 'opt-feat-4'],
  },

  // Submission 6 (CSAT)
  {
    id: 'ans-06-1',
    submission_id: 'sub-csat-06',
    question_id: 'q-csat-1',
    rating_value: 4,
  },
  {
    id: 'ans-06-2',
    submission_id: 'sub-csat-06',
    question_id: 'q-csat-2',
    selected_option_id: 'opt-freq-3', // Once a month
  },
  {
    id: 'ans-06-3',
    submission_id: 'sub-csat-06',
    question_id: 'q-csat-3',
    selected_options: ['opt-feat-2', 'opt-feat-3'],
  },
  {
    id: 'ans-06-4',
    submission_id: 'sub-csat-06',
    question_id: 'q-csat-4',
    answer_text: 'Customer retention research and churn exit interviews.',
  },

  // Submission for wellness
  {
    id: 'ans-well-1',
    submission_id: 'sub-well-01',
    question_id: 'q-well-1',
    rating_value: 5,
  },
  {
    id: 'ans-well-2',
    submission_id: 'sub-well-01',
    question_id: 'q-well-2',
    selected_option_id: 'opt-work-1', // Fully Remote
  },
  {
    id: 'ans-well-3',
    submission_id: 'sub-well-02',
    question_id: 'q-well-1',
    rating_value: 4,
  },
  {
    id: 'ans-well-4',
    submission_id: 'sub-well-02',
    question_id: 'q-well-2',
    selected_option_id: 'opt-work-2', // Hybrid
  },
];
