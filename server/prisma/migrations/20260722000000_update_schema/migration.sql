-- Migration: update_schema
-- Description: Comprehensive schema update for UMU Attendance System

-- ============================================================
-- Phase 1: Add new columns as nullable first (backfill later)
-- ============================================================

-- AcademicYear: add code, startDate, endDate, updatedAt
ALTER TABLE `academic_years` ADD COLUMN `code` VARCHAR(191) NULL;
ALTER TABLE `academic_years` ADD COLUMN `start_date` DATETIME(3) NULL;
ALTER TABLE `academic_years` ADD COLUMN `end_date` DATETIME(3) NULL;
ALTER TABLE `academic_years` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Backfill academic_years from label (label is like "2025/2026")
UPDATE `academic_years` SET
  `code` = `label`,
  `start_date` = `created_at`,
  `end_date` = `created_at`,
  `updated_at` = `created_at`
WHERE `code` IS NULL;

ALTER TABLE `academic_years` MODIFY COLUMN `code` VARCHAR(191) NOT NULL;
ALTER TABLE `academic_years` MODIFY COLUMN `start_date` DATETIME(3) NOT NULL;
ALTER TABLE `academic_years` MODIFY COLUMN `end_date` DATETIME(3) NOT NULL;

-- Semester: add code, startDate, endDate, updatedAt
ALTER TABLE `semesters` ADD COLUMN `code` VARCHAR(191) NULL;
ALTER TABLE `semesters` ADD COLUMN `start_date` DATETIME(3) NULL;
ALTER TABLE `semesters` ADD COLUMN `end_date` DATETIME(3) NULL;
ALTER TABLE `semesters` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `semesters` SET
  `code` = `name`,
  `start_date` = `created_at`,
  `end_date` = `created_at`,
  `updated_at` = `created_at`
WHERE `code` IS NULL;

ALTER TABLE `semesters` MODIFY COLUMN `code` VARCHAR(191) NOT NULL;
ALTER TABLE `semesters` MODIFY COLUMN `start_date` DATETIME(3) NOT NULL;
ALTER TABLE `semesters` MODIFY COLUMN `end_date` DATETIME(3) NOT NULL;

-- Campus: add code, address, latitude, longitude, timezone, isActive, updatedAt
ALTER TABLE `campuses` ADD COLUMN `code` VARCHAR(191) NULL;
ALTER TABLE `campuses` ADD COLUMN `address` VARCHAR(191) NULL;
ALTER TABLE `campuses` ADD COLUMN `latitude` DOUBLE NULL;
ALTER TABLE `campuses` ADD COLUMN `longitude` DOUBLE NULL;
ALTER TABLE `campuses` ADD COLUMN `timezone` VARCHAR(191) NOT NULL DEFAULT 'Africa/Kampala';
ALTER TABLE `campuses` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `campuses` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `campuses` SET
  `code` = SUBSTRING(`name`, 1, 10),
  `updated_at` = `created_at`
WHERE `code` IS NULL;

ALTER TABLE `campuses` MODIFY COLUMN `code` VARCHAR(191) NOT NULL;

-- Faculty: add code, deanId, isActive, updatedAt
ALTER TABLE `faculties` ADD COLUMN `code` VARCHAR(191) NULL;
ALTER TABLE `faculties` ADD COLUMN `dean_id` VARCHAR(191) NULL;
ALTER TABLE `faculties` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `faculties` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `faculties` SET
  `code` = SUBSTRING(`name`, 1, 10),
  `updated_at` = `created_at`
WHERE `code` IS NULL;

ALTER TABLE `faculties` MODIFY COLUMN `code` VARCHAR(191) NOT NULL;

-- Department: add code, hodId, isActive, updatedAt
ALTER TABLE `departments` ADD COLUMN `code` VARCHAR(191) NULL;
ALTER TABLE `departments` ADD COLUMN `hod_id` VARCHAR(191) NULL;
ALTER TABLE `departments` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `departments` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `departments` SET
  `code` = SUBSTRING(`name`, 1, 10),
  `updated_at` = `created_at`
WHERE `code` IS NULL;

