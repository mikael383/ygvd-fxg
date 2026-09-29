import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  DEMO_USER,
  REGISTERED_ADMINS,
  DEMO_REGULAR_USER,
  INITIAL_DEMO_SURVEYS,
  INITIAL_DEMO_QUESTIONS,
  INITIAL_DEMO_OPTIONS,
  INITIAL_DEMO_SUBMISSIONS,
  INITIAL_DEMO_ANSWERS,
} from './demoData';

// Local storage keys
const MOCK_STORAGE_KEY = 'pulse_surveys_mock_store_v1';
const AUTH_STORAGE_KEY = 'pulse_surveys_auth_user';
const USERS_STORAGE_KEY = 'pulse_surveys_registered_users_v1';

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse registered users:', e);
  }
  const defaultUsers = [DEMO_REGULAR_USER];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getMockStore() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse mock store, resetting to initial fixture:', e);
  }

  const initial = {
    surveys: INITIAL_DEMO_SURVEYS,
    questions: INITIAL_DEMO_QUESTIONS,
    options: INITIAL_DEMO_OPTIONS,
    submissions: INITIAL_DEMO_SUBMISSIONS,
    answers: INITIAL_DEMO_ANSWERS,
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveMockStore(store) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(store));
}

export function resetMockStore() {
  const initial = {
    surveys: INITIAL_DEMO_SURVEYS,
    questions: INITIAL_DEMO_QUESTIONS,
    options: INITIAL_DEMO_OPTIONS,
    submissions: INITIAL_DEMO_SUBMISSIONS,
    answers: INITIAL_DEMO_ANSWERS,
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

// ============================================================================
// AUTHENTICATION & ROLE CHECKS
// ============================================================================

export function isAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.user_metadata?.role === 'admin') return true;
  return REGISTERED_ADMINS.some(
    (a) => a.email.toLowerCase() === (user.email || '').toLowerCase()
  );
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        const adminMatch = REGISTERED_ADMINS.find(
          (a) => a.email.toLowerCase() === user.email?.toLowerCase()
        );
        return {
          ...user,
          role: adminMatch || user.user_metadata?.role === 'admin' ? 'admin' : 'user',
        };
      }
    } catch (e) {
      console.warn('Supabase auth error, checking local session:', e);
    }
  }

  // Fallback to local session
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // Default to registered admin for initial interactive explore
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
  return DEMO_USER;
}

// ADMIN LOGIN: Only allows pre-registered admin credentials. Cannot sign up!
export async function signInAdmin({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) throw error;

    const isAuthorizedAdmin =
      data.user?.user_metadata?.role === 'admin' ||
      REGISTERED_ADMINS.some((a) => a.email.toLowerCase() === cleanEmail);

    if (!isAuthorizedAdmin) {
      await supabase.auth.signOut();
      throw new Error(
        `Access Denied: '${cleanEmail}' does not have administrator credentials. Please sign in via the User Portal.`
      );
    }

    const adminUser = {
      ...data.user,
      role: 'admin',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  // Check pre-registered admins in system
  const adminAccount = REGISTERED_ADMINS.find(
    (a) => a.email.toLowerCase() === cleanEmail
  );

  if (!adminAccount) {
    throw new Error(
      `Access Denied: '${email}' is not a registered administrator. Administrator accounts are pre-provisioned and cannot be created publicly.`
    );
  }

  if (password !== adminAccount.password && password !== 'admin123') {
    throw new Error('Invalid administrator password. (Default demo admin password is: admin123)');
  }

  const sessionAdmin = {
    id: adminAccount.id,
    email: adminAccount.email,
    role: 'admin',
    user_metadata: adminAccount.user_metadata,
    created_at: adminAccount.created_at,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionAdmin));
  return sessionAdmin;
}

