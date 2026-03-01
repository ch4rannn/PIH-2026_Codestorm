-- UIMS 2.0 Database Schema

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'faculty', 'admin', 'alumni') NOT NULL DEFAULT 'student',
    department VARCHAR(100),
    avatar VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_code VARCHAR(10) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (user_id, subject_code, date)
);

CREATE TABLE IF NOT EXISTS results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_code VARCHAR(10) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    internal INT NOT NULL DEFAULT 0,
    external INT NOT NULL DEFAULT 0,
    grade VARCHAR(5) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_result (user_id, subject_code, semester)
);

CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    subject_code VARCHAR(10) NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('pending', 'submitted', 'graded') NOT NULL DEFAULT 'pending',
    file_path VARCHAR(500) DEFAULT NULL,
    grade VARCHAR(5) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('paid', 'pending', 'partial') NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('exam', 'general', 'event', 'finance', 'academic') NOT NULL DEFAULT 'general',
    priority ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS study_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    data_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alumni_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(200) NOT NULL DEFAULT '',
    company VARCHAR(200) NOT NULL DEFAULT '',
    batch VARCHAR(10) NOT NULL,
    department VARCHAR(100) NOT NULL DEFAULT '',
    location VARCHAR(200) DEFAULT '',
    experience VARCHAR(50) DEFAULT '',
    industry VARCHAR(100) DEFAULT '',
    skills JSON DEFAULT ('[]'),
    available BOOLEAN DEFAULT TRUE,
    linkedin VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS boost_feed (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(200) NOT NULL,
    author_role VARCHAR(200) DEFAULT '',
    author_company VARCHAR(200) DEFAULT '',
    author_batch VARCHAR(10) DEFAULT '',
    type ENUM('achievement', 'opportunity', 'update', 'article', 'milestone') NOT NULL DEFAULT 'update',
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    tags JSON DEFAULT ('[]'),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boost_feed_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feed_id INT NOT NULL,
    user_identifier VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feed_id) REFERENCES boost_feed(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (feed_id, user_identifier)
);

CREATE TABLE IF NOT EXISTS career_listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(100) NOT NULL,
    type ENUM('internship', 'freelance') NOT NULL,
    location VARCHAR(100) DEFAULT 'Remote',
    stipend VARCHAR(50),
    budget VARCHAR(50),
    domain VARCHAR(50),
    duration VARCHAR(50),
    deadline VARCHAR(50),
    skills JSON,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    verified BOOLEAN DEFAULT FALSE,
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    listing_id INT,
    listing_title VARCHAR(200) NOT NULL,
    company VARCHAR(100) NOT NULL,
    type ENUM('Internship', 'Freelance', 'Micro Task') NOT NULL,
    status ENUM('under_review', 'shortlisted', 'accepted', 'rejected') DEFAULT 'under_review',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES career_listings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS micro_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    reward DECIMAL(10,2) NOT NULL,
    time_est VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_id INT NOT NULL,
    reward_earned DECIMAL(10,2) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES micro_tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_completion (user_id, task_id)
);

CREATE TABLE IF NOT EXISTS content_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Internship', 'Freelance', 'Notice', 'Event', 'Alumni') NOT NULL,
    title VARCHAR(200) NOT NULL,
    submitted_by VARCHAR(100) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reference_id INT, -- ID of the related internship, gig, or notice
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
