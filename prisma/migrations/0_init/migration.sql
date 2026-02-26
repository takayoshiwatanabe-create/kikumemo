-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `avatar_url` VARCHAR(500) NULL,
    `subscription_plan` ENUM('free', 'monthly', 'yearly') NOT NULL DEFAULT 'free',
    `subscription_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `idx_email`(`email`),
    INDEX `idx_subscription`(`subscription_plan`, `subscription_expires`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recording_sessions` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `status` ENUM('recording', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'recording',
    `audio_file_path` VARCHAR(500) NULL,
    `transcript` TEXT NULL,
    `user_notes` TEXT NULL,
    `ai_summary` TEXT NULL,
    `duration_seconds` INTEGER NOT NULL DEFAULT 0,
    `language_code` VARCHAR(10) NOT NULL DEFAULT 'ja',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `idx_user_created`(`user_id`, `created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_outputs` (
    `id` VARCHAR(36) NOT NULL,
    `session_id` VARCHAR(36) NOT NULL,
    `type` ENUM('summary', 'todos', 'key_points', 'decisions', 'open_issues') NOT NULL,
    `content` TEXT NOT NULL,
    `confidence_score` DECIMAL(3, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_session_type`(`session_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_preferences` (
    `user_id` VARCHAR(36) NOT NULL,
    `language` VARCHAR(10) NOT NULL DEFAULT 'ja',
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Tokyo',
    `audio_quality` ENUM('standard', 'high') NOT NULL DEFAULT 'standard',
    `auto_save` BOOLEAN NOT NULL DEFAULT true,
    `export_format` ENUM('markdown', 'docx', 'pdf') NOT NULL DEFAULT 'markdown',

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `recording_sessions` ADD CONSTRAINT `recording_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_outputs` ADD CONSTRAINT `ai_outputs_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `recording_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
