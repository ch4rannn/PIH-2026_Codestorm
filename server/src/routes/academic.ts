import { Router, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pool from '../db.js'
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

const router = Router()
router.use(authMiddleware)

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

// GET /api/academic/attendance
router.get('/attendance', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id

        // Subject-wise breakdown
        const [subjects] = await pool.query(
            `SELECT subject_code, subject_name,
                    SUM(status = 'present') as present,
                    SUM(status = 'absent') as absent,
                    COUNT(*) as total
             FROM attendance WHERE user_id = ?
             GROUP BY subject_code, subject_name
             ORDER BY subject_code`,
            [userId]
        ) as any

        // Monthly breakdown
        const [monthly] = await pool.query(
            `SELECT DATE_FORMAT(date, '%b') as month,
                    DATE_FORMAT(date, '%Y-%m') as month_key,
                    ROUND(SUM(status = 'present') / COUNT(*) * 100, 1) as pct
             FROM attendance WHERE user_id = ?
             GROUP BY month_key, month
             ORDER BY month_key`,
            [userId]
        ) as any

        // Overall stats
        const totalClasses = (subjects as any[]).reduce((s: number, r: any) => s + Number(r.total), 0)
        const totalPresent = (subjects as any[]).reduce((s: number, r: any) => s + Number(r.present), 0)

        res.json({
            subjects: (subjects as any[]).map((s: any) => ({
                code: s.subject_code,
                subject: s.subject_name,
                present: Number(s.present),
                absent: Number(s.absent),
                total: Number(s.total),
                pct: Number(s.total) > 0 ? Math.round(Number(s.present) / Number(s.total) * 1000) / 10 : 0,
            })),
            monthly: (monthly as any[]).map((m: any) => ({ month: m.month, pct: Number(m.pct) })),
            overall: {
                totalClasses,
                present: totalPresent,
                absent: totalClasses - totalPresent,
                average: totalClasses > 0 ? Math.round(totalPresent / totalClasses * 1000) / 10 : 0,
            },
        })
    } catch (err) {
        console.error('Attendance error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/academic/attendance (mark attendance — faculty)
router.post('/attendance', requireRole('faculty', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId, subjectCode, subjectName, date, status } = req.body
        await pool.query(
            `INSERT INTO attendance (user_id, subject_code, subject_name, date, status)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status)`,
            [userId, subjectCode, subjectName, date, status]
        )
        res.json({ success: true })
    } catch (err) {
        console.error('Mark attendance error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── RESULTS ─────────────────────────────────────────────────────────────────

// GET /api/academic/results
router.get('/results', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const semester = req.query.semester ? Number(req.query.semester) : undefined

        let query = 'SELECT * FROM results WHERE user_id = ?'
        const params: (number | undefined)[] = [userId]
        if (semester) {
            query += ' AND semester = ?'
            params.push(semester)
        }
        query += ' ORDER BY semester DESC, subject_code'

        const [rows] = await pool.query(query, params) as any

        // Compute SGPA for latest semester
        const gradePoints: Record<string, number> = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 }
        const results = rows as any[]
        const semesters = [...new Set(results.map((r: any) => r.semester))] as number[]
        const latestSem = Math.max(...semesters, 0)

        const latestResults = results.filter((r: any) => r.semester === latestSem)
        let sgpa = 0
        if (latestResults.length > 0) {
            const totalCredits = latestResults.reduce((s: number, r: any) => s + r.credits, 0)
            const weightedGP = latestResults.reduce((s: number, r: any) => s + (gradePoints[r.grade] || 0) * r.credits, 0)
            sgpa = totalCredits > 0 ? Math.round(weightedGP / totalCredits * 10) / 10 : 0
        }

        // CGPA across all semesters
        const totalCreditsAll = results.reduce((s: number, r: any) => s + r.credits, 0)
        const weightedGPAll = results.reduce((s: number, r: any) => s + (gradePoints[r.grade] || 0) * r.credits, 0)
        const cgpa = totalCreditsAll > 0 ? Math.round(weightedGPAll / totalCreditsAll * 10) / 10 : 0

        res.json({
            results: results.map((r: any) => ({
                code: r.subject_code,
                subject: r.subject_name,
                semester: r.semester,
                internal: r.internal,
                external: r.external,
                total: r.internal + r.external,
                grade: r.grade,
                credits: r.credits,
            })),
            sgpa,
            cgpa,
            totalCredits: totalCreditsAll,
            semesters,
        })
    } catch (err) {
        console.error('Results error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────

// GET /api/academic/assignments
router.get('/assignments', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const [rows] = await pool.query(
            'SELECT * FROM assignments WHERE user_id = ? ORDER BY deadline ASC',
            [userId]
        ) as any

        res.json((rows as any[]).map((a: any) => ({
            id: String(a.id),
            title: a.title,
            subject: a.subject_code,
            deadline: a.deadline,
            status: a.status,
            submitted: a.status !== 'pending',
            grade: a.grade,
            filePath: a.file_path,
        })))
    } catch (err) {
        console.error('Assignments error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/academic/assignments (create — faculty)
router.post('/assignments/create', requireRole('faculty', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { userId, title, subjectCode, deadline } = req.body
        const [result] = await pool.query(
            'INSERT INTO assignments (user_id, title, subject_code, deadline) VALUES (?, ?, ?, ?)',
            [userId, title, subjectCode, deadline]
        ) as any
        res.status(201).json({ id: String(result.insertId), success: true })
    } catch (err) {
        console.error('Create assignment error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/academic/assignments/:id/submit
router.put('/assignments/:id/submit', upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const filePath = req.file ? req.file.filename : null

        await pool.query(
            `UPDATE assignments SET status = 'submitted', file_path = ?, submitted_at = NOW() WHERE id = ? AND user_id = ?`,
            [filePath, id, req.user!.id]
        )
        res.json({ success: true })
    } catch (err) {
        console.error('Submit assignment error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/academic/assignments/:id/grade (faculty)
router.put('/assignments/:id/grade', requireRole('faculty', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { grade } = req.body
        await pool.query(
            `UPDATE assignments SET status = 'graded', grade = ? WHERE id = ?`,
            [grade, id]
        )
        res.json({ success: true })
    } catch (err) {
        console.error('Grade assignment error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── FEES ────────────────────────────────────────────────────────────────────

// GET /api/academic/fees
router.get('/fees', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const [rows] = await pool.query(
            'SELECT * FROM fees WHERE user_id = ? ORDER BY due_date ASC',
            [userId]
        ) as any

        const feeList = (rows as any[]).map((f: any) => ({
            id: String(f.id),
            semester: f.description,
            amount: Number(f.amount),
            paid: Number(f.paid),
            status: f.status,
            dueDate: f.due_date,
            paidAt: f.paid_at,
        }))

        const totalAmount = feeList.reduce((s, f) => s + f.amount, 0)
        const totalPaid = feeList.reduce((s, f) => s + f.paid, 0)

        res.json({
            fees: feeList,
            summary: { total: totalAmount, paid: totalPaid, pending: totalAmount - totalPaid },
        })
    } catch (err) {
        console.error('Fees error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/academic/fees/:id/pay
router.post('/fees/:id/pay', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        // Get fee details
        const [rows] = await pool.query('SELECT * FROM fees WHERE id = ? AND user_id = ?', [id, req.user!.id]) as any
        if (!rows.length) { res.status(404).json({ error: 'Fee not found' }); return }

        const fee = rows[0]
        await pool.query(
            `UPDATE fees SET paid = amount, status = 'paid', paid_at = NOW() WHERE id = ?`,
            [fee.id]
        )
        res.json({ success: true, message: `Payment of ₹${Number(fee.amount).toLocaleString()} successful` })
    } catch (err) {
        console.error('Pay fee error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
