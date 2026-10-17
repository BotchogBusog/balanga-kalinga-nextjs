# Diagram Prompts — Balanga Kalinga

Copy-paste prompts for generating system diagrams with any AI tool
(ChatGPT, Claude, Gemini, Mermaid Chart, draw.io AI, PlantUML, Lucidchart AI).

Each prompt is self-contained. Start with **Part 0** (the system facts) and add
exactly one diagram prompt. Ask for the output format you need:
- **Mermaid** → renders on GitHub, Mermaid Chart, VS Code
- **PlantUML** → detailed UML
- **draw.io XML** → editable in diagrams.net

---

## Part 0 — System facts (paste this first, always)

> Build a diagram for this system. Use ONLY the facts below. Do not invent
> modules, tables, or integrations.
>
> **System name:** Balanga Kalinga — a Web-Based Student Wellness Assessment and
> Counseling Management System for a university student wellness/guidance office.
>
> **Purpose:** let students self-assess their mental wellbeing, talk to an AI
> wellness companion, and request counseling appointments; let counselors manage
> their own appointments; let administrators monitor usage through reports.
>
> **Actors (4):**
> 1. **Student** — registers, logs in, takes the wellness check, reads risk
>    feedback, chats with the AI companion, records moods, writes journal
>    entries, views emergency resources, requests counseling appointments, views
>    appointment history, edits profile.
> 2. **Counselor** — logs in with own email/password, sees ONLY their own
>    appointments, sets Available/Unavailable, updates appointment status. Has NO
>    access to wellness records, AI chats, or admin reports.
> 3. **Administrator** — manages users, manages counselors (account creation),
>    views date-filtered reports, prints reports.
> 4. **AI Wellness Companion** (external service) — classifies wellness answers
>    and replies to mental-health questions only.
>
> **Technology stack:**
> - Application: Next.js 14 (App Router) with React 18; server-side rendering,
>   React Server Components and Server Actions
> - Authentication: JWT stored in an HTTP-only cookie; bcrypt password hashing;
>   role-based access (student / counselor / administrator)
> - Database: MySQL 8, accessed with the `mysql2` driver over SSL
> - AI service: an OpenAI-compatible chat completions API (Groq endpoint)
> - Email: SMTP mail sending with Nodemailer (registration confirmation)
> - Hosting: Vercel (application) + Aiven (managed MySQL)
>
> **Modules / screens:** landing page, login, registration, admin login, student
> dashboard, wellness check, AI chat, counseling appointment booking, profile,
> counselor dashboard, admin dashboard, admin reports.
>
> **Database — exactly 9 tables:**
> `users`, `counselors`, `appointments`, `wellness_assessments`, `moods`,
> `journal_entries`, `ai_conversations`, `ai_messages`, `emergency_resources`.
>
> **Key data rules:**
> - `users.role` is `student`, `counselor`, or `admin`.
> - `users.counselor_id` links a counselor login to their `counselors` row.
> - `appointments.transaction_ref` is a unique reference like `BK-20261015-86AAEDAA`.
> - `appointments.status` is one of: `pending`, `approved`, `declined`,
>   `cancelled`, `completed`.
> - The wellness check is 10 questions about the past four weeks; each answer is
>   scored 1–5 (None / A little / Some / Most / All of the time). The total maps
>   to a risk level: `low`, `moderate`, or `high`. High risk displays a counselor
>   with contact details.
> - The AI companion answers mental-health topics only and refuses everything
>   else with a fixed message.
> - There is **NO payment** anywhere in the system. The counseling appointment is
>   a booking only.
>
> **Hard constraints:**
> - Do NOT add tables, columns, or artifacts that are not listed.
> - Do NOT add self-care or safety-plan features (these were removed).
> - Do NOT add a payment or billing step.
> - Keep labels short and in plain English. Return valid diagram syntax only.

---

## Prompt 1 — System Architecture Diagram

> Using the system facts from Part 0, draw a **system architecture diagram** in
> three horizontal tiers:
> - **Presentation tier:** the Next.js 14 / React front end (student pages,
>   counselor dashboard, admin dashboard), shown as one or more boxes.
> - **Application tier:** the Next.js server logic — JWT authentication and
>   role-based access control, wellness scoring, appointment booking, report
>   generation, and the AI request handler.
> - **Data & services tier:** the MySQL database (labeled with the 9 tables),
>   the AI wellness companion API, and the SMTP email service.
>
> Show the direction of every connection with labeled arrows, for example
> "HTTPS", "SQL over SSL", "chat completion request", "sends confirmation email".
> Group the app components to make clear that the browser never talks to the
> database directly — it always goes through the server.
> Return Mermaid `flowchart` syntax with subgraphs for the tiers.

---

## Prompt 2 — Use Case Diagram

> Using the system facts from Part 0, draw a **UML use case diagram**.
> Place students on the left, the Administrator on the right, and the Counselor
> at the bottom. Show the system boundary as a box titled "Balanga Kalinga".
>
> Student use cases: Register, Log In, Take Wellness Check, View Risk Feedback,
> Chat with AI Companion, Record Mood, Write Journal Entry, View Emergency
> Resources, Request Counseling Appointment, View Appointment History, Manage
> Profile.
>
> Counselor use cases: Log In, View Own Appointments, Set Availability, Update
> Appointment Status.
>
> Administrator use cases: Manage Users, Manage Counselors, View Reports,
> Print Report.
>
> Mark the AI Wellness Companion as a secondary (external) actor connected to
> "Chat with AI Companion" and "Take Wellness Check" (it classifies the answers).
> Use «include» and «extend» where sensible, for example "Request Counseling
> Appointment" «include» "Log In", and "View Risk Feedback" «extend» "Take
> Wellness Check". Return PlantUML or Mermaid syntax.

