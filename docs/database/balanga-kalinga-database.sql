-- =====================================================================
-- Balanga Kalinga: Web-Based Student Wellness Assessment and
-- Counseling Management System
-- Database creation script (schema + data)
--
-- HOW TO IMPORT
--   phpMyAdmin   : Import -> Choose file -> Go
--   Command line : mysql -u root -p < balanga-kalinga-database.sql
--
-- WARNING: this script DROPs and recreates every table below.
-- Run it only on an empty or disposable database.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- Uncomment the next two lines to also create a local database.
-- CREATE DATABASE IF NOT EXISTS `balanga_kalinga` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `balanga_kalinga`;

-- ---------------------------------------------------------------------
-- Table: counselors   (4 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `counselors`;
CREATE TABLE `counselors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `specialization` varchar(120) NOT NULL,
  `description` text NOT NULL,
  `schedule` text NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `email` varchar(190) DEFAULT NULL,
  `phone` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `counselors` (`id`, `name`, `specialization`, `description`, `schedule`, `is_available`, `email`, `phone`) VALUES
(1, 'Angela Mendoza', 'Academic and Career Counseling', 'Helps with academic pressure, workload and career decisions. Friendly and practical.', 'Mon 9:00-12:00, Mon 14:00-17:00, Wed 9:00-12:00, Fri 13:00-16:00', 1, 'angela.mendoza@balanga.edu.ph', '+63 47 237 0000'),
(2, 'Ramon Torres', 'Anxiety and Stress Management', 'Guides students through stress and burnout with gentle techniques.', 'Tue 10:00-13:00, Thu 10:00-13:00, Fri 9:00-12:00', 1, 'ramon.torres@balanga.edu.ph', '+63 47 237 0000'),
(3, 'Liza Fernandez', 'Emotional and Personal Support', 'Safe space for relationships, self esteem and family concerns.', 'Mon 13:00-16:00, Wed 13:00-16:00, Thu 14:00-17:00', 1, 'liza.fernandez@balanga.edu.ph', '+63 47 237 0000'),
(4, 'Marco Reyes', 'Study Skills and Motivation', 'Helps rebuild motivation and organize studies.', 'Tue 9:00-12:00, Thu 9:00-12:00, Sat 9:00-11:00', 1, 'marco.reyes@balanga.edu.ph', '+63 47 237 0000');

-- ---------------------------------------------------------------------
-- Table: users   (13 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `student_id` varchar(40) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'student',
  `course` varchar(120) DEFAULT '',
  `year_level` varchar(40) DEFAULT '',
  `school` varchar(120) DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `counselor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_id` (`student_id`),
  UNIQUE KEY `counselor_id` (`counselor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `student_id`, `password_hash`, `role`, `course`, `year_level`, `school`, `created_at`, `counselor_id`) VALUES
