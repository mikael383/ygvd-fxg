-- ==============================================================================
-- PULSE SURVEY APPLICATION - SUPABASE DATABASE MIGRATION SCRIPT
-- ==============================================================================
-- Run this in your Supabase SQL Editor to initialize the database tables,
-- foreign keys, Row Level Security (RLS) policies, and performance indexes.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'closed')) DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'rating')),
    is_required BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create question_options table
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create answers table
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    selected_options UUID[] DEFAULT NULL,
    rating_value INTEGER CHECK (rating_value IS NULL OR (rating_value >= 1 AND rating_value <= 5)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON public.surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON public.questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_survey_id ON public.submissions(survey_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission_id ON public.answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. SURVEYS POLICIES
-- ------------------------------------------------------------------------------
-- Owners have full CRUD over their own surveys
CREATE POLICY "Owners can view own surveys"
ON public.surveys FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners can insert surveys"
ON public.surveys FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own surveys"
ON public.surveys FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete own surveys"
ON public.surveys FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Public (anon & authenticated) can view published surveys
CREATE POLICY "Public can view published surveys"
ON public.surveys FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- ------------------------------------------------------------------------------
-- B. QUESTIONS POLICIES
-- ------------------------------------------------------------------------------
-- Owners have full CRUD over questions in their surveys
CREATE POLICY "Owners can manage questions"
ON public.questions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.surveys
        WHERE surveys.id = questions.survey_id
          AND surveys.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.surveys
        WHERE surveys.id = questions.survey_id
          AND surveys.user_id = auth.uid()
    )
);

-- Public can view questions of published surveys
CREATE POLICY "Public can view questions of published surveys"
ON public.questions FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.surveys
        WHERE surveys.id = questions.survey_id
          AND surveys.status = 'published'
    )
);

-- ------------------------------------------------------------------------------
-- C. QUESTION OPTIONS POLICIES
-- ------------------------------------------------------------------------------
-- Owners can manage question options
CREATE POLICY "Owners can manage question options"
ON public.question_options FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.surveys ON surveys.id = questions.survey_id
        WHERE questions.id = question_options.question_id
          AND surveys.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.surveys ON surveys.id = questions.survey_id
        WHERE questions.id = question_options.question_id
          AND surveys.user_id = auth.uid()
    )
);

-- Public can view question options of published surveys
CREATE POLICY "Public can view question options of published surveys"
ON public.question_options FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.questions
        JOIN public.surveys ON surveys.id = questions.survey_id
        WHERE questions.id = question_options.question_id
          AND surveys.status = 'published'
    )
);

-- ------------------------------------------------------------------------------
-- D. SUBMISSIONS POLICIES
-- ------------------------------------------------------------------------------
-- Public can submit responses to published surveys
CREATE POLICY "Public can insert submissions to published surveys"
ON public.submissions FOR INSERT
TO anon, authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.surveys
        WHERE surveys.id = submissions.survey_id
          AND surveys.status = 'published'
    )
);

-- Survey owners can view submissions to their surveys
CREATE POLICY "Owners can view submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.surveys
        WHERE surveys.id = submissions.survey_id
          AND surveys.user_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- E. ANSWERS POLICIES
-- ------------------------------------------------------------------------------
-- Public can insert answers for submissions to published surveys
CREATE POLICY "Public can insert answers to published surveys"
ON public.answers FOR INSERT
TO anon, authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.submissions
        JOIN public.surveys ON surveys.id = submissions.survey_id
        WHERE submissions.id = answers.submission_id
          AND surveys.status = 'published'
    )
);

-- Survey owners can view answers to their surveys
CREATE POLICY "Owners can view answers"
ON public.answers FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.submissions
        JOIN public.surveys ON surveys.id = submissions.survey_id
        WHERE submissions.id = answers.submission_id
          AND surveys.user_id = auth.uid()
    )
);

-- ==============================================================================
-- SAMPLE DEMO SEED DATA (OPTIONAL MANUAL SEEDING)
-- ==============================================================================
-- Note: Replace '<YOUR_USER_ID>' with an actual user id from auth.users if running manually
-- or use the in-app interactive demo store which is automatically populated!
