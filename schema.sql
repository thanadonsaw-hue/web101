-- ===================================================
-- web101 - Task Management System Schema
-- ===================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ===================================================
-- ตาราง users (เดิม)
-- ===================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) CHARACTER SET utf8 NOT NULL,
  `lastname` varchar(255) CHARACTER SET utf8 NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('ชาย','หญิง','ไม่ระบุ') CHARACTER SET utf8 NOT NULL,
  `interests` text CHARACTER SET utf8 NOT NULL,
  `description` text CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- ตาราง projects
-- ความสัมพันธ์: users (1) ──< (many) projects
-- ===================================================
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL,
  `description` text CHARACTER SET utf8,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- ตาราง tasks
-- ความสัมพันธ์: projects (1) ──< (many) tasks
--              users (1) ──< (many) tasks  [assigned_user_id]
-- ===================================================
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8 NOT NULL,
  `description` text CHARACTER SET utf8,
  `status` enum('todo','in_progress','done') DEFAULT 'todo',
  `project_id` int(11) NOT NULL,
  `assigned_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- ตาราง tags
-- ===================================================
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- ตาราง task_tags (junction table)
-- ความสัมพันธ์: tasks (many) ──< >── (many) tags
-- ===================================================
CREATE TABLE `task_tags` (
  `task_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  PRIMARY KEY (`task_id`, `tag_id`),
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- ข้อมูลตัวอย่าง
-- ===================================================
INSERT INTO `users` (`firstname`, `lastname`, `age`, `gender`, `interests`, `description`) VALUES
('สมชาย', 'ใจดี', 25, 'ชาย', 'วิดีโอเกม', 'นักพัฒนาซอฟต์แวร์'),
('สมหญิง', 'รักเรียน', 22, 'หญิง', 'หนังสือ', 'นักศึกษา');

INSERT INTO `projects` (`name`, `description`, `user_id`) VALUES
('เว็บไซต์บริษัท', 'พัฒนาเว็บไซต์หลักของบริษัท', 1),
('แอปมือถือ', 'พัฒนาแอปสำหรับลูกค้า', 2);

INSERT INTO `tags` (`name`) VALUES ('bug'), ('feature'), ('urgent'), ('design');

INSERT INTO `tasks` (`title`, `description`, `status`, `project_id`, `assigned_user_id`) VALUES
('ออกแบบ UI หน้าแรก', 'ออกแบบ mockup หน้า landing page', 'todo', 1, 1),
('สร้าง API login', 'เขียน endpoint สำหรับ authentication', 'in_progress', 1, 2),
('แก้บัค login ไม่ได้', 'user บางคน login ไม่ผ่าน', 'todo', 2, 1);

INSERT INTO `task_tags` (`task_id`, `tag_id`) VALUES
(1, 4),  -- task 1: design
(2, 2),  -- task 2: feature
(3, 1),  -- task 3: bug
(3, 3);  -- task 3: urgent

COMMIT;