(1, 'Alex Rivera', 'alex@balanga.edu.ph', '2025-10422', '$2y$12$LOylnlKi3N0tjV/vFeBdPetU7YZJsMjl9Jph.lsl3dXvsvws0NMlS', 'student', 'BS Computer Science', '3rd Year', 'Bataan Peninsula State University', '2026-09-26 03:04:21', NULL),
(2, 'Maria Santos', 'maria@balanga.edu.ph', '2024-20131', '$2y$12$LOylnlKi3N0tjV/vFeBdPetU7YZJsMjl9Jph.lsl3dXvsvws0NMlS', 'student', 'BS Nursing', '2nd Year', 'Bataan Peninsula State University', '2026-09-26 03:04:21', NULL),
(3, 'Admin Balanga', 'admin@kalinga.edu.ph', 'ADM-0002', '$2y$12$QWpmFbvyQA1JK5V44Bev7ehwbh6crUvat/49S3UzTi8fvlY.ve9lK', 'admin', '', '', '', '2026-09-26 03:04:21', NULL),
(4, 'Dr. Angela Mendoza', 'counselor@balanga.edu.ph', 'ADM-0001', '$2y$12$QWpmFbvyQA1JK5V44Bev7ehwbh6crUvat/49S3UzTi8fvlY.ve9lK', 'admin', '', '', '', '2026-09-26 03:04:21', NULL),
(5, 'Pogiakoo', 'hehehehe@bpsu.edu.ph', '4355', '$2a$10$5GXjEyArEUNaYe71HTs.M.1k3KGIVwSiT8MNsiz38MoN6ZN4CiqK6', 'student', 'BS Tourism', '1st Year', 'Bataan Peninsula State University', '2026-09-29 14:29:33', NULL),
(7, 'Alex Gwapo', 'aestrada6060@gmail.com', '2233', '$2a$10$7A2853p6RqO4cegG1Ql12uZiark2DWvZKRCQ1ohEZdvcCl7ZkiEwW', 'student', 'BS Information Technology', '3rd Year', 'BPSU', '2026-10-12 05:55:56', NULL),
(8, 'javarice', 'javarice950@gmail.com', '20269', '$2a$10$ndYCCYvs/exa163ACgZS8uFIN2xMCqSj.bp66B3wfmBOVnZ/ScsHW', 'student', 'BS Information Technology', '4th Year', 'BPSU', '2026-10-12 06:08:13', NULL),
(10, 'Cyrus Tuazon', 'catuazon24@bpsu.edu.ph', '24-08288', '$2a$10$nz42tiN1xflF/RSZEmrpJuCLEFTZiDozsrmD7qAIjqVR5guefjSBO', 'student', 'BS in Computer Science', '3rd Year', 'Bataan Peninsula State University', '2026-10-14 08:01:28', NULL),
(11, 'Bagman Shet', 'spotifypreium660@gmail.com', '2027-77', '$2a$10$UZ18eJSHXkrVpXD5qILYCuV1R7y/lDBsmojQHHMEZcuRjfqc8ev.i', 'student', 'BS Information Technology', '1st Year', 'BPSU', '2026-10-15 00:03:22', NULL),
(37, 'Angela Mendoza', 'angela.mendoza@balanga.edu.ph', NULL, '$2a$10$DlslPjJsFEFw0jvjRfctK.vNQePHHpoPvt4lm13YgxJlv9IS.0K1i', 'counselor', '', '', '', '2026-10-15 23:19:21', 1),
(38, 'Ramon Torres', 'ramon.torres@balanga.edu.ph', NULL, '$2a$10$DlslPjJsFEFw0jvjRfctK.vNQePHHpoPvt4lm13YgxJlv9IS.0K1i', 'counselor', '', '', '', '2026-10-15 23:19:21', 2),
(39, 'Liza Fernandez', 'liza.fernandez@balanga.edu.ph', NULL, '$2a$10$DlslPjJsFEFw0jvjRfctK.vNQePHHpoPvt4lm13YgxJlv9IS.0K1i', 'counselor', '', '', '', '2026-10-15 23:19:21', 3),
(40, 'Marco Reyes', 'marco.reyes@balanga.edu.ph', NULL, '$2a$10$DlslPjJsFEFw0jvjRfctK.vNQePHHpoPvt4lm13YgxJlv9IS.0K1i', 'counselor', '', '', '', '2026-10-15 23:19:21', 4);

