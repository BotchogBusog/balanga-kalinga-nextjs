# ERD Prompt — Balanga Kalinga (used features only)

A copy-paste prompt that produces an ERD containing **only features that are
actually in use**, with **no history / log / audit entities**.

Works with ChatGPT, Claude, Gemini, Mermaid Chart, draw.io AI, PlantUML, or any
diagram tool. To switch output format, change only the last line — the prompt
already says "install nothing extra".

---

## The prompt (copy everything inside the block)

```text
Create an entity-relationship diagram (ERD) for the system described below.

=== SCOPE RULES — follow exactly ===
1. Include ONLY the 9 entities listed under ENTITIES. Add nothing else.
2. Do NOT create any history, log, audit, archive, or activity-log entity.
   Never output an entity named like wellness_history, appointment_history,
   transaction_history, chat_history, activity_logs, audit_logs, or anything
   similar.
3. History is a VIEW, not a feature. The "wellness history" and "appointment
   history" screens only list rows that already live in the tables below. They
   must not become entities, and the word "history" must not appear as an
   entity or as a relationship.
4. Do NOT include removed features: self-care activities, safety plans.
5. Do NOT include payment, billing, fee, or receipt entities.
6. Every entity must back a feature that is actually in use.
7. Output the diagram only — no explanation, no notes, no extra entities.

=== SYSTEM ===
Balanga Kalinga — a Web-Based Student Wellness Assessment and Counseling
Management System for a university student wellness office. Students register
and log in, take a 10-question wellness check, chat with an AI wellness
companion, record moods, write journal entries, read emergency resources, and
request counseling appointments. Counselors log in and manage only their own
appointments. Administrators manage accounts and view reports.

=== ENTITIES — exactly 9 ===
users — id (PK), name, email (UNIQUE), student_id (UNIQUE), password_hash,
  role, course, year_level, school, counselor_id (UNIQUE, references counselors),
  created_at
counselors — id (PK), name, specialization, description, schedule,
  is_available, email, phone
appointments — id (PK), transaction_ref (UNIQUE), user_id (FK -> users),
  counselor_id (FK -> counselors), requested_date, requested_time, method,
  notes, status, created_at
  status is one of: pending, approved, declined, cancelled, completed
wellness_assessments — id (PK), user_id (FK -> users), answers, overall_level,
  summary, suggested_actions, created_at
  overall_level is one of: low, moderate, high
moods — id (PK), user_id (FK -> users), mood, note, created_at
journal_entries — id (PK), user_id (FK -> users), title, content, mood, created_at
ai_conversations — id (PK), user_id (FK -> users), title, created_at
ai_messages — id (PK), conversation_id (FK -> ai_conversations), role, content,
  created_at
emergency_resources — id (PK), name, phone, description, category
  standalone reference list — no relationship to any other entity

=== RELATIONSHIPS — exactly 8 ===
users (1) to (1) counselors                 label: login for
users (1) to (many) wellness_assessments    label: takes
users (1) to (many) moods                   label: records
users (1) to (many) journal_entries         label: writes
users (1) to (many) ai_conversations        label: starts
users (1) to (many) appointments            label: requests
counselors (1) to (many) appointments       label: handles
ai_conversations (1) to (many) ai_messages  label: contains
Do not draw a relationship line to emergency_resources.

=== STYLE ===
- Crow's-foot notation. One rectangle per entity, primary key listed first.
- Mark PK, FK and UNIQUE on the correct columns.
- Label every relationship line with its verb as given above.
- Black text on white, no colour needed, readable on one landscape page.

Output format: Mermaid "erDiagram" syntax.
```

---

## Expected result

If the tool did it right you should be able to count:

- **9 entity boxes**
- **8 relationship lines**
- **no box** whose name contains "history", "log", "audit", or "archive"

---

## Short version (for tools with a small input limit)

```text
Draw a crow's-foot ERD in Mermaid "erDiagram" syntax for this system. Include
EXACTLY these 9 entities and 8 relationships — nothing else. No history, log,
audit, archive, or activity-log entity is allowed, and the word "history" must
not appear anywhere. No self-care, no safety plan, no payment.

Entities: users(id PK, name, email UQ, student_id UQ, password_hash, role,
course, year_level, school, counselor_id UQ FK->counselors, created_at);
counselors(id PK, name, specialization, description, schedule, is_available,
email, phone); appointments(id PK, transaction_ref UQ, user_id FK->users,
counselor_id FK->counselors, requested_date, requested_time, method, notes,
status, created_at); wellness_assessments(id PK, user_id FK->users, answers,
overall_level, summary, suggested_actions, created_at); moods(id PK, user_id
FK->users, mood, note, created_at); journal_entries(id PK, user_id FK->users,
title, content, mood, created_at); ai_conversations(id PK, user_id FK->users,
title, created_at); ai_messages(id PK, conversation_id FK->ai_conversations,
role, content, created_at); emergency_resources(id PK, name, phone,
description, category — standalone).

Relationships: users 1-1 counselors; users 1-many wellness_assessments; users
1-many moods; users 1-many journal_entries; users 1-many ai_conversations;
users 1-many appointments; counselors 1-many appointments; ai_conversations
1-many ai_messages. Mark PK/FK/UK. Label each line with its verb. Output the
Mermaid code only.
```

---

## If the tool disobeys

Paste this as a follow-up and nothing else:

```text
You added something that is not allowed. Remove any entity that is not one of
the 9 listed (users, counselors, appointments, wellness_assessments, moods,
journal_entries, ai_conversations, ai_messages, emergency_resources), and remove
any history, log, audit, or archive entity. Re-output the corrected Mermaid.
```

---

## Why the scope rules matter

Two mistakes happen constantly when an AI draws this ERD:

1. **It invents a history table.** Because "appointment history" and "wellness
   history" are visible screens, a tool naturally adds an `appointment_history`
   or `activity_logs` entity. Neither exists — both screens read from
   `appointments` and `wellness_assessments`.
2. **It re-adds dead features.** The system no longer has self-care activities
   or a safety plan, and has no payment step. Left unsaid, tools re-add them.

Rule 7 (output only the diagram) also stops tools from wrapping the code in
explanation, so you can paste it straight into Mermaid Chart or draw.io.