ALTER TABLE `departments` MODIFY COLUMN `code` VARCHAR(191) NOT NULL;

-- Programme: add code, durationYears, isActive, updatedAt
ALTER TABLE `programmes` ADD COLUMN `code` VARCHAR(191) NULL;
ALTER TABLE `programmes` ADD COLUMN `duration_years` INT NOT NULL DEFAULT 4;
ALTER TABLE `programmes` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `programmes` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `programmes` SET
  `code` = SUBSTRING(`name`, 1, 10),
  `updated_at` = `created_at`
WHERE `code` IS NULL;

ALTER TABLE `programmes` MODIFY COLUMN `code` VARCHAR(191) NOT NULL;

-- Update programme level enum values (lowercase -> UPPERCASE)
ALTER TABLE `programmes` MODIFY COLUMN `level` ENUM('UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA', 'CERTIFICATE') NOT NULL DEFAULT 'UNDERGRADUATE';

-- Course: add description, prerequisites, level, isActive, updatedAt
ALTER TABLE `courses` ADD COLUMN `description` TEXT NULL;
ALTER TABLE `courses` ADD COLUMN `prerequisites` TEXT NULL;
ALTER TABLE `courses` ADD COLUMN `level` INT NOT NULL DEFAULT 1;
ALTER TABLE `courses` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `courses` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

UPDATE `courses` SET `updated_at` = `created_at`;