-- ---------------------------------------------------------------------
-- Table: wellness_assessments   (0 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `wellness_assessments`;
CREATE TABLE `wellness_assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `answers` text NOT NULL,
  `overall_level` varchar(40) NOT NULL,
  `summary` text NOT NULL,
  `suggested_actions` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `wellness_assessments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table: moods   (3 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `moods`;
CREATE TABLE `moods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mood` varchar(30) NOT NULL,
  `note` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `moods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `moods` (`id`, `user_id`, `mood`, `note`, `created_at`) VALUES
(1, 1, 'stressed', 'Deadlines piling up', '2026-09-26 03:04:23'),
(2, 1, 'okay', 'Slept better today', '2026-09-26 03:04:23'),
(3, 1, 'good', 'Finished one project', '2026-09-26 03:04:23');

-- ---------------------------------------------------------------------
-- Table: journal_entries   (2 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `journal_entries`;
CREATE TABLE `journal_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) DEFAULT '',
  `content` text NOT NULL,
  `mood` varchar(30) DEFAULT 'okay',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `journal_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `journal_entries` (`id`, `user_id`, `title`, `content`, `mood`, `created_at`) VALUES
(1, 1, 'Before the big deadline', 'Three projects are due and I keep worrying I will not finish on time. Breaking them into smaller pieces helped a little.', 'stressed', '2026-09-26 03:04:23'),
(2, 1, 'A small win', 'Submitted one of the projects today. My groupmate said thanks. Maybe I can do this.', 'good', '2026-09-26 03:04:23');

-- ---------------------------------------------------------------------
-- Table: ai_conversations   (3 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `ai_conversations`;
CREATE TABLE `ai_conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) DEFAULT 'Talk with Kalinga AI',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ai_conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ai_conversations` (`id`, `user_id`, `title`, `created_at`) VALUES
(1, 5, '2999+299', '2026-09-29 14:32:54'),
(3, 1, 'im feeling depress', '2026-09-29 15:12:56'),
(6, 10, '1+1', '2026-10-14 08:02:32');

-- ---------------------------------------------------------------------
-- Table: ai_messages   (40 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `ai_messages`;
CREATE TABLE `ai_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `role` varchar(20) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `ai_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ai_messages` (`id`, `conversation_id`, `role`, `content`, `created_at`) VALUES
(1, 1, 'user', '2999+299', '2026-09-29 14:32:54'),
(2, 1, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-09-29 14:32:54'),
(3, 1, 'user', 'Im depress', '2026-09-29 14:33:00'),
(4, 1, 'assistant', 'I am here with you, Pogiakoo. Tell me a little more about what is on your mind -- is it school, your feelings, relationships, or something else? We can take it one small kind step at a time.', '2026-09-29 14:33:01'),
(5, 1, 'user', 'I think i have anxiety', '2026-09-29 14:33:17'),
(6, 1, 'assistant', 'Feeling anxious is exhausting, Pogiakoo. Let us ground you for a moment. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Then breathe in for 4 counts and out for 6. How is your body now?', '2026-09-29 14:33:17'),
(7, 1, 'user', 'How to surpass anxiety', '2026-09-29 14:33:37'),
(8, 1, 'assistant', 'Feeling anxious is exhausting, Pogiakoo. Let us ground you for a moment. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Then breathe in for 4 counts and out for 6. How is your body now?', '2026-09-29 14:33:37'),
(17, 1, 'user', 'What is depression', '2026-09-29 14:50:40'),
(20, 1, 'assistant', 'Depression is more than just having a bad day or feeling down; it is a mental health condition where deep sadness, emptiness, or a loss of interest in things you love lasts for weeks or longer. It can affect your sleep, appetite, energy levels, and make even simple college tasks feel exhausting to finish. Please know that experiencing this is not a personal failure or a sign of weakness. With gentle daily self-care, support from loved ones, and professional guidance, depression can be managed and treated. Are you asking because you have been noticing these feelings in yourself lately?\n\nNote: I am an AI support companion, not a licensed professional.', '2026-09-29 14:52:26'),
(41, 3, 'user', 'im feeling depress', '2026-09-29 15:12:56'),
(42, 3, 'assistant', 'I’m really sorry you’re feeling this way; it takes courage to share that. Can you tell me a little more about what’s been weighing on you lately? Note: I am an AI support companion, not a licensed professional.', '2026-09-29 15:12:57'),
(43, 3, 'user', 'what is depression', '2026-09-29 15:13:12'),
(44, 3, 'assistant', 'Depression is a common mental health condition that causes persistent feelings of sadness, hopelessness, or loss of interest in activities you usually enjoy. It can affect how you feel, think, and handle daily tasks like sleep, eating, or concentrating. Remember, it’s a medical condition, not a personal failing, and help is available. Note: I am an AI support companion, not a licensed professional.', '2026-09-29 15:13:13'),
(45, 3, 'user', '22+222', '2026-09-29 15:13:46'),
(46, 3, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-09-29 15:13:46'),
(47, 3, 'user', 'what is anxiety', '2026-09-29 15:14:26'),
(48, 3, 'assistant', 'Anxiety is a natural response to stress that becomes a problem when it feels excessive, persistent, or hard to control. It often involves worry, restlessness, or physical symptoms like a racing heart or trouble sleeping. Many people find relief through breathing exercises, talking to someone, or professional support. Note: I am an AI support companion, not a licensed professional.', '2026-09-29 15:14:26'),
(49, 3, 'user', 'Im depress', '2026-09-30 06:36:24'),
(50, 3, 'assistant', 'I’m really sorry you’re feeling this heavy right now. Would you like to share what’s on your mind, or would you prefer some gentle coping tips to help you feel a bit lighter? Note: I am an AI support companion, not a licensed professional.', '2026-09-30 06:36:24'),
(51, 3, 'user', 'What is the history of earth', '2026-09-30 06:36:34'),
(52, 3, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-09-30 06:36:35'),
(53, 3, 'user', 'Can you help me to ease my anxiety and depression', '2026-09-30 06:38:59'),
(54, 3, 'assistant', 'I’m here to support you with gentle coping strategies like deep breathing, grounding techniques, or journaling to help ease those feelings. Would you like to try a simple exercise together right now? Note: I am an AI support companion, not a licensed professional.', '2026-09-30 06:38:59'),
(55, 3, 'user', 'Yes, what whould be the best technique', '2026-09-30 06:39:21'),
(56, 3, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-09-30 06:39:21'),
(57, 3, 'user', 'Academic Stress – pressure from assignments, exams, and grades.\nAnxiety – excessive worry, nervousness, or fear.\nDepression Symptoms – persistent sadness, low motivation, or loss of interest.\nSleep Problems – difficulty sleeping, poor sleep quality, or irregular sleep patterns.\nSocial Isolation – feeling lonely or disconnected from friends or family.\nSelf-Esteem – negative thoughts about oneself or lack of confidence.\nBurnout – emotional and physical exhaustion from prolonged stress.\nRelationship Stress – emotional difficulties involving friends, family, or romantic relationships.\nAnger and Irritability – frequent frustration, anger, or difficulty controlling emotions.\nCoping and Emotional Regulation – difficulty managing emotions or dealing with stressful situations', '2026-09-30 06:40:43'),
(58, 3, 'assistant', 'It sounds like you are carrying a heavy load with all these challenges at once. Which one feels the most urgent or overwhelming for you right now, so we can focus on that first? Note: I am an AI support companion, not a licensed professional.', '2026-09-30 06:40:44'),
(59, 3, 'user', 'How to cope all of that problem in easy way', '2026-09-30 06:40:58'),
(60, 3, 'assistant', 'Tackling everything at once can feel overwhelming, so try focusing on just one small, manageable step each day, like taking five deep breaths or writing down one worry. Prioritizing basic self-care, such as short walks or consistent sleep, can also help build your resilience gradually. Note: I am an AI support companion, not a licensed professional.', '2026-09-30 06:40:59'),
(67, 3, 'user', 'whats 2+2', '2026-10-06 11:19:28'),
(68, 3, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-10-06 11:19:28'),
(71, 6, 'user', '1+1', '2026-10-14 08:02:32'),
(72, 6, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-10-14 08:02:32'),
(73, 6, 'user', '2+2', '2026-10-14 11:49:56'),
(74, 6, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-10-14 11:49:56'),
(75, 6, 'user', 'I\'m drain', '2026-10-14 11:50:06'),
(76, 6, 'assistant', 'Sorry I can\'t provide an answer for that. I am an AI Wellness companion focused on mental health and wellbeing.', '2026-10-14 11:50:06'),
(77, 6, 'user', 'i need help', '2026-10-14 11:50:25'),
(78, 6, 'assistant', 'I am here for you. Can you tell me a little more about what is weighing on you right now? Note: I am an AI support companion, not a licensed professional.', '2026-10-14 11:50:26');

-- ---------------------------------------------------------------------
-- Table: appointments   (3 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_ref` varchar(50) DEFAULT NULL,
  `user_id` int NOT NULL,
  `counselor_id` int NOT NULL,
  `requested_date` date NOT NULL,
  `requested_time` varchar(20) NOT NULL,
  `method` varchar(30) DEFAULT 'In-person',
  `notes` text,
  `status` varchar(30) DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_ref` (`transaction_ref`),
  KEY `user_id` (`user_id`),
  KEY `counselor_id` (`counselor_id`),
  KEY `appointments_counselor_slot_idx` (`counselor_id`,`requested_date`,`requested_time`,`status`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `counselors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `appointments` (`id`, `transaction_ref`, `user_id`, `counselor_id`, `requested_date`, `requested_time`, `method`, `notes`, `status`, `created_at`) VALUES
(1, 'BK-20261009-000001', 1, 1, '2026-10-09', '12:30', 'In-person', '', 'approved', '2026-10-09 04:28:45'),
(2, 'BK-20261015-86AAEDAA', 1, 3, '2026-10-15', '08:00', 'In-person', '', 'approved', '2026-10-15 00:00:25'),
(3, 'BK-20261015-FC5EF722', 1, 4, '2026-10-15', '09:00', 'Phone', '', 'declined', '2026-10-15 00:00:53');

-- ---------------------------------------------------------------------
-- Table: emergency_resources   (4 rows)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `emergency_resources`;
CREATE TABLE `emergency_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `phone` varchar(40) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `emergency_resources` (`id`, `name`, `phone`, `description`, `category`) VALUES
(1, 'NCMH Crisis Hotline', '1553', 'National Center for Mental Health - 24/7 crisis support.', 'hotline'),
(2, 'Hopeline PH', '0917-558-4673', 'Text-based emotional support and suicide prevention hotline.', 'hotline'),
(3, 'Balanga Guidance Office', '+63 47 237 0000', 'School counseling office at BPSU. Open weekdays 8 AM - 5 PM. Walk-ins welcome.', 'school'),
(4, 'Emergency (Police / Medical)', '911', 'For immediate threats to safety, call emergency services right away.', 'emergency');

SET FOREIGN_KEY_CHECKS = 1;

-- End of script.