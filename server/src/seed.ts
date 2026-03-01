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

    console.log('🎉 Seed complete!')
    await pool.end()
}

seed().catch(err => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
