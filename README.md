# PulseSurveys ⚡

A clean, modern, and production-ready **Survey Platform** built with **React**, **Vite**, **Tailwind CSS**, **Lucide React**, and **Supabase** (PostgreSQL + Row Level Security).

---

## 🔐 Dual-Role Authentication System

The application features a strict, role-separated authentication model:

### 👤 1. Regular User Portal (`/login?role=user`)
- **Public Registration & Sign In**: Anyone can freely **Sign Up** (create a new account with Full Name, Email, and Password) or **Sign In**.
- **Participant Hub**:
  - Browse all active published surveys with estimated completion times and question counts.
  - Take or retake surveys with live submission tracking.
  - See response status (**✓ Completed** badge).
- **1-Click Demo Login**: Pre-seeded with `user@pulsesurveys.io` (Pass: `user123`).

### 🛡️ 2. Administrator Portal (`/login?role=admin`)
- **Strict Pre-Registered Credential Enforcement**:
  - **Public registration is disabled** for administrators.
  - Administrators can **only log in with pre-registered, pre-authorized credentials**.
  - Attempting to log in as an admin using an unregistered email is blocked with an **Access Denied** alert.
- **Pre-Registered Administrators**:
  - `admin@pulsesurveys.io` (Pass: `admin123`) — *Lead Admin*
  - `director@pulsesurveys.io` (Pass: `admin123`) — *Supervisor*
- **Role-Based Protection**:
  - Survey creation (`/surveys/new`), editing (`/surveys/:id/edit`), and analytics (`/survey/:id/results`) are strictly guarded. Standard users accessing these routes are met with an **Administrator Access Required** restriction screen.

---

## ✨ Features & User Flows

### 1. 📊 Creator / Admin Dashboard (`/` for Admins)
- Displays all surveys created by the authenticated administrator with response counters and status badges (**Draft**, **Published**, **Closed**).
- **KPI Summary Cards**: Total Surveys, Active Published, and Total Submissions.
- **Search & Filter Tabs**: Instantly filter surveys by status or search across titles and descriptions.
- **Quick Actions**:
  - `Results`: Navigate directly to the real-time visual analytics breakdown.
  - `Edit`: Update title, description, questions, options, and status.
  - `Copy Public Link`: 1-click clipboard copy with animated toast notification.
  - `Open Form`: Direct link to the respondent view.
  - `Delete`: Safe deletion with confirmation.

### 2. 🛠️ Survey Builder & Editor (`/surveys/new` & `/surveys/:id/edit`)
- **Metadata Configuration**: Title, description, and status toggle (**Draft**, **Published**, **Closed**).
- **Dynamic Question Builder**:
  - Question title prompt & required toggle switch.
  - **Single Choice**: Radio buttons with dynamic option rows (add, edit, remove).
  - **Multiple Choice**: Checkboxes with multi-select support.
  - **Rating Scale**: 1 to 5 clickable stars or numeric scale.
  - **Short / Long Text**: Clean, multi-line freeform text feedback.
- Reorder questions with **Move Up** and **Move Down** controls.
- Client-side validation ensuring title and option completeness.

### 3. 🌐 Public Respondent View (`/survey/:id`)
- **Accessible Without Authentication**: Any public user can access and submit.
- **User Association**: If a logged-in user submits, their participation is automatically recorded in their User Portal.
- **Modern Responsive Layout**: Centered, distraction-free cards with smooth transitions.
- **Live Progress Bar**: Indicates completion percentage in real time.
- **Draft & Closed State Protection**: Friendly unavailable screen if the survey is unpublished or closed.
- **Validation & Double-Submit Protection**: Required fields are checked before submit, with a loading spinner and disabled submit button.
- **Celebration Screen**: Confetti celebration (`canvas-confetti`) upon submission with clean confirmation.

### 4. 📈 Survey Analytics & Results (`/survey/:id/results`)
- **Admin Restricted**: Accessible only by survey creators.
- **Summary Metrics**: Total Submissions, Latest Submission Date, Question Count.
- **Visual Breakdown per Question**:
  - **Single Choice & Multiple Choice**: Responsive horizontal bar charts showing exact vote counts and percentage distributions.
  - **Rating Scale**: Calculated average score badge (e.g., `4.8 / 5.0`), 5-star distribution bars, and rating counts.
  - **Short / Long Text**: Clean scrollable list of respondent quotes with timestamps.
- **Raw Submissions Explorer**: Interactive split-view inspector for auditing individual respondent submissions.
- **Export to CSV**: 1-click export generating an Excel-compatible CSV file containing all submissions and question answers.

---

## 🗄️ Database Schema & Row Level Security (RLS)

The full SQL migration script is located in [`supabase/schema.sql`](file:///c:/Users/hp/demo/ygvd-fxg-1/supabase/schema.sql).

### Tables:
1. `public.surveys`: `id` (UUID PK), `user_id` (UUID FK to `auth.users`), `title`, `description`, `status` (`'draft'`, `'published'`, `'closed'`), `created_at`, `updated_at`.
2. `public.questions`: `id` (UUID PK), `survey_id` (UUID FK to `surveys`), `question_text`, `question_type` (`'single_choice'`, `'multiple_choice'`, `'text'`, `'rating'`), `is_required`, `order_index`, `created_at`.
3. `public.question_options`: `id` (UUID PK), `question_id` (UUID FK to `questions`), `option_text`, `order_index`, `created_at`.
4. `public.submissions`: `id` (UUID PK), `survey_id` (UUID FK to `surveys`), `user_id` (UUID FK to `auth.users`, nullable), `submitted_at`.
5. `public.answers`: `id` (UUID PK), `submission_id` (UUID FK to `submissions`), `question_id` (UUID FK to `questions`), `answer_text`, `selected_option_id` (UUID FK to `question_options`), `selected_options` (UUID array), `rating_value` (INT 1-5), `created_at`.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
