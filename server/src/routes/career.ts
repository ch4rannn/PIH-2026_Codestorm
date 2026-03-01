import { Router, Response } from 'express'
import pool from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// ─── INTERNSHIPS ─────────────────────────────────────────────────────────────

// GET /api/career/internships
router.get('/internships', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, domain, location } = req.query
        let query = `SELECT * FROM career_listings WHERE type = 'internship' AND status = 'open'`
        const params: string[] = []

        if (search) {
            query += ' AND (title LIKE ? OR company LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }
        if (domain && domain !== 'All') {
            query += ' AND domain = ?'
            params.push(domain as string)
        }
        if (location && location !== 'All') {
            query += ' AND location LIKE ?'
            params.push(`%${location}%`)
        }
        query += ' ORDER BY created_at DESC'

        const [rows] = await pool.query(query, params) as any

        // Get user's saved listings
        const userId = req.user!.id
        const [apps] = await pool.query(
            'SELECT listing_id FROM career_applications WHERE user_id = ?', [userId]
        ) as any
        const appliedIds = new Set((apps as any[]).map((a: any) => a.listing_id))

        res.json((rows as any[]).map((r: any) => ({
            id: String(r.id),
            title: r.title,
            company: r.company,
            location: r.location,
            stipend: r.stipend,
            domain: r.domain,
            duration: r.duration,
            verified: !!r.verified,
            applied: appliedIds.has(r.id),
        })))
    } catch (err) {
        console.error('Internships error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── FREELANCE ───────────────────────────────────────────────────────────────

// GET /api/career/freelance
router.get('/freelance', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, category } = req.query
        let query = `SELECT * FROM career_listings WHERE type = 'freelance' AND status = 'open'`
        const params: string[] = []

        if (search) {
            query += ' AND (title LIKE ? OR company LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }
        if (category && category !== 'All') {
            query += ' AND domain = ?'
            params.push(category as string)
        }
        query += ' ORDER BY created_at DESC'

        const [rows] = await pool.query(query, params) as any

        const userId = req.user!.id
        const [apps] = await pool.query(
            'SELECT listing_id FROM career_applications WHERE user_id = ?', [userId]
        ) as any
        const appliedIds = new Set((apps as any[]).map((a: any) => a.listing_id))

        res.json((rows as any[]).map((r: any) => ({
            id: String(r.id),
            title: r.title,
            client: r.company,
            budget: r.budget,
            deadline: r.deadline,
            skills: r.skills ? (typeof r.skills === 'string' ? JSON.parse(r.skills) : r.skills) : [],
            difficulty: r.difficulty,
            category: r.domain,
            applied: appliedIds.has(r.id),
        })))
    } catch (err) {
        console.error('Freelance error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── APPLY ───────────────────────────────────────────────────────────────────

// POST /api/career/apply/:id
router.post('/apply/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const userId = req.user!.id

        // Check if already applied
        const [existing] = await pool.query(
            'SELECT id FROM career_applications WHERE user_id = ? AND listing_id = ?',
            [userId, id]
        ) as any
        if (existing.length) {
            res.status(409).json({ error: 'Already applied' })
            return
        }

        // Get listing details
        const [listings] = await pool.query('SELECT * FROM career_listings WHERE id = ?', [id]) as any
        if (!listings.length) {
            res.status(404).json({ error: 'Listing not found' })
            return
        }

        const listing = listings[0]
        const appType = listing.type === 'internship' ? 'Internship' : 'Freelance'

        await pool.query(
            'INSERT INTO career_applications (user_id, listing_id, listing_title, company, type) VALUES (?, ?, ?, ?, ?)',
            [userId, id, listing.title, listing.company, appType]
        )

        res.status(201).json({ success: true, message: `Applied to ${listing.title}!` })
    } catch (err) {
        console.error('Apply error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── MICRO TASKS ─────────────────────────────────────────────────────────────

// GET /api/career/microtasks
router.get('/microtasks', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const { category } = req.query

        let query = `SELECT * FROM micro_tasks WHERE status = 'active'`
        const params: string[] = []
        if (category && category !== 'All') {
            query += ' AND category = ?'
            params.push(category as string)
        }
        query += ' ORDER BY reward DESC'

        const [tasks] = await pool.query(query, params) as any

        // Get user's completions
        const [completions] = await pool.query(
            'SELECT task_id, reward_earned FROM task_completions WHERE user_id = ?', [userId]
        ) as any
        const completedMap = new Map((completions as any[]).map((c: any) => [c.task_id, c.reward_earned]))

        const totalEarned = (completions as any[]).reduce((s: number, c: any) => s + Number(c.reward_earned), 0)

        res.json({
            tasks: (tasks as any[]).map((t: any) => ({
                id: String(t.id),
                title: t.title,
                reward: Number(t.reward),
                rewardStr: `₹${Number(t.reward)}`,
                time: t.time_est,
                category: t.category,
                completed: completedMap.has(t.id),
            })),
            totalEarned,
        })
    } catch (err) {
        console.error('Micro tasks error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/career/microtasks/:id/complete
router.post('/microtasks/:id/complete', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const userId = req.user!.id

        // Check if already completed
        const [existing] = await pool.query(
            'SELECT id FROM task_completions WHERE user_id = ? AND task_id = ?', [userId, id]
        ) as any
        if (existing.length) {
            res.status(409).json({ error: 'Already completed' })
            return
        }

        // Get task reward
        const [tasks] = await pool.query('SELECT * FROM micro_tasks WHERE id = ?', [id]) as any
        if (!tasks.length) {
            res.status(404).json({ error: 'Task not found' })
            return
        }

        const reward = Number(tasks[0].reward)
        await pool.query(
            'INSERT INTO task_completions (user_id, task_id, reward_earned) VALUES (?, ?, ?)',
            [userId, id, reward]
        )

        // Also add to career_applications for history
        await pool.query(
            'INSERT INTO career_applications (user_id, listing_title, company, type, status) VALUES (?, ?, ?, ?, ?)',
            [userId, tasks[0].title, 'UIMS Platform', 'Micro Task', 'accepted']
        )

        res.json({ success: true, reward, message: `Earned ₹${reward}!` })
    } catch (err) {
        console.error('Complete task error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ─── APPLICATION HISTORY ─────────────────────────────────────────────────────

// GET /api/career/applications
router.get('/applications', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const { status, type, search } = req.query

        let query = 'SELECT * FROM career_applications WHERE user_id = ?'
        const params: (string | number)[] = [userId]

        if (status && status !== 'all') {
            query += ' AND status = ?'
            params.push(status as string)
        }
        if (type && type !== 'all') {
            query += ' AND type = ?'
            params.push(type as string)
        }
        if (search) {
            query += ' AND (listing_title LIKE ? OR company LIKE ?)'
            params.push(`%${search}%`, `%${search}%`)
        }
        query += ' ORDER BY applied_at DESC'

        const [rows] = await pool.query(query, params) as any

        // Compute summary
        const [all] = await pool.query(
            'SELECT status, COUNT(*) as cnt FROM career_applications WHERE user_id = ? GROUP BY status',
            [userId]
        ) as any
        const statusCounts: Record<string, number> = {}
        let total = 0
        for (const row of all as any[]) {
            statusCounts[row.status] = Number(row.cnt)
            total += Number(row.cnt)
        }

        res.json({
            applications: (rows as any[]).map((a: any) => ({
                id: String(a.id),
                title: a.listing_title,
                company: a.company,
                type: a.type,
                status: a.status,
                appliedDate: a.applied_at,
            })),
            summary: {
                total,
                under_review: statusCounts['under_review'] || 0,
                shortlisted: statusCounts['shortlisted'] || 0,
                accepted: statusCounts['accepted'] || 0,
                rejected: statusCounts['rejected'] || 0,
            },
        })
    } catch (err) {
        console.error('Applications error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// GET /api/career/earnings
router.get('/earnings', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id
        const [rows] = await pool.query(
            'SELECT COALESCE(SUM(reward_earned), 0) as total FROM task_completions WHERE user_id = ?',
            [userId]
        ) as any
        res.json({ total: Number(rows[0].total) })
    } catch (err) {
        console.error('Earnings error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
