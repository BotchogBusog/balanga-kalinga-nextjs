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