-- CourseOffering: add classRepId, academicYearId, maxEnrollment, currentEnrollment, status, isActive, updatedAt
ALTER TABLE `course_offerings` ADD COLUMN `class_rep_id` VARCHAR(191) NULL;
ALTER TABLE `course_offerings` ADD COLUMN `academic_year_id` VARCHAR(191) NULL;
ALTER TABLE `course_offerings` ADD COLUMN `max_enrollment` INT NULL;
ALTER TABLE `course_offerings` ADD COLUMN `current_enrollment` INT NOT NULL DEFAULT 0;
ALTER TABLE `course_offerings` ADD COLUMN `status` ENUM('DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT';
ALTER TABLE `course_offerings` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `course_offerings` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Backfill academic_year_id from semester -> academic_year
UPDATE `course_offerings` co
  JOIN `semesters` s ON co.`academic_year_id` IS NULL
  SET co.`academic_year_id` = s.`academic_year_id`
  WHERE co.`semester_id` = s.`id`;

UPDATE `course_offerings` SET `updated_at` = `created_at`;

-- Now make academic_year_id NOT NULL
ALTER TABLE `course_offerings` MODIFY COLUMN `academic_year_id` VARCHAR(191) NOT NULL;

-- User: add firstName, lastName, phoneNumber, emailVerified, lastLoginAt, etc.
-- First add new columns
ALTER TABLE `users` ADD COLUMN `first_name` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `last_name` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `phone_number` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `users` ADD COLUMN `last_login_at` DATETIME(3) NULL;
ALTER TABLE `users` ADD COLUMN `password_reset_token` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `password_reset_expires` DATETIME(3) NULL;
ALTER TABLE `users` ADD COLUMN `profile_picture` VARCHAR(191) NULL;

-- Backfill: split name into first_name and last_name
UPDATE `users` SET
  `first_name` = CASE
    WHEN LOCATE(' ', `name`) > 0 THEN SUBSTRING(`name`, 1, LOCATE(' ', `name`) - 1)
    ELSE `name`
  END,
  `last_name` = CASE
    WHEN LOCATE(' ', `name`) > 0 THEN SUBSTRING(`name`, LOCATE(' ', `name`) + 1)
    ELSE ''
  END;

ALTER TABLE `users` MODIFY COLUMN `first_name` VARCHAR(191) NOT NULL;
ALTER TABLE `users` MODIFY COLUMN `last_name` VARCHAR(191) NOT NULL;

-- Drop old name column (data preserved in first_name + last_name)
ALTER TABLE `users` DROP COLUMN `name`;

-- Update user status enum (lowercase -> UPPERCASE)
ALTER TABLE `users` MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'ACTIVE';

-- Update user role enum (add new roles)
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('SUPER_ADMIN', 'ADMIN', 'FACULTY_ADMIN', 'DEPARTMENT_ADMIN', 'LECTURER', 'STUDENT') NOT NULL DEFAULT 'STUDENT';

-- Rename reg_number to student_number
ALTER TABLE `users` CHANGE COLUMN `reg_number` `student_number` VARCHAR(191) NULL;

-- AttendanceRecord: add deviceFingerprint, ipAddress, location, statusReason, updatedAt
ALTER TABLE `attendance_records` ADD COLUMN `device_fingerprint` VARCHAR(191) NULL;
ALTER TABLE `attendance_records` ADD COLUMN `ip_address` VARCHAR(191) NULL;
ALTER TABLE `attendance_records` ADD COLUMN `location_lat` DOUBLE NULL;
ALTER TABLE `attendance_records` ADD COLUMN `location_lng` DOUBLE NULL;
ALTER TABLE `attendance_records` ADD COLUMN `status_reason` VARCHAR(191) NULL;
ALTER TABLE `attendance_records` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Update attendance status enum (lowercase -> UPPERCASE)
ALTER TABLE `attendance_records` MODIFY COLUMN `status` ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL DEFAULT 'PRESENT';

-- Update sign_in_method enum (add new methods)
ALTER TABLE `attendance_records` MODIFY COLUMN `sign_in_method` ENUM('QR', 'PIN', 'SELF', 'ADMIN_OVERRIDE') NOT NULL DEFAULT 'SELF';

-- ClassSession: add venueId, semesterId, qrSecret, pinHash, actualTimes, materials, maxCheckInTime
ALTER TABLE `class_sessions` ADD COLUMN `venue_id` VARCHAR(191) NULL;
ALTER TABLE `class_sessions` ADD COLUMN `semester_id` VARCHAR(191) NULL;
ALTER TABLE `class_sessions` ADD COLUMN `actual_start_time` DATETIME(3) NULL;
ALTER TABLE `class_sessions` ADD COLUMN `actual_end_time` DATETIME(3) NULL;
ALTER TABLE `class_sessions` ADD COLUMN `materials` TEXT NULL;
ALTER TABLE `class_sessions` ADD COLUMN `qr_secret` VARCHAR(191) NULL;
ALTER TABLE `class_sessions` ADD COLUMN `pin_hash` VARCHAR(191) NULL;
ALTER TABLE `class_sessions` ADD COLUMN `max_check_in_time` DATETIME(3) NULL;
ALTER TABLE `class_sessions` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Backfill semester_id from courseOffering -> semester
UPDATE `class_sessions` cs
  JOIN `course_offerings` co ON cs.`course_offering_id` = co.`id`
  SET cs.`semester_id` = co.`semester_id`
  WHERE cs.`semester_id` IS NULL;

-- Update session mode enum (lowercase -> UPPERCASE, add HYBRID)
ALTER TABLE `class_sessions` MODIFY COLUMN `mode_of_teaching` ENUM('ONLINE', 'PHYSICAL', 'HYBRID') NOT NULL DEFAULT 'PHYSICAL';

-- Update session status enum (add SCHEDULED, CANCELLED)
ALTER TABLE `class_sessions` MODIFY COLUMN `status` ENUM('SCHEDULED', 'OPEN', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED';

-- AttendancePolicy: add lateThreshold
ALTER TABLE `attendance_policies` ADD COLUMN `late_threshold` INT NOT NULL DEFAULT 15;

-- Enrollment: add classGroupId, status, droppedAt
ALTER TABLE `enrollments` ADD COLUMN `class_group_id` VARCHAR(191) NULL;
ALTER TABLE `enrollments` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'ENROLLED';
ALTER TABLE `enrollments` ADD COLUMN `dropped_at` DATETIME(3) NULL;

-- ClassRep: add isActive
ALTER TABLE `class_reps` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AuditLog: change action to enum, add ipAddress, userAgent
ALTER TABLE `audit_logs` ADD COLUMN `ip_address` VARCHAR(191) NULL;
ALTER TABLE `audit_logs` ADD COLUMN `user_agent` VARCHAR(191) NULL;

-- Rename columns to match Prisma convention
ALTER TABLE `audit_logs` CHANGE COLUMN `target_table` `entity_type` VARCHAR(191) NOT NULL;
ALTER TABLE `audit_logs` CHANGE COLUMN `target_id` `entity_id` VARCHAR(191) NOT NULL;
ALTER TABLE `audit_logs` CHANGE COLUMN `before_json` `before_json` JSON NULL;
ALTER TABLE `audit_logs` CHANGE COLUMN `after_json` `after_json` JSON NULL;

-- ============================================================
-- Phase 2: Create new tables
-- ============================================================

CREATE TABLE `buildings` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `campus_id` VARCHAR(191) NOT NULL,
    `floors` INT NOT NULL DEFAULT 1,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `buildings_campus_id_idx`(`campus_id`),
    UNIQUE INDEX `buildings_code_campus_id_key`(`code`, `campus_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `venues` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `building_id` VARCHAR(191) NOT NULL,
    `floor` INT NOT NULL DEFAULT 0,
    `room_number` VARCHAR(191) NULL,
    `capacity` INT NOT NULL,
    `type` ENUM('LECTURE_HALL', 'LABORATORY', 'SEMINAR_ROOM', 'AUDITORIUM', 'TUTORIAL_ROOM', 'OTHER') NOT NULL DEFAULT 'LECTURE_HALL',
    `has_projector` BOOLEAN NOT NULL DEFAULT false,
    `has_wifi` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `venues_building_id_idx`(`building_id`),
    INDEX `venues_capacity_idx`(`capacity`),
    UNIQUE INDEX `venues_code_building_id_key`(`code`, `building_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `class_groups` (
    `id` VARCHAR(191) NOT NULL,
    `course_offering_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `max_capacity` INT NULL,
    `current_enrollment` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `class_groups_course_offering_id_name_key`(`course_offering_id`, `name`),
    INDEX `class_groups_course_offering_id_idx`(`course_offering_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `timetables` (
    `id` VARCHAR(191) NOT NULL,
    `course_offering_id` VARCHAR(191) NOT NULL,
    `venue_id` VARCHAR(191) NOT NULL,
    `day_of_week` INT NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `week_pattern` VARCHAR(191) DEFAULT 'WEEKLY',
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `timetables_venue_id_day_of_week_start_time_key`(`venue_id`, `day_of_week`, `start_time`),
    INDEX `timetables_course_offering_id_idx`(`course_offering_id`),
    INDEX `timetables_venue_id_idx`(`venue_id`),
    INDEX `timetables_day_of_week_idx`(`day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `device_registrations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `device_fingerprint` VARCHAR(191) NOT NULL,
    `device_name` VARCHAR(191) NULL,
    `platform` ENUM('IOS', 'ANDROID', 'WEB', 'DESKTOP') NOT NULL,
    `push_token` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `registered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_used_at` DATETIME(3) NULL,

    UNIQUE INDEX `device_registrations_user_id_device_fingerprint_key`(`user_id`, `device_fingerprint`),
    INDEX `device_registrations_user_id_idx`(`user_id`),
    INDEX `device_registrations_device_fingerprint_idx`(`device_fingerprint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `device_info` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_sessions_token_key`(`token`),
    UNIQUE INDEX `user_sessions_refresh_token_key`(`refresh_token`),
    INDEX `user_sessions_user_id_idx`(`user_id`),
    INDEX `user_sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('SESSION_STARTED', 'ATTENDANCE_MARKED', 'ATTENDANCE_ABSENT', 'ENROLLMENT_CONFIRMED', 'GRADE_POSTED', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `read_at` DATETIME(3) NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `system_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- Phase 3: Add new indexes
-- ============================================================

CREATE INDEX `academic_years_is_current_idx` ON `academic_years`(`is_current`);
CREATE INDEX `academic_years_start_date_idx` ON `academic_years`(`start_date`);
CREATE INDEX `semesters_is_active_idx` ON `semesters`(`is_active`);
CREATE INDEX `courses_level_idx` ON `courses`(`level`);
CREATE INDEX `course_offerings_status_idx` ON `course_offerings`(`status`);
CREATE INDEX `course_offerings_is_active_idx` ON `course_offerings`(`is_active`);
CREATE INDEX `course_offerings_academic_year_id_idx` ON `course_offerings`(`academic_year_id`);
CREATE INDEX `course_offerings_class_rep_id_idx` ON `course_offerings`(`class_rep_id`);
CREATE INDEX `users_status_idx` ON `users`(`status`);
CREATE INDEX `attendance_records_student_id_created_at_idx` ON `attendance_records`(`student_id`, `created_at`);
CREATE INDEX `attendance_records_session_id_status_idx` ON `attendance_records`(`session_id`, `status`);
CREATE INDEX `class_sessions_semester_id_idx` ON `class_sessions`(`semester_id`);
CREATE INDEX `class_sessions_venue_id_idx` ON `class_sessions`(`venue_id`);
CREATE INDEX `class_sessions_course_offering_id_date_idx` ON `class_sessions`(`course_offering_id`, `date`);
CREATE INDEX `enrollments_class_group_id_idx` ON `enrollments`(`class_group_id`);
CREATE INDEX `enrollments_status_idx` ON `enrollments`(`status`);
CREATE INDEX `audit_logs_action_idx` ON `audit_logs`(`action`);

-- ============================================================
-- Phase 4: Add new unique constraints
-- ============================================================

ALTER TABLE `academic_years` ADD UNIQUE INDEX `academic_years_code_key`(`code`);
ALTER TABLE `campuses` ADD UNIQUE INDEX `campuses_code_key`(`code`);
ALTER TABLE `faculties` ADD UNIQUE INDEX `faculties_code_key`(`code`);
ALTER TABLE `departments` ADD UNIQUE INDEX `departments_code_faculty_id_key`(`code`, `faculty_id`);
ALTER TABLE `departments` ADD UNIQUE INDEX `departments_hod_id_key`(`hod_id`);
ALTER TABLE `programmes` ADD UNIQUE INDEX `programmes_code_department_id_key`(`code`, `department_id`);
ALTER TABLE `semesters` ADD UNIQUE INDEX `semesters_academic_year_id_code_key`(`academic_year_id`, `code`);
ALTER TABLE `users` ADD UNIQUE INDEX `users_student_number_key`(`student_number`);
ALTER TABLE `users` ADD UNIQUE INDEX `users_staff_number_key`(`staff_number`);
ALTER TABLE `faculties` ADD UNIQUE INDEX `faculties_dean_id_key`(`dean_id`);

-- ============================================================
-- Phase 5: Add new foreign keys
-- ============================================================

ALTER TABLE `buildings` ADD CONSTRAINT `buildings_campus_id_fkey` FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `venues` ADD CONSTRAINT `venues_building_id_fkey` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `faculties` ADD CONSTRAINT `faculties_dean_id_fkey` FOREIGN KEY (`dean_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `departments` ADD CONSTRAINT `departments_hod_id_fkey` FOREIGN KEY (`hod_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `course_offerings` ADD CONSTRAINT `course_offerings_class_rep_id_fkey` FOREIGN KEY (`class_rep_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `course_offerings` ADD CONSTRAINT `course_offerings_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `class_groups` ADD CONSTRAINT `class_groups_course_offering_id_fkey` FOREIGN KEY (`course_offering_id`) REFERENCES `course_offerings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `timetables` ADD CONSTRAINT `timetables_course_offering_id_fkey` FOREIGN KEY (`course_offering_id`) REFERENCES `course_offerings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `timetables` ADD CONSTRAINT `timetables_venue_id_fkey` FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `class_sessions` ADD CONSTRAINT `class_sessions_venue_id_fkey` FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `class_sessions` ADD CONSTRAINT `class_sessions_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `device_registrations` ADD CONSTRAINT `device_registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_class_group_id_fkey` FOREIGN KEY (`class_group_id`) REFERENCES `class_groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Phase 6: Drop old venue column (data preserved in venue_id FK)
-- ============================================================

-- NOTE: The old `venue` string column on class_sessions is replaced by venue_id FK
-- Existing venue string data should be migrated to the venues table manually if needed
ALTER TABLE `class_sessions` DROP COLUMN `venue`;
