# ERD Prompt — Balanga Kalinga (features in use only)

A copy-paste prompt that produces an ERD containing **only tables that back a
screen that actually exists**, with **no history / log / audit entities**.

Works with ChatGPT, Claude, Gemini, Mermaid Chart, draw.io AI, or PlantUML.
To change output format, edit only the last line.

---

## Verified against the code

Every table below was checked for real references in `app/`, `components/` and
`lib/`. Seven back a live screen; two do not:

| Table | Verdict | Evidence |
|---|---|---|
| users | used | register, login, profile, admin, auth |
| counselors | used | counseling, counselor dashboard, admin, wellness |
| appointments | used | counseling, counselor dashboard, reports |
| wellness_assessments | used | wellness check, dashboard, reports |
| moods | used | dashboard mood tracker, admin |
| ai_conversations | used | AI chat page + API |
| ai_messages | used | AI chat page + API |
| journal_entries | **unused** | only `CREATE TABLE` in `lib/db.js`; no page, link or query |
| emergency_resources | **unused** | only `CREATE TABLE` in `lib/db.js`; its sole consumer was the removed safety-plan page |

> If you decide to keep the emergency-contacts table as a planned feature, add
> `emergency_resources` back to the ENTITIES list below — it has no foreign keys,
> so it stays standalone and needs no relationship line.

---

## The prompt (copy everything inside the block)

```text
Create an entity-relationship diagram (ERD) for the system described below.

=== SCOPE RULES — follow exactly ===
1. Include ONLY the 7 entities listed under ENTITIES. Add nothing else.
2. Do NOT create any history, log, audit, or archive entity. Never output an
   entity named like wellness_history, appointment_history, transaction_history,
   chat_history, activity_logs, or audit_logs.
3. History is a VIEW, not a feature. The "wellness history" and "appointment
   history" screens only list rows that already live in the tables below. They
   must not become entities, and the word "history" must not appear as an entity
   or as a relationship.
4. Do NOT include a journal or diary entity. This system has no journal feature.
5. Do NOT include an emergency contacts, hotline, or emergency_resources entity.
   No screen in the system uses one.
6. Do NOT include removed features: self-care activities, safety plans.
7. Do NOT include payment, billing, fee, or receipt entities.
8. Every entity must back a screen that is actually in use.
9. Output the diagram only — no explanation, no notes, no extra entities.

=== SYSTEM ===
Balanga Kalinga — a Web-Based Student Wellness Assessment and Counseling
Management System for a university student wellness office. Students register
and log in, take a 10-question wellness check, read their risk feedback, chat
with an AI wellness companion, record their mood, and request counseling
appointments. Counselors log in and manage only their own appointments.
Administrators manage accounts and view reports.

=== ENTITIES — exactly 7 ===
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
ai_conversations — id (PK), user_id (FK -> users), title, created_at
ai_messages — id (PK), conversation_id (FK -> ai_conversations), role, content,
  created_at

=== RELATIONSHIPS — exactly 7 ===
users (1) to (1) counselors                 label: login for
users (1) to (many) wellness_assessments    label: takes
users (1) to (many) moods                   label: records
users (1) to (many) ai_conversations        label: starts
users (1) to (many) appointments            label: requests
counselors (1) to (many) appointments       label: handles
ai_conversations (1) to (many) ai_messages  label: contains

=== STYLE ===
- Crow's-foot notation. One rectangle per entity, primary key listed first.
- Mark PK, FK and UNIQUE on the correct columns.
- Label every relationship line with its verb as given above.
- Black text on white, no colour needed, readable on one landscape page.

Output format: Mermaid "erDiagram" syntax.
```

---

## Expected result

Count them — the tool did it right if you get:

- **7 entity boxes**
- **7 relationship lines**
- **no box** named or containing: "history", "log", "audit", "archive",
  "journal", "diary", "emergency"

---

## Short version (for tools with a small input limit)

```text
Draw a crow's-foot ERD in Mermaid "erDiagram" syntax for this system. Include
EXACTLY these 7 entities and 7 relationships — nothing else. Do NOT include any
history, log, audit, archive, journal, diary, or emergency-resources entity, and
the word "history" must not appear anywhere. No self-care, no safety plan, no
payment.

Entities: users(id PK, name, email UQ, student_id UQ, password_hash, role,
course, year_level, school, counselor_id UQ FK->counselors, created_at);
counselors(id PK, name, specialization, description, schedule, is_available,
email, phone); appointments(id PK, transaction_ref UQ, user_id FK->users,
counselor_id FK->counselors, requested_date, requested_time, method, notes,
status, created_at); wellness_assessments(id PK, user_id FK->users, answers,
overall_level, summary, suggested_actions, created_at); moods(id PK, user_id
FK->users, mood, note, created_at); ai_conversations(id PK, user_id FK->users,
title, created_at); ai_messages(id PK, conversation_id FK->ai_conversations,
role, content, created_at).

Relationships: users 1-1 counselors; users 1-many wellness_assessments; users
1-many moods; users 1-many ai_conversations; users 1-many appointments;
counselors 1-many appointments; ai_conversations 1-many ai_messages. Mark
PK/FK/UK. Label each line with its verb. Output the Mermaid code only.
```

---

## If the tool disobeys

Paste this as a follow-up and nothing else:

```text
You added something that is not allowed. The only permitted entities are users,
counselors, appointments, wellness_assessments, moods, ai_conversations and
ai_messages. Remove every other box — especially anything named journal,
diary, emergency, history, log, audit or archive. Re-output the corrected
Mermaid.
```

---

## Why the scope rules matter

Four mistakes happen constantly when an AI draws this ERD:

1. **It invents a journal.** Wellness apps almost always have a journal or diary
   entity, so tools add one — but this system has no journal screen.
2. **It invents emergency contacts.** Same reason. Nothing in the app displays
   them.
3. **It invents a history table.** Because "appointment history" and "wellness
   history" are visible screens, tools add an `appointment_history` or
   `activity_logs` entity that does not exist.
4. **It re-adds dead features** — self-care activities, safety plans, or a
   payment step.

Rules 8 and 9 also stop tools wrapping the code in explanation, so you can paste
the result straight into Mermaid Chart or draw.io.
