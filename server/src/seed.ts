import pool from './db.js'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function seed() {
    console.log('🗄️  Running schema...')
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
    const statements = schema.split(';').filter(s => s.trim())
    for (const stmt of statements) {
        await pool.query(stmt)
    }
    console.log('✅ Schema created')

    // Check if already seeded
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users') as any
    if (users[0].count > 0) {
        console.log('ℹ️  Data already seeded, skipping...')
        await pool.end()
        return
    }

    console.log('🌱 Seeding data...')
    const hash = await bcrypt.hash('password123', 10)

    // Users
    await pool.query(
        `INSERT INTO users (name, email, password_hash, role, department) VALUES
        ('Rahul Kumar', 'rahul@university.edu', ?, 'student', 'Computer Science'),
        ('Dr. Priya Sharma', 'priya@university.edu', ?, 'faculty', 'Computer Science'),
        ('Admin User', 'admin@university.edu', ?, 'admin', 'Administration'),
        ('Ankit Verma', 'ankit@alumni.edu', ?, 'alumni', 'Computer Science')`,
        [hash, hash, hash, hash]
    )
    console.log('  ✓ Users')

    // Attendance (student user_id=1, 5 subjects × ~30 records each)
    const subjects = [
        { code: 'CS301', name: 'Data Structures & Algorithms' },
        { code: 'CS302', name: 'Operating Systems' },
        { code: 'CS303', name: 'Database Management' },
        { code: 'CS304', name: 'Computer Networks' },
        { code: 'CS305', name: 'Software Engineering' },
    ]
    const attendanceValues: string[] = []
    const attendanceParams: (string | number)[] = []
    for (const subj of subjects) {
        // Generate 6 months of attendance (Sep 2025 - Feb 2026)
        for (let month = 8; month <= 13; month++) {
            const actualMonth = month > 11 ? month - 12 : month
            const year = month > 11 ? 2026 : 2025
            const daysInMonth = new Date(year, actualMonth + 1, 0).getDate()
            // ~4 classes per week, ~16 per month
            for (let day = 1; day <= Math.min(daysInMonth, 28); day += 2) {
                const date = `${year}-${String(actualMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayOfWeek = new Date(date).getDay()
                if (dayOfWeek === 0 || dayOfWeek === 6) continue // skip weekends
                const status = Math.random() > 0.12 ? 'present' : 'absent'
                attendanceValues.push('(1, ?, ?, ?, ?)')
                attendanceParams.push(subj.code, subj.name, date, status)
            }
        }
    }
    if (attendanceValues.length > 0) {
        await pool.query(
            `INSERT INTO attendance (user_id, subject_code, subject_name, date, status) VALUES ${attendanceValues.join(',')}`,
            attendanceParams
        )
    }
    console.log('  ✓ Attendance')

    // Results (semester 5)
    await pool.query(
        `INSERT INTO results (user_id, subject_code, subject_name, semester, internal, external, grade, credits) VALUES
        (1, 'CS301', 'Data Structures & Algorithms', 5, 38, 62, 'A', 4),
        (1, 'CS302', 'Operating Systems', 5, 35, 55, 'A', 4),
        (1, 'CS303', 'Database Management', 5, 40, 65, 'A+', 4),
        (1, 'CS304', 'Computer Networks', 5, 30, 50, 'B+', 3),
        (1, 'CS305', 'Software Engineering', 5, 36, 58, 'A', 3)`
    )
    console.log('  ✓ Results')

    // Assignments
    await pool.query(
        `INSERT INTO assignments (user_id, title, subject_code, deadline, status, grade) VALUES
        (1, 'DSA Assignment 5 - Trees', 'CS301', '2026-03-05', 'pending', NULL),
        (1, 'OS Lab Report - Process Scheduling', 'CS302', '2026-03-02', 'submitted', NULL),
        (1, 'DBMS Project - ER Diagram', 'CS303', '2026-02-28', 'graded', 'A'),
        (1, 'CN Assignment 3 - TCP/IP', 'CS304', '2026-03-10', 'pending', NULL)`
    )
    console.log('  ✓ Assignments')

    // Fees
    await pool.query(
        `INSERT INTO fees (user_id, description, amount, paid, status, due_date, paid_at) VALUES
        (1, 'Sem 6 Tuition Fee', 85000, 85000, 'paid', '2026-01-15', '2026-01-10 10:00:00'),
        (1, 'Sem 6 Hostel Fee', 45000, 45000, 'paid', '2026-01-15', '2026-01-10 10:00:00'),
        (1, 'Sem 6 Lab Fee', 8000, 0, 'pending', '2026-03-15', NULL),
        (1, 'Exam Fee', 3000, 0, 'pending', '2026-03-20', NULL)`
    )
    console.log('  ✓ Fees')

    // Notices
    await pool.query(
        `INSERT INTO notices (title, content, type, priority, pinned, author_id) VALUES
        ('Mid-Semester Exam Schedule Released', 'Mid-semester examinations will begin from March 20, 2026. Detailed subject-wise schedule is available on the exam portal.', 'exam', 'high', true, 3),
        ('Library Extended Hours During Exams', 'The central library will remain open until 11 PM during the examination period (March 20 - April 5).', 'general', 'medium', false, 3),
        ('Annual Sports Day - Registration Open', 'Register for Annual Sports Day 2026. Events: Athletics, Cricket, Football, Badminton, Chess. Last date: March 5.', 'event', 'low', false, 3),
        ('Fee Payment Reminder', 'Students with pending fees are requested to clear their dues before March 15 to avoid late payment charges.', 'finance', 'high', true, 3),
        ('Guest Lecture: AI in Healthcare', 'Dr. Sarah Chen from Stanford will deliver a guest lecture on "AI Applications in Healthcare" on March 3rd at 2 PM.', 'event', 'medium', false, 2)`
    )
    console.log('  ✓ Notices')

    // Alumni Profiles
    await pool.query(
        `INSERT INTO alumni_profiles (user_id, name, email, role, company, batch, department, location, experience, industry, skills, available, linkedin) VALUES
        (4, 'Ankit Verma', 'ankit@alumni.edu', 'SDE-2', 'Google', '2020', 'CS', 'Bangalore', '4 yrs', 'Technology', '["React","Go","K8s"]', true, 'https://linkedin.com/in/ankitverma'),
        (NULL, 'Priya Singh', 'priya.singh@alumni.edu', 'Product Manager', 'Microsoft', '2019', 'CS', 'Hyderabad', '5 yrs', 'Technology', '["Agile","Data","Strategy"]', true, 'https://linkedin.com/in/priyasingh'),
        (NULL, 'Rohit Mehta', 'rohit.mehta@alumni.edu', 'Data Scientist', 'Amazon', '2021', 'IT', 'Bangalore', '3 yrs', 'Technology', '["Python","ML","SQL"]', false, 'https://linkedin.com/in/rohitmehta'),
        (NULL, 'Sneha Patel', 'sneha.patel@alumni.edu', 'UX Designer', 'Flipkart', '2020', 'CS', 'Bangalore', '4 yrs', 'E-Commerce', '["Figma","Research","Design"]', true, 'https://linkedin.com/in/snehapatel'),
        (NULL, 'Vikram Joshi', 'vikram.joshi@alumni.edu', 'DevOps Engineer', 'Netflix', '2018', 'CS', 'Remote', '6 yrs', 'Entertainment', '["AWS","Docker","CI/CD"]', true, 'https://linkedin.com/in/vikramjoshi'),
        (NULL, 'Meera Reddy', 'meera.reddy@alumni.edu', 'ML Engineer', 'Meta', '2019', 'ECE', 'Menlo Park', '5 yrs', 'Technology', '["PyTorch","NLP","CV"]', false, 'https://linkedin.com/in/meerareddy'),
        (NULL, 'Arjun Nair', 'arjun.nair@alumni.edu', 'Consultant', 'McKinsey', '2017', 'MBA', 'Mumbai', '7 yrs', 'Consulting', '["Strategy","Analytics","Leadership"]', true, 'https://linkedin.com/in/arjunnair'),
        (NULL, 'Kavita Sharma', 'kavita.sharma@alumni.edu', 'Backend Engineer', 'Razorpay', '2021', 'CS', 'Bangalore', '3 yrs', 'FinTech', '["Node.js","PostgreSQL","Redis"]', true, 'https://linkedin.com/in/kavitasharma'),
        (NULL, 'Deepak Gupta', 'deepak.gupta@alumni.edu', 'CTO', 'HealthTech Startup', '2016', 'IT', 'Delhi', '8 yrs', 'Healthcare', '["Architecture","Cloud","Team Lead"]', false, 'https://linkedin.com/in/deepakgupta')`
    )
    console.log('  ✓ Alumni Profiles')

    // Boost Feed
    await pool.query(
        `INSERT INTO boost_feed (author_name, author_role, author_company, author_batch, type, title, content, tags, likes_count) VALUES
        ('Ankit Verma', 'SDE-2', 'Google', '2020', 'achievement', 'Promoted to SDE-2 at Google! 🎉', 'Thrilled to share that I have been promoted to SDE-2 at Google. The journey from campus to here has been incredible. Grateful for the mentors and batchmates who helped along the way. Keep pushing, juniors!', '["career","google","promotion"]', 24),
        ('Priya Singh', 'Product Manager', 'Microsoft', '2019', 'opportunity', 'Hiring Interns at Microsoft — Apply Now!', 'My team at Microsoft is looking for talented interns for Summer 2026. Roles in PM, SDE, and Data Science. DM me or apply through the referral link. Happy to refer fellow students and alumni!', '["hiring","internship","microsoft"]', 18),
        ('Vikram Joshi', 'DevOps Engineer', 'Netflix', '2018', 'article', 'How I Cracked Netflix — My Interview Journey', 'Writing about my interview experience at Netflix. 5 rounds, 3 weeks, and the most challenging system design problem I have ever faced. Here are my tips for anyone preparing...', '["interview","tips","netflix"]', 31),
        ('Sneha Patel', 'UX Designer', 'Flipkart', '2020', 'update', 'Launched a new Design System at Flipkart', 'Excited to share that our team just shipped a brand new design system that will power all Flipkart apps. 300+ components, full dark mode support, and accessibility-first approach.', '["design","flipkart","launch"]', 15),
        ('Deepak Gupta', 'CTO', 'HealthTech Startup', '2016', 'milestone', 'Our Startup Raised Series A — $5M! 🚀', 'Proud to announce that our HealthTech startup has raised $5M in Series A funding. From a college project to this — what a ride! Looking for talented engineers to join us.', '["startup","funding","hiring"]', 42),
        ('Kavita Sharma', 'Backend Engineer', 'Razorpay', '2021', 'achievement', 'Open Source Contribution Milestone — 500 PRs', 'Hit 500 merged pull requests on open source projects this week! Most contributions to Node.js ecosystem tools. Open source has accelerated my growth like nothing else.', '["opensource","milestone","nodejs"]', 20)`
    )
    console.log('  ✓ Boost Feed')

    console.log('🎉 Seed complete!')
    await pool.end()
}

seed().catch(err => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
