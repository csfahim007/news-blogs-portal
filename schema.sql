-- PineSaaS Blogs Database Schema
-- Generated from Prisma Schema
-- MySQL Database Schema

-- Create database (optional - comment out if database already exists)
-- CREATE DATABASE IF NOT EXISTS pinesaas_blogs;
-- USE pinesaas_blogs;

-- =====================================================
-- Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191),
  `emailVerified` DATETIME(3),
  `image` VARCHAR(191),
  `bio` LONGTEXT,
  `role` VARCHAR(191) NOT NULL DEFAULT 'user',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Accounts Table (OAuth/Third-party auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NOT NULL,
  `refresh_token` LONGTEXT,
  `access_token` LONGTEXT,
  `expires_at` INT,
  `token_type` VARCHAR(191),
  `scope` VARCHAR(191),
  `id_token` LONGTEXT,
  `session_state` VARCHAR(191),

  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_provider_providerAccountId_key` (`provider`, `providerAccountId`),
  KEY `accounts_userId_fkey` (`userId`),
  CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sessions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(191) NOT NULL,
  `sessionToken` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_sessionToken_key` (`sessionToken`),
  KEY `sessions_userId_fkey` (`userId`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Verification Tokens Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `verification_tokens` (
  `identifier` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,

  UNIQUE KEY `verification_tokens_token_key` (`token`),
  UNIQUE KEY `verification_tokens_identifier_token_key` (`identifier`, `token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Categories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` LONGTEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_key` (`name`),
  UNIQUE KEY `categories_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tags Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `tags` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_name_key` (`name`),
  UNIQUE KEY `tags_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Blogs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` LONGTEXT,
  `coverImage` VARCHAR(191),
  `published` BOOLEAN NOT NULL DEFAULT FALSE,
  `views` INT NOT NULL DEFAULT 0,
  `authorId` VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `metaTitle` VARCHAR(70),
  `metaDescription` VARCHAR(160),
  `keywords` LONGTEXT,
  `canonicalUrl` VARCHAR(191),
  `ogImage` VARCHAR(191),
  `noIndex` BOOLEAN NOT NULL DEFAULT FALSE,
  `titleAlignment` VARCHAR(191) NOT NULL DEFAULT 'left',

  PRIMARY KEY (`id`),
  UNIQUE KEY `blogs_slug_key` (`slug`),
  KEY `blogs_authorId_idx` (`authorId`),
  KEY `blogs_categoryId_idx` (`categoryId`),
  KEY `blogs_published_idx` (`published`),
  KEY `blogs_createdAt_idx` (`createdAt`),
  KEY `blogs_views_idx` (`views`),
  KEY `blogs_slug_idx` (`slug`),
  CONSTRAINT `blogs_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blogs_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Blog to Tag Join Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `_blogtotag` (
  `A` VARCHAR(191) NOT NULL,
  `B` VARCHAR(191) NOT NULL,

  UNIQUE KEY `_blogtotag_AB_unique` (`A`, `B`),
  KEY `_blogtotag_B_index` (`B`),
  CONSTRAINT `_blogtotag_A_fkey` FOREIGN KEY (`A`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `_blogtotag_B_fkey` FOREIGN KEY (`B`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Comments Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `comments` (
  `id` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `authorId` VARCHAR(191) NOT NULL,
  `blogId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `comments_blogId_idx` (`blogId`),
  KEY `comments_authorId_idx` (`authorId`),
  CONSTRAINT `comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blogs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Likes Table (Blog likes)
-- =====================================================
CREATE TABLE IF NOT EXISTS `likes` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `blogId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `likes_userId_blogId_key` (`userId`, `blogId`),
  KEY `likes_blogId_idx` (`blogId`),
  CONSTRAINT `likes_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Blog Ratings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `blog_ratings` (
  `id` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `userId` VARCHAR(191),
  `sessionId` VARCHAR(191),
  `blogId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `blog_ratings_blogId_userId_key` (`blogId`, `userId`),
  UNIQUE KEY `blog_ratings_blogId_sessionId_key` (`blogId`, `sessionId`),
  KEY `blog_ratings_blogId_idx` (`blogId`),
  KEY `blog_ratings_userId_fkey` (`userId`),
  CONSTRAINT `blog_ratings_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_ratings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Blog Views Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `blog_views` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191),
  `sessionId` VARCHAR(191),
  `blogId` VARCHAR(191) NOT NULL,
  `duration` INT NOT NULL DEFAULT 0,
  `scrolled` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `blog_views_blogId_idx` (`blogId`),
  KEY `blog_views_userId_idx` (`userId`),
  KEY `blog_views_sessionId_idx` (`sessionId`),
  KEY `blog_views_createdAt_idx` (`createdAt`),
  CONSTRAINT `blog_views_blogId_fkey` FOREIGN KEY (`blogId`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_views_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- News Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `news` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `excerpt` LONGTEXT,
  `coverImage` VARCHAR(191),
  `published` BOOLEAN NOT NULL DEFAULT FALSE,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `views` INT NOT NULL DEFAULT 0,
  `authorId` VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `metaTitle` VARCHAR(70),
  `metaDescription` VARCHAR(160),
  `keywords` LONGTEXT,
  `canonicalUrl` VARCHAR(191),
  `ogImage` VARCHAR(191),
  `noIndex` BOOLEAN NOT NULL DEFAULT FALSE,
  `titleAlignment` VARCHAR(191) NOT NULL DEFAULT 'left',

  PRIMARY KEY (`id`),
  UNIQUE KEY `news_slug_key` (`slug`),
  KEY `news_authorId_idx` (`authorId`),
  KEY `news_categoryId_idx` (`categoryId`),
  KEY `news_published_idx` (`published`),
  KEY `news_featured_idx` (`featured`),
  KEY `news_createdAt_idx` (`createdAt`),
  KEY `news_views_idx` (`views`),
  KEY `news_slug_idx` (`slug`),
  CONSTRAINT `news_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `news_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- News Ratings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `news_ratings` (
  `id` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `userId` VARCHAR(191),
  `sessionId` VARCHAR(191),
  `newsId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `news_ratings_newsId_userId_key` (`newsId`, `userId`),
  UNIQUE KEY `news_ratings_newsId_sessionId_key` (`newsId`, `sessionId`),
  KEY `news_ratings_newsId_idx` (`newsId`),
  KEY `news_ratings_userId_fkey` (`userId`),
  CONSTRAINT `news_ratings_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news` (`id`) ON DELETE CASCADE,
  CONSTRAINT `news_ratings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- News Views Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `news_views` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191),
  `sessionId` VARCHAR(191),
  `newsId` VARCHAR(191) NOT NULL,
  `duration` INT NOT NULL DEFAULT 0,
  `scrolled` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  KEY `news_views_newsId_idx` (`newsId`),
  KEY `news_views_userId_idx` (`userId`),
  KEY `news_views_sessionId_idx` (`sessionId`),
  KEY `news_views_createdAt_idx` (`createdAt`),
  CONSTRAINT `news_views_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news` (`id`) ON DELETE CASCADE,
  CONSTRAINT `news_views_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Contact Messages Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(191),
  `message` LONGTEXT NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'unread',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `contact_messages_status_idx` (`status`),
  KEY `contact_messages_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Feedback Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `authorName` VARCHAR(191),
  `authorEmail` VARCHAR(191),
  `userId` VARCHAR(191),
  `mentionedBlogId` VARCHAR(191),
  `mentionedNewsId` VARCHAR(191),
  `likes` INT NOT NULL DEFAULT 0,
  `dislikes` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `feedbacks_userId_idx` (`userId`),
  KEY `feedbacks_mentionedBlogId_idx` (`mentionedBlogId`),
  KEY `feedbacks_mentionedNewsId_idx` (`mentionedNewsId`),
  KEY `feedbacks_createdAt_idx` (`createdAt`),
  CONSTRAINT `feedbacks_mentionedBlogId_fkey` FOREIGN KEY (`mentionedBlogId`) REFERENCES `blogs` (`id`),
  CONSTRAINT `feedbacks_mentionedNewsId_fkey` FOREIGN KEY (`mentionedNewsId`) REFERENCES `news` (`id`),
  CONSTRAINT `feedbacks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Feedback Comments Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `feedback_comments` (
  `id` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `authorName` VARCHAR(191),
  `authorEmail` VARCHAR(191),
  `userId` VARCHAR(191),
  `feedbackId` VARCHAR(191) NOT NULL,
  `parentId` VARCHAR(191),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `feedback_comments_feedbackId_idx` (`feedbackId`),
  KEY `feedback_comments_userId_idx` (`userId`),
  KEY `feedback_comments_parentId_idx` (`parentId`),
  KEY `feedback_comments_createdAt_idx` (`createdAt`),
  CONSTRAINT `feedback_comments_feedbackId_fkey` FOREIGN KEY (`feedbackId`) REFERENCES `feedbacks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `feedback_comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Feedback Likes Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `feedback_likes` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191),
  `sessionId` VARCHAR(191),
  `feedbackId` VARCHAR(191) NOT NULL,
  `isLike` BOOLEAN NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE KEY `feedback_likes_feedbackId_userId_key` (`feedbackId`, `userId`),
  UNIQUE KEY `feedback_likes_feedbackId_sessionId_key` (`feedbackId`, `sessionId`),
  KEY `feedback_likes_feedbackId_idx` (`feedbackId`),
  CONSTRAINT `feedback_likes_feedbackId_fkey` FOREIGN KEY (`feedbackId`) REFERENCES `feedbacks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Site Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'default',
  `breakingNewsTitle` LONGTEXT,
  `breakingNewsId` VARCHAR(191),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Indexes Summary
-- =====================================================
-- All tables are created with appropriate indexes for:
-- - Primary Keys (id)
-- - Foreign Keys (relationships)
-- - Unique Constraints (email, slug, etc.)
-- - Performance Indexes (published, createdAt, views, etc.)

-- =====================================================
-- Table Information
-- =====================================================
-- Total Tables: 18
-- 1. users - User accounts and profiles
-- 2. accounts - OAuth provider accounts
-- 3. sessions - User sessions
-- 4. verification_tokens - Email verification tokens
-- 5. categories - Blog and news categories
-- 6. tags - Blog tags
-- 7. blogs - Blog posts
-- 8. _blogtotag - Join table for blogs and tags
-- 9. comments - Blog comments
-- 10. likes - Blog likes
-- 11. blog_ratings - Blog ratings
-- 12. blog_views - Blog view tracking
-- 13. news - News articles
-- 14. news_ratings - News ratings
-- 15. news_views - News view tracking
-- 16. contact_messages - Contact form submissions
-- 17. feedbacks - User feedback
-- 18. feedback_comments - Feedback comments and replies
-- 19. feedback_likes - Feedback likes/dislikes
-- 20. site_settings - Global site configuration