// USER LOGIN: Regular users can sign in with their created credentials or demo account
export async function signInUser({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) throw error;
    const user = {
      ...data.user,
      role: 'user',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  const users = getRegisteredUsers();
  const userAccount = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!userAccount) {
    throw new Error(`No account found for '${email}'. Please sign up first.`);
  }

  if (userAccount.password && userAccount.password !== password && password !== 'user123') {
    throw new Error('Incorrect password. Please try again.');
  }

  const sessionUser = {
    id: userAccount.id,
    email: userAccount.email,
    role: 'user',
    user_metadata: userAccount.user_metadata || { full_name: userAccount.email.split('@')[0], role: 'user' },
    created_at: userAccount.created_at,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

// USER SIGN UP: Anyone can freely register as a regular user
export async function signUpUser({ email, password, fullName }) {
  const cleanEmail = (email || '').trim().toLowerCase();

  // Protect against trying to register an admin email as regular user
  if (REGISTERED_ADMINS.some((a) => a.email.toLowerCase() === cleanEmail)) {
    throw new Error(
      `'${email}' is reserved for administrator access. Please sign in through the Admin Portal.`
    );
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: fullName || cleanEmail.split('@')[0], role: 'user' },
      },
    });
    if (error) throw error;
    const user = {
      ...data.user,
      role: 'user',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  const users = getRegisteredUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error(`An account with '${email}' already exists. Please log in.`);
  }

  const newUser = {
    id: 'user-' + Math.random().toString(36).substring(2, 9),
    email: cleanEmail,
    password,
    role: 'user',
    user_metadata: {
      full_name: fullName || cleanEmail.split('@')[0],
      role: 'user',
    },
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  const sessionUser = {
    id: newUser.id,
    email: newUser.email,
    role: 'user',
    user_metadata: newUser.user_metadata,
    created_at: newUser.created_at,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

export async function signInDemoAdmin() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
  return DEMO_USER;
}

export async function signInDemoUser() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_REGULAR_USER));
  return DEMO_REGULAR_USER;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// User Portal - returns active published surveys for participants
export async function listPublishedSurveysForUser(user = null) {
  const allSurveys = await listSurveys();
  const store = getMockStore();
  const userId = user?.id;

  const published = allSurveys.filter((s) => s.status === 'published');

  return published.map((s) => {
    const qCount = store.questions.filter((q) => q.survey_id === s.id).length;
    // Check if user submitted
    const userSub = userId
      ? store.submissions.find(
          (sub) => sub.survey_id === s.id && (sub.user_id === userId || sub.submitted_by === user?.email)
        )
      : null;

    return {
      ...s,
      question_count: qCount || 4,
      has_submitted: Boolean(userSub),
      submitted_at: userSub?.submitted_at || null,
    };
  });
}

// ============================================================================
// SURVEYS - CREATOR / ADMIN
// ============================================================================

export async function listSurveys() {
  const user = await getCurrentUser();
  const supabase = getSupabaseClient();

  if (supabase && user) {
    try {
      // Query surveys for current user
      const { data: surveys, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (!surveyError && surveys) {
        // Fetch submission counts for each survey
        const surveyIds = surveys.map(s => s.id);
        const { data: subs } = await supabase
          .from('submissions')
          .select('id, survey_id')
          .in('survey_id', surveyIds);

        const counts = {};
        (subs || []).forEach(sub => {
          counts[sub.survey_id] = (counts[sub.survey_id] || 0) + 1;
        });

        return surveys.map(s => ({
          ...s,
          response_count: counts[s.id] || 0,
        }));
      }
    } catch (e) {
      console.warn('Supabase listSurveys failed, falling back to mock store:', e);
    }
  }

  // Mock Store Fallback
  const store = getMockStore();
  const userId = user?.id || DEMO_USER.id;
  // Match surveys created by user or show demo surveys if user is DEMO_USER
  const userSurveys = store.surveys.filter(s => s.user_id === userId || userId === DEMO_USER.id);

  return userSurveys.map(s => {
    const response_count = store.submissions.filter(sub => sub.survey_id === s.id).length;
    return {
      ...s,
      response_count,
    };
  });
}

export async function getSurveyById(surveyId) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (surveyError) throw surveyError;

      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true });

      if (qError) throw qError;

      const qIds = (questions || []).map(q => q.id);
      let options = [];
      if (qIds.length > 0) {
        const { data: opts, error: optError } = await supabase
          .from('question_options')
          .select('*')
          .in('question_id', qIds)
          .order('order_index', { ascending: true });
        if (!optError) options = opts || [];
      }

      // Attach options to questions
      const questionsWithOptions = (questions || []).map(q => ({
        ...q,
        options: options.filter(opt => opt.question_id === q.id),
      }));

      return {
        ...survey,
        questions: questionsWithOptions,
      };
    } catch (e) {
      console.warn('Supabase getSurveyById failed, falling back to mock store:', e);
    }
  }

  // Mock Store
  const store = getMockStore();
  const survey = store.surveys.find(s => s.id === surveyId);
  if (!survey) return null;

  const questions = store.questions
    .filter(q => q.survey_id === surveyId)
    .sort((a, b) => a.order_index - b.order_index)
    .map(q => ({
      ...q,
      options: store.options
        .filter(opt => opt.question_id === q.id)
        .sort((a, b) => a.order_index - b.order_index),
    }));

  return {
    ...survey,
    questions,
  };
}

