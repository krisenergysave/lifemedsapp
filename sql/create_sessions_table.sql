-- Create sessions table for MySQL/MariaDB
CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(191) NOT NULL,
  jti VARCHAR(191) NOT NULL UNIQUE,
  xsrf_token VARCHAR(191),
  user_agent TEXT,
  ip VARCHAR(50),
  expires_at DATETIME,
  revoked BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (jti)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
