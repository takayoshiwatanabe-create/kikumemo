--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -102,6 +102,15 @@
   INDEX idx_user_created (user_id, created_at DESC)
 );
 
+-- Add password_hash to users table for authentication
+ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;
+
+-- Add a unique constraint to email for users table
+ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
+
+-- Add a unique constraint to user_id for user_preferences table
+ALTER TABLE user_preferences ADD CONSTRAINT unique_user_id UNIQUE (user_id);
+
 -- AI生成コンテンツ
 CREATE TABLE ai_outputs (
   id VARCHAR(36) PRIMARY KEY,