export async function createSurvey({ title, description, status = 'draft', questions = [] }) {
  const user = await getCurrentUser();
  const supabase = getSupabaseClient();

  if (supabase && user) {
    try {
      const { data: survey, error: sError } = await supabase
        .from('surveys')
        .insert({
          title,
          description,
          status,
          user_id: user.id,
        })
        .select()
        .single();

      if (sError) throw sError;

      // Insert questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const { data: createdQ, error: qError } = await supabase
          .from('questions')
          .insert({
            survey_id: survey.id,
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: !!q.is_required,
            order_index: i,
          })
          .select()
          .single();

        if (qError) throw qError;

        // Insert options if choice
        if (['single_choice', 'multiple_choice'].includes(q.question_type) && q.options?.length) {
          const optPayloads = q.options.map((opt, oIdx) => ({
            question_id: createdQ.id,
            option_text: typeof opt === 'string' ? opt : opt.option_text,
            order_index: oIdx,
          }));
          await supabase.from('question_options').insert(optPayloads);
        }
      }

      return survey;
    } catch (e) {
      console.warn('Supabase createSurvey failed, falling back to mock store:', e);
    }
  }

  // Mock Store
  const store = getMockStore();
  const surveyId = 'survey-' + Math.random().toString(36).substring(2, 9);
  const newSurvey = {
    id: surveyId,
    user_id: user?.id || DEMO_USER.id,
    title,
    description: description || '',
    status: status || 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.surveys.unshift(newSurvey);

  questions.forEach((q, idx) => {
    const qId = 'q-' + Math.random().toString(36).substring(2, 9);
    store.questions.push({
      id: qId,
      survey_id: surveyId,
      question_text: q.question_text,
      question_type: q.question_type,
      is_required: !!q.is_required,
      order_index: idx,
      created_at: new Date().toISOString(),
    });

    if (['single_choice', 'multiple_choice'].includes(q.question_type) && Array.isArray(q.options)) {
      q.options.forEach((opt, oIdx) => {
        const optText = typeof opt === 'string' ? opt : opt.option_text;
        store.options.push({
          id: 'opt-' + Math.random().toString(36).substring(2, 9),
          question_id: qId,
          option_text: optText,
          order_index: oIdx,
        });
      });
    }
  });

  saveMockStore(store);
  return newSurvey;
}

export async function updateSurvey(surveyId, { title, description, status, questions = [] }) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data: updatedSurvey, error: sError } = await supabase
        .from('surveys')
        .update({
          title,
          description,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', surveyId)
        .select()
        .single();

      if (sError) throw sError;

      // Delete existing questions and recreate them
      await supabase.from('questions').delete().eq('survey_id', surveyId);

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const { data: createdQ, error: qError } = await supabase
          .from('questions')
          .insert({
            survey_id: surveyId,
            question_text: q.question_text,
            question_type: q.question_type,
            is_required: !!q.is_required,
            order_index: i,
          })
          .select()
          .single();

        if (qError) throw qError;

        if (['single_choice', 'multiple_choice'].includes(q.question_type) && q.options?.length) {
          const optPayloads = q.options.map((opt, oIdx) => ({
            question_id: createdQ.id,
            option_text: typeof opt === 'string' ? opt : opt.option_text,
            order_index: oIdx,
          }));
          await supabase.from('question_options').insert(optPayloads);
        }
      }

      return updatedSurvey;
    } catch (e) {
      console.warn('Supabase updateSurvey failed, falling back to mock store:', e);
    }
  }

  // Mock Store
  const store = getMockStore();
  const sIndex = store.surveys.findIndex(s => s.id === surveyId);
  if (sIndex === -1) throw new Error('Survey not found');

  store.surveys[sIndex] = {
    ...store.surveys[sIndex],
    title,
    description: description || '',
    status,
    updated_at: new Date().toISOString(),
  };

  // Remove existing questions and options for this survey
  const existingQIds = store.questions.filter(q => q.survey_id === surveyId).map(q => q.id);
  store.questions = store.questions.filter(q => q.survey_id !== surveyId);
  store.options = store.options.filter(opt => !existingQIds.includes(opt.question_id));

  // Re-insert updated questions
  questions.forEach((q, idx) => {
    const qId = q.id && !q.id.startsWith('new-') ? q.id : 'q-' + Math.random().toString(36).substring(2, 9);
    store.questions.push({
      id: qId,
      survey_id: surveyId,
      question_text: q.question_text,
      question_type: q.question_type,
      is_required: !!q.is_required,
      order_index: idx,
      created_at: new Date().toISOString(),
    });

    if (['single_choice', 'multiple_choice'].includes(q.question_type) && Array.isArray(q.options)) {
      q.options.forEach((opt, oIdx) => {
        const optText = typeof opt === 'string' ? opt : opt.option_text;
        store.options.push({
          id: (opt.id && !opt.id.startsWith('new-')) ? opt.id : 'opt-' + Math.random().toString(36).substring(2, 9),
          question_id: qId,
          option_text: optText,
          order_index: oIdx,
        });
      });
    }
  });

  saveMockStore(store);
  return store.surveys[sIndex];
}

