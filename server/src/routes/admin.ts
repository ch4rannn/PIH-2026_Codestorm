import { Router, Response } from 'express'
import pool from '../db.js'
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js'
import bcrypt from 'bcryptjs'

const router = Router()
router.use(authMiddleware)
router.use(requireRole('admin')) // Protect all admin routes

// ─── USERS MANAGEMENT ────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { role, search } = req.query
        let query = 'SELECT id, name, email, role, department, avatar, created_at, last_login FROM users WHERE 1=1'
        const params: string[] = []

        if (role) {
            query += ' AND role = ?'
            params.push(role as string)
        }
        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }
        query += ' ORDER BY created_at DESC'

        const [rows] = await pool.query(query, params) as any

        // Mappable enhancements for the frontend (like CGPA or Courses)
        const enhancedRows = await Promise.all((rows as any[]).map(async (u: any) => {
            const user = { ...u, status: 'active' } // mock status for now
            if (u.role === 'student') {
                // Mock roll and sem
                user.roll = `${u.department.substring(0, 2).toUpperCase()}210${u.id}`
                user.sem = 6
                // Fetch average grade mapped to CGPA
                const [grades] = await pool.query('SELECT grade FROM results WHERE user_id = ?', [u.id]) as any
                user.cgpa = grades.length ? 8.5 : 0 // Simplify for demo
            } else if (u.role === 'faculty') {
                user.designation = 'Assistant Prof'
                user.courses = 3
            }
            return user
        }))

        res.json(enhancedRows)
    } catch (err) {
        console.error('Admin users error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/admin/users
router.post('/users', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, department } = req.body
        const hash = await bcrypt.hash(password || 'password123', 10)

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
            [name, email, hash, role || 'student', department || 'General']
        ) as any

        res.status(201).json({ id: result.insertId, message: 'User created' })
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') res.status(409).json({ error: 'Email already exists' })
        else res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/admin/users/:id
router.put('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { name, email, role, department } = req.body

        await pool.query(
            'UPDATE users SET name = ?, email = ?, role = ?, department = ? WHERE id = ?',
            [name, email, role, department, id]
        )
        res.json({ message: 'User updated' })
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id])
        res.json({ message: 'User deleted' })
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── VERIFICATIONS ───────────────────────────────────────────────────────────

// GET /api/admin/verifications
router.get('/verifications', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query('SELECT * FROM content_verifications WHERE status = "pending" ORDER BY created_at ASC') as any
        res.json((rows as any[]).map(r => ({
            id: String(r.id),
            type: r.type,
            title: r.title,
            submittedBy: r.submitted_by,
            date: r.created_at,
            status: r.status
        })))
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/admin/verifications/:id/approve
router.post('/verifications/:id/approve', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        await pool.query('UPDATE content_verifications SET status = "approved" WHERE id = ?', [id])
        res.json({ message: 'Verification approved' })
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/admin/verifications/:id/reject
router.post('/verifications/:id/reject', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        await pool.query('UPDATE content_verifications SET status = "rejected" WHERE id = ?', [id])
        res.json({ message: 'Verification rejected' })
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

// GET /api/admin/analytics
router.get('/analytics', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Quick Stats
        const [totals] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'student') as totalStudents,
                (SELECT COUNT(*) FROM users WHERE role = 'faculty') as totalFaculty,
                (SELECT COUNT(*) FROM content_verifications WHERE status = 'pending') as pendingVerifications,
                (SELECT COUNT(*) FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 7 DAY)) as activeUsers
        `) as any

        // Department Distribution (for Pie Chart)
        const [deptRows] = await pool.query('SELECT department as name, COUNT(*) as value FROM users WHERE role = "student" GROUP BY department') as any

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
        const deptDistribution = (deptRows as any[]).map((d, i) => ({
            name: d.name || 'Unassigned',
            value: Number(d.value),
            color: colors[i % colors.length]
        }))

        if (deptDistribution.length === 0) {
            deptDistribution.push({ name: 'CSE', value: 0, color: '#3b82f6' }) // fallback
        }

        // Student Engagement Trend (Mocked trajectory scaling by DB size for the BarChart)
        const baseStudents = Number(totals[0].totalStudents) || 100
        const trendData = [
            { month: 'Sep', students: Math.floor(baseStudents * 0.7), engagement: 78 },
            { month: 'Oct', students: Math.floor(baseStudents * 0.8), engagement: 82 },
            { month: 'Nov', students: Math.floor(baseStudents * 0.85), engagement: 85 },
            { month: 'Dec', students: Math.floor(baseStudents * 0.82), engagement: 79 },
            { month: 'Jan', students: Math.floor(baseStudents * 0.95), engagement: 88 },
            { month: 'Feb', students: baseStudents, engagement: 91 },
        ]

        res.json({
            stats: {
                totalStudents: totals[0].totalStudents,
                totalFaculty: totals[0].totalFaculty,
                pendingVerifications: totals[0].pendingVerifications,
                activeUsers: totals[0].activeUsers
            },
            deptDistribution,
            trendData
        })
    } catch (err) {
        console.error('Analytics error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