---

## Prompt 3 — Entity-Relationship Diagram

> **Superseded.** Use the stricter standalone prompt in
> [`PROMPT-ERD.md`](./PROMPT-ERD.md) instead — it pins the exact 9-entity list
> and forbids history / log / audit entities. The version below is kept for
> reference only.

> Using the system facts from Part 0, draw a **crow's-foot ERD** for the 9 tables
> with primary keys, foreign keys, and cardinality. Relationships:
> - `users.counselor_id` → `counselors.id` (many-to-one; a counselor login maps
>   to one counselor record)
> - `wellness_assessments.user_id` → `users.id` (many-to-one)
> - `moods.user_id` → `users.id` (many-to-one)
> - `journal_entries.user_id` → `users.id` (many-to-one)
> - `ai_conversations.user_id` → `users.id` (many-to-one)
> - `ai_messages.conversation_id` → `ai_conversations.id` (many-to-one)
> - `appointments.user_id` → `users.id` (many-to-one)
> - `appointments.counselor_id` → `counselors.id` (many-to-one)
>
> Mark `appointments.transaction_ref` and `users.email` / `users.student_id` as
> unique. List each table's important columns, not just its keys.
> Return Mermaid `erDiagram` syntax.

---

## Prompt 4 — Context Diagram (Data Flow Diagram, Level 0)

> Using the system facts from Part 0, draw a **context diagram (DFD Level 0)**.
> Show a single process bubble labeled "Balanga Kalinga System" in the center and
> these external entities around it: Student, Counselor, Administrator, AI
> Wellness Companion, and Email Service.
>
> For each entity, list the data flows in and out, for example:
> - Student → System: registration details, wellness answers, chat messages,
>   appointment request, mood entries, journal text
> - System → Student: risk feedback, AI replies, appointment status and
>   transaction reference, emergency resources
> - Counselor → System: availability, appointment status update
> - System → Counselor: their own appointment list
> - Administrator → System: report date range, user/counselor edits
> - System → Administrator: reports and summaries
> - System ↔ AI Wellness Companion: wellness answers out, classification in
> - System → Email Service: confirmation email
>
> Label every arrow. Do not show data stores on a Level 0 diagram.
> Return Mermaid or Graphviz syntax.

---

## Prompt 5 — Data Flow Diagram (Level 1)

> Using the system facts from Part 0, decompose the system into these processes
> for a **DFD Level 1**: (1) Manage Accounts and Authentication, (2) Wellness
> Assessment, (3) AI Wellness Chat, (4) Counseling Appointment Booking,
> (5) Mood and Journal Entry, (6) Admin Reporting. Add these data stores:
> D1 users, D2 counselors, D3 wellness_assessments, D4 appointments,
> D5 moods, D6 journal_entries, D7 ai_conversations and ai_messages,
> D8 emergency_resources. Show which process reads or writes which store, with
> labeled data flows between processes, stores, and external entities. Use the
> standard Yourdon/DeMarco notation described in text (numbered process bubbles,
> open-ended data-store bars). Return Mermaid syntax.

---

## Prompt 6 — Deployment Diagram

> Using the system facts from Part 0, draw a **UML deployment diagram**.
> Nodes: the user's device (browser), the Vercel hosting platform running the
> Next.js application, the Aiven managed MySQL server, the external AI API, and
> the SMTP mail server. Show the artifacts deployed on each node and label the
> protocols: HTTPS between browser and Vercel, SQL over SSL between Vercel and
> Aiven, HTTPS to the AI API, and SMTP for mail. Return PlantUML syntax.

---

## Prompt 7 — Activity Diagram (Counseling Appointment)

> Using the system facts from Part 0, draw a **UML activity diagram** for the
> counseling appointment workflow, with swimlanes for Student, System, and
> Counselor:
> 1. Student opens the counseling page (must be logged in).
> 2. Student picks a counselor, date, and time and submits the request.
> 3. System checks that the slot is not already taken by a pending or approved
>    appointment for that counselor, date, and time.
> 4. If taken, the System shows "slot unavailable" and returns the Student to
>    step 2. If free, the System saves the appointment with status `pending` and
>    generates a unique `transaction_ref`, then shows it to the Student.
> 5. The Counselor reviews the request and sets it to `approved` or `declined`.
> 6. The System shows the updated status in the Student's appointment history.
> Include start and end nodes and decision diamonds. Return PlantUML syntax.

---

## Part 8 — Generic template (any diagram)

> Create a **[diagram type]** for the system described below.
> Audience: **[thesis panel / developers / non-technical staff]**.
> Level of detail: **[high-level overview / full detail]**.
> Output format: **[Mermaid / PlantUML / draw.io XML]**.
> It must be readable when printed on one page in black and white.
> Show only what the facts support; label every box and every arrow; keep text
> short. [Paste Part 0 here.]

---

## Part 9 — Guardrails (repeat these to the tool)

> - No payment, billing, or fee steps.
> - No self-care or safety-plan modules.
> - Exactly the 9 tables listed; add nothing.
> - The AI companion handles mental-health topics only.
> - Counselors never see wellness records, AI chats, or reports.
> - Return syntactically valid diagram code with no commentary.
