-- Backup of tables retired from Balanga Kalinga
-- Database: defaultdb   Generated: 2026-10-17T12:44:02.822Z
SET FOREIGN_KEY_CHECKS=0;

-- ---------- activity_logs (0 rows) ----------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE "activity_logs" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "activity_id" int NOT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "user_id" ("user_id"),
  KEY "activity_id" ("activity_id"),
  CONSTRAINT "activity_logs_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT "activity_logs_ibfk_2" FOREIGN KEY ("activity_id") REFERENCES "self_care_activities" ("id") ON DELETE CASCADE
);

-- ---------- self_care_activities (8 rows) ----------
DROP TABLE IF EXISTS `self_care_activities`;
CREATE TABLE "self_care_activities" (
  "id" int NOT NULL AUTO_INCREMENT,
  "category" varchar(60) NOT NULL,
  "title" varchar(120) NOT NULL,
  "description" text NOT NULL,
  "instructions" text NOT NULL,
  "duration_min" int DEFAULT '5',
  PRIMARY KEY ("id")
);
INSERT INTO `self_care_activities` (`id`, `category`, `title`, `description`, `instructions`, `duration_min`) VALUES
(1, 'Stress Relief', 'Breathe and Reset', 'A guided breathing exercise to calm your nervous system in minutes.', 'Sit comfortably and close your eyes.\nInhale gently through your nose for 4 counts.\nHold your breath for 7 counts.\nExhale slowly through your mouth for 8 counts.\nRepeat 4 cycles and notice how your body feels.', 5),
(2, 'Stress Relief', 'Grounding Technique', 'A quick grounding technique that brings you back to the present.', 'Name 5 things you can see.\nName 4 things you can touch.\nName 3 things you can hear.\nName 2 things you can smell.\nNotice 1 taste and take a slow breath.', 5),
(3, 'Stress Relief', 'Progressive Relaxation', 'Slowly release tension from head to toes.', 'Tense your shoulders for 5 seconds then release.\nTense your hands then release.\nTense your legs then release.\nScan your body and let each part soften.', 8),
(4, 'Academic Burnout', 'Pomodoro Focus', 'The 25-5 method to protect your attention.', 'Choose one task and set a 25 minute timer.\nWork only on that task until it rings.\nTake a 5 minute break away from screens.\nRepeat 4 rounds then take a longer break.', 25),
(5, 'Academic Burnout', 'Task Prioritizer', 'Sort assignments so important work gets your best energy.', 'List every task you have.\nMark what is due soon and matters most.\nOrder them from hardest to easiest.\nStart with only the top task.', 10),
(6, 'Emotional Wellness', 'Gentle Reflection', 'Help yourself name what you are feeling.', 'Find a quiet space.\nAsk: what am I feeling right now?\nName the emotion without judging it.\nWrite two lines in your journal.', 7),
(7, 'Emotional Wellness', 'Gratitude Check', 'Notice small good things even on heavy days.', 'Think of 3 things you are grateful for today.\nThey can be very small.\nSay them out loud or write them down.', 4),
(8, 'Sleep', 'Night Wind-Down', 'A calming routine before sleep.', 'Dim lights 30 minutes before bed.\nPut your phone away.\nDo slow breathing or a short stretch.\nWrite tomorrow top 3 tasks to clear your mind.', 10);

-- ---------- safety_plans (0 rows) ----------
DROP TABLE IF EXISTS `safety_plans`;
CREATE TABLE "safety_plans" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "warning_signs" text NOT NULL,
  "coping_steps" text NOT NULL,
  "trusted_contacts" text NOT NULL,
  "professional_contacts" text NOT NULL,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE KEY "user_id" ("user_id"),
  CONSTRAINT "safety_plans_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS=1;
-- =====================================================================
-- Additional retired tables   Generated: 2026-10-17T14:15:45.868Z
-- journal_entries and emergency_resources back no screen in the Next.js app.
-- =====================================================================
SET FOREIGN_KEY_CHECKS=0;

-- ---------- journal_entries (2 rows) ----------
DROP TABLE IF EXISTS `journal_entries`;
CREATE TABLE "journal_entries" (
  "id" int NOT NULL AUTO_INCREMENT,
  "user_id" int NOT NULL,
  "title" varchar(200) DEFAULT '',
  "content" text NOT NULL,
  "mood" varchar(30) DEFAULT 'okay',
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  KEY "user_id" ("user_id"),
  CONSTRAINT "journal_entries_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);
INSERT INTO `journal_entries` (`id`, `user_id`, `title`, `content`, `mood`, `created_at`) VALUES
(1, 1, 'Before the big deadline', 'Three projects are due and I keep worrying I will not finish on time. Breaking them into smaller pieces helped a little.', 'stressed', '2026-09-26 03:04:23'),
(2, 1, 'A small win', 'Submitted one of the projects today. My groupmate said thanks. Maybe I can do this.', 'good', '2026-09-26 03:04:23');

-- ---------- emergency_resources (4 rows) ----------
DROP TABLE IF EXISTS `emergency_resources`;
CREATE TABLE "emergency_resources" (
  "id" int NOT NULL AUTO_INCREMENT,
  "name" varchar(120) NOT NULL,
  "phone" varchar(40) NOT NULL,
  "description" text NOT NULL,
  "category" varchar(30) NOT NULL,
  PRIMARY KEY ("id")
);
INSERT INTO `emergency_resources` (`id`, `name`, `phone`, `description`, `category`) VALUES
(1, 'NCMH Crisis Hotline', '1553', 'National Center for Mental Health - 24/7 crisis support.', 'hotline'),
(2, 'Hopeline PH', '0917-558-4673', 'Text-based emotional support and suicide prevention hotline.', 'hotline'),
(3, 'Balanga Guidance Office', '+63 47 237 0000', 'School counseling office at BPSU. Open weekdays 8 AM - 5 PM. Walk-ins welcome.', 'school'),
(4, 'Emergency (Police / Medical)', '911', 'For immediate threats to safety, call emergency services right away.', 'emergency');

SET FOREIGN_KEY_CHECKS=1;