
SET FOREIGN_KEY_CHECKS=0;



CREATE TABLE users (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(120) NOT NULL,
  email varchar(190) NOT NULL,
  student_id varchar(40) DEFAULT NULL,
  password_hash varchar(255) NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'student',
  course varchar(120) DEFAULT '',
  year_level varchar(40) DEFAULT '',
  school varchar(120) DEFAULT '',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  UNIQUE KEY student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE counselors (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(120) NOT NULL,
  specialization varchar(120) NOT NULL,
  description text NOT NULL,
  schedule text NOT NULL,
  email varchar(190) DEFAULT NULL,
  phone varchar(40) DEFAULT NULL,
  is_available tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE self_care_activities (
  id int(11) NOT NULL AUTO_INCREMENT,
  category varchar(60) NOT NULL,
  title varchar(120) NOT NULL,
  description text NOT NULL,
  instructions text NOT NULL,
  duration_min int(11) DEFAULT 5,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wellness_assessments (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  answers text NOT NULL,
  overall_level varchar(40) NOT NULL,
  summary text NOT NULL,
  suggested_actions text NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT wellness_assessments_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE moods (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  mood varchar(30) NOT NULL,
  note text DEFAULT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT moods_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE journal_entries (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  title varchar(200) DEFAULT '',
  content text NOT NULL,
  mood varchar(30) DEFAULT 'okay',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT journal_entries_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ai_conversations (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  title varchar(200) DEFAULT 'Talk with Kalinga AI',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT ai_conversations_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ai_messages (
  id int(11) NOT NULL AUTO_INCREMENT,
  conversation_id int(11) NOT NULL,
  role varchar(20) NOT NULL,
  content text NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY conversation_id (conversation_id),
  CONSTRAINT ai_messages_ibfk_1 FOREIGN KEY (conversation_id) REFERENCES ai_conversations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE activity_logs (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  activity_id int(11) NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY activity_id (activity_id),
  CONSTRAINT activity_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT activity_logs_ibfk_2 FOREIGN KEY (activity_id) REFERENCES self_care_activities (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointments (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  counselor_id int(11) NOT NULL,
  requested_date date NOT NULL,
  requested_time varchar(20) NOT NULL,
  method varchar(30) DEFAULT 'In-person',
  notes text DEFAULT NULL,
  status varchar(30) DEFAULT 'pending',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  KEY counselor_id (counselor_id),
  CONSTRAINT appointments_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT appointments_ibfk_2 FOREIGN KEY (counselor_id) REFERENCES counselors (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE emergency_resources (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(120) NOT NULL,
  phone varchar(40) NOT NULL,
  description text NOT NULL,
  category varchar(30) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;

INSERT INTO users (id, name, email, student_id, password_hash, role, course, year_level, school) VALUES
(1, 'Alex Rivera', 'alex@balanga.edu.ph', '2025-10422', '$2y$12$LOylnlKi3N0tjV/vFeBdPetU7YZJsMjl9Jph.lsl3dXvsvws0NMlS', 'student', 'BS Computer Science', '3rd Year', 'Bataan Peninsula State University'),
(2, 'Maria Santos', 'maria@balanga.edu.ph', '2024-20131', '$2y$12$LOylnlKi3N0tjV/vFeBdPetU7YZJsMjl9Jph.lsl3dXvsvws0NMlS', 'student', 'BS Nursing', '2nd Year', 'Bataan Peninsula State University'),
(3, 'Admin Balanga', 'admin@kalinga.edu.ph', 'ADM-0002', '$2y$12$QWpmFbvyQA1JK5V44Bev7ehwbh6crUvat/49S3UzTi8fvlY.ve9lK', 'admin', '', '', ''),
(4, 'Dr. Angela Mendoza', 'counselor@balanga.edu.ph', 'ADM-0001', '$2y$12$QWpmFbvyQA1JK5V44Bev7ehwbh6crUvat/49S3UzTi8fvlY.ve9lK', 'admin', '', '', '');

INSERT INTO counselors (id, name, specialization, description, schedule, email, phone, is_available) VALUES
(1, 'Angela Mendoza', 'Academic and Career Counseling', 'Helps with academic pressure, workload and career decisions. Friendly and practical.', 'Mon 9:00-12:00, Mon 14:00-17:00, Wed 9:00-12:00, Fri 13:00-16:00', 'angela.mendoza@balanga.edu.ph', '+63 917 555 0101', 1),
(2, 'Ramon Torres', 'Anxiety and Stress Management', 'Guides students through stress and burnout with gentle techniques.', 'Tue 10:00-13:00, Thu 10:00-13:00, Fri 9:00-12:00', 'ramon.torres@balanga.edu.ph', '+63 917 555 0102', 1),
(3, 'Liza Fernandez', 'Emotional and Personal Support', 'Safe space for relationships, self esteem and family concerns.', 'Mon 13:00-16:00, Wed 13:00-16:00, Thu 14:00-17:00', 'liza.fernandez@balanga.edu.ph', '+63 917 555 0103', 1),
(4, 'Marco Reyes', 'Study Skills and Motivation', 'Helps rebuild motivation and organize studies.', 'Tue 9:00-12:00, Thu 9:00-12:00, Sat 9:00-11:00', 'marco.reyes@balanga.edu.ph', '+63 917 555 0104', 1);

INSERT INTO self_care_activities (id, category, title, description, instructions, duration_min) VALUES
(1, 'Stress Relief', 'Breathe and Reset', 'A guided breathing exercise to calm your nervous system in minutes.', 'Sit comfortably and close your eyes.\nInhale gently through your nose for 4 counts.\nHold your breath for 7 counts.\nExhale slowly through your mouth for 8 counts.\nRepeat 4 cycles and notice how your body feels.', 5),
(2, 'Stress Relief', 'Grounding Technique', 'A quick grounding technique that brings you back to the present.', 'Name 5 things you can see.\nName 4 things you can touch.\nName 3 things you can hear.\nName 2 things you can smell.\nNotice 1 taste and take a slow breath.', 5),
(3, 'Stress Relief', 'Progressive Relaxation', 'Slowly release tension from head to toes.', 'Tense your shoulders for 5 seconds then release.\nTense your hands then release.\nTense your legs then release.\nScan your body and let each part soften.', 8),
(4, 'Academic Burnout', 'Pomodoro Focus', 'The 25-5 method to protect your attention.', 'Choose one task and set a 25 minute timer.\nWork only on that task until it rings.\nTake a 5 minute break away from screens.\nRepeat 4 rounds then take a longer break.', 25),
(5, 'Academic Burnout', 'Task Prioritizer', 'Sort assignments so important work gets your best energy.', 'List every task you have.\nMark what is due soon and matters most.\nOrder them from hardest to easiest.\nStart with only the top task.', 10),
(6, 'Emotional Wellness', 'Gentle Reflection', 'Help yourself name what you are feeling.', 'Find a quiet space.\nAsk: what am I feeling right now?\nName the emotion without judging it.\nWrite two lines in your journal.', 7),
(7, 'Emotional Wellness', 'Gratitude Check', 'Notice small good things even on heavy days.', 'Think of 3 things you are grateful for today.\nThey can be very small.\nSay them out loud or write them down.', 4),
(8, 'Sleep', 'Night Wind-Down', 'A calming routine before sleep.', 'Dim lights 30 minutes before bed.\nPut your phone away.\nDo slow breathing or a short stretch.\nWrite tomorrow top 3 tasks to clear your mind.', 10);

INSERT INTO emergency_resources (id, name, phone, description, category) VALUES
(1, 'NCMH Crisis Hotline', '1553', 'National Center for Mental Health - 24/7 crisis support.', 'hotline'),
(2, 'Hopeline PH', '0917-558-4673', 'Text-based emotional support and suicide prevention hotline.', 'hotline'),
(3, 'Balanga Guidance Office', '+63 47 237 0000', 'School counseling office at BPSU. Open weekdays 8 AM - 5 PM. Walk-ins welcome.', 'school'),
(4, 'Emergency (Police / Medical)', '911', 'For immediate threats to safety, call emergency services right away.', 'emergency');

INSERT INTO moods (user_id, mood, note) VALUES
(1, 'stressed', 'Deadlines piling up'),
(1, 'okay', 'Slept better today'),
(1, 'good', 'Finished one project');

INSERT INTO journal_entries (user_id, title, content, mood) VALUES
(1, 'Before the big deadline', 'Three projects are due and I keep worrying I will not finish on time. Breaking them into smaller pieces helped a little.', 'stressed'),
(1, 'A small win', 'Submitted one of the projects today. My groupmate said thanks. Maybe I can do this.', 'good');

INSERT INTO wellness_assessments (user_id, answers, overall_level, summary, suggested_actions) VALUES
(1, '[{\"question\":\"Work\",\"value\":2},{\"question\":\"Sleep\",\"value\":1},{\"question\":\"Energy\",\"value\":2},{\"question\":\"Mood\",\"value\":1},{\"question\":\"Connection\",\"value\":2},{\"question\":\"Anxiety\",\"value\":1},{\"question\":\"Motivation\",\"value\":2},{\"question\":\"Workload\",\"value\":1},{\"question\":\"Emotions\",\"value\":1},{\"question\":\"Coping\",\"value\":2}]', 'Needs Attention', 'Your check-in suggests school pressure and sleep are weighing on you. This is common around deadlines and manageable with small steps.', '[\"Try a 10-minute relaxation activity\",\"Break large assignments into smaller tasks\",\"Consider talking with a counselor\"]');