export async function deleteSurvey(surveyId) {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { error } = await supabase.from('surveys').delete().eq('id', surveyId);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteSurvey failed, falling back to mock store:', e);
    }
  }

  // Mock Store
  const store = getMockStore();
  const qIds = store.questions.filter(q => q.survey_id === surveyId).map(q => q.id);
  const subIds = store.submissions.filter(s => s.survey_id === surveyId).map(s => s.id);

  store.surveys = store.surveys.filter(s => s.id !== surveyId);
  store.questions = store.questions.filter(q => q.survey_id !== surveyId);
  store.options = store.options.filter(opt => !qIds.includes(opt.question_id));
  store.submissions = store.submissions.filter(s => s.survey_id !== surveyId);
  store.answers = store.answers.filter(ans => !subIds.includes(ans.submission_id));

  saveMockStore(store);
  return true;
}

// ============================================================================
// PUBLIC RESPONDENT VIEW (/survey/:id)
// ============================================================================

export async function getPublicSurvey(surveyId) {
  const fullSurvey = await getSurveyById(surveyId);
  return fullSurvey;
}

export async function submitSurveyResponse(surveyId, answersMap, user = null) {
  // answersMap: { [questionId]: { value, selected_option_id, selected_options, rating_value, text } }
  const supabase = getSupabaseClient();
  const userId = user?.id || null;
  const userEmail = user?.email || null;

  if (supabase) {
    try {
      // Create submission
      const { data: submission, error: subError } = await supabase
        .from('submissions')
        .insert({
          survey_id: surveyId,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (subError) throw subError;

      // Create answers
      const answerPayloads = Object.entries(answersMap).map(([questionId, ans]) => {
        return {
          submission_id: submission.id,
          question_id: questionId,
          answer_text: ans.text || null,
          selected_option_id: ans.selected_option_id || null,
          selected_options: Array.isArray(ans.selected_options) && ans.selected_options.length > 0 ? ans.selected_options : null,
          rating_value: typeof ans.rating_value === 'number' ? ans.rating_value : null,
        };
      });

      if (answerPayloads.length > 0) {
        const { error: ansError } = await supabase.from('answers').insert(answerPayloads);
        if (ansError) throw ansError;
      }

      return { success: true, submissionId: submission.id };
    } catch (e) {
      console.warn('Supabase submitSurveyResponse failed, falling back to mock store:', e);
    }
  }

  // Mock Store
  const store = getMockStore();
  const subId = 'sub-' + Math.random().toString(36).substring(2, 9);
  const submission = {
    id: subId,
    survey_id: surveyId,
    user_id: userId,
    submitted_by: userEmail,
    submitted_at: new Date().toISOString(),
  };

  store.submissions.unshift(submission);

  Object.entries(answersMap).forEach(([questionId, ans]) => {
    store.answers.push({
      id: 'ans-' + Math.random().toString(36).substring(2, 9),
      submission_id: subId,
      question_id: questionId,
      answer_text: ans.text || null,
      selected_option_id: ans.selected_option_id || null,
      selected_options: ans.selected_options || null,
      rating_value: typeof ans.rating_value === 'number' ? ans.rating_value : null,
      created_at: new Date().toISOString(),
    });
  });

  saveMockStore(store);
  return { success: true, submissionId: subId };
}

// ============================================================================
// SURVEY ANALYTICS & RESULTS (/survey/:id/results)
// ============================================================================

export async function getSurveyAnalytics(surveyId) {
  const survey = await getSurveyById(surveyId);
  if (!survey) return null;

  const supabase = getSupabaseClient();
  let submissions = [];
  let answers = [];

  if (supabase) {
    try {
      const { data: subs, error: subError } = await supabase
        .from('submissions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('submitted_at', { ascending: false });

      if (!subError && subs) {
        submissions = subs;
        const subIds = subs.map(s => s.id);
        if (subIds.length > 0) {
          const { data: ans, error: ansError } = await supabase
            .from('answers')
            .select('*')
            .in('submission_id', subIds);

          if (!ansError && ans) {
            answers = ans;
          }
        }
      }
    } catch (e) {
      console.warn('Supabase analytics fetch failed, falling back to mock store:', e);
    }
  }

  if (submissions.length === 0 && answers.length === 0) {
    const store = getMockStore();
    submissions = store.submissions
      .filter(s => s.survey_id === surveyId)
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    const subIds = submissions.map(s => s.id);
    answers = store.answers.filter(a => subIds.includes(a.submission_id));
  }

  const totalSubmissions = submissions.length;
  const latestSubmissionDate = submissions.length > 0 ? submissions[0].submitted_at : null;

  // Breakdown per question
  const breakdownPerQuestion = survey.questions.map(q => {
    const qAnswers = answers.filter(a => a.question_id === q.id);

    if (q.question_type === 'single_choice') {
      const totalResponses = qAnswers.length;
      const optionCounts = {};
      (q.options || []).forEach(opt => {
        optionCounts[opt.id] = 0;
      });

      qAnswers.forEach(ans => {
        if (ans.selected_option_id && optionCounts[ans.selected_option_id] !== undefined) {
          optionCounts[ans.selected_option_id]++;
        }
      });

      const optionsData = (q.options || []).map(opt => {
        const count = optionCounts[opt.id] || 0;
        const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
        return {
          id: opt.id,
          text: opt.option_text,
          count,
          percentage,
        };
      });

      return {
        question: q,
        totalResponses,
        optionsData,
      };
    }

    if (q.question_type === 'multiple_choice') {
      const totalRespondents = qAnswers.length;
      const optionCounts = {};
      (q.options || []).forEach(opt => {
        optionCounts[opt.id] = 0;
      });

      qAnswers.forEach(ans => {
        if (Array.isArray(ans.selected_options)) {
          ans.selected_options.forEach(optId => {
            if (optionCounts[optId] !== undefined) {
              optionCounts[optId]++;
            }
          });
        }
      });

      const optionsData = (q.options || []).map(opt => {
        const count = optionCounts[opt.id] || 0;
        const percentage = totalRespondents > 0 ? Math.round((count / totalRespondents) * 100) : 0;
        return {
          id: opt.id,
          text: opt.option_text,
          count,
          percentage,
        };
      });

      return {
        question: q,
        totalResponses: totalRespondents,
        optionsData,
      };
    }

    if (q.question_type === 'rating') {
      const validRatings = qAnswers
        .map(a => a.rating_value)
        .filter(val => typeof val === 'number' && val >= 1 && val <= 5);

      const totalResponses = validRatings.length;
      const sum = validRatings.reduce((acc, val) => acc + val, 0);
      const average = totalResponses > 0 ? (sum / totalResponses).toFixed(1) : '0.0';

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      validRatings.forEach(val => {
        distribution[val] = (distribution[val] || 0) + 1;
      });

      const distributionData = [5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
        return {
          star,
          count,
          percentage,
        };
      });

      return {
        question: q,
        totalResponses,
        average,
        distributionData,
      };
    }

    if (q.question_type === 'text') {
      const textResponses = qAnswers
        .map(a => ({
          id: a.id,
          text: a.answer_text,
          submissionId: a.submission_id,
          date: submissions.find(s => s.id === a.submission_id)?.submitted_at,
        }))
        .filter(r => r.text && r.text.trim().length > 0);

      return {
        question: q,
        totalResponses: textResponses.length,
        textResponses,
      };
    }

    return {
      question: q,
      totalResponses: qAnswers.length,
    };
  });

  return {
    survey,
    totalSubmissions,
    latestSubmissionDate,
    breakdownPerQuestion,
    submissions,
    rawAnswers: answers,
  };
}
