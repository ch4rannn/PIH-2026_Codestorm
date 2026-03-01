import { Router, Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

// ——— LIST alumni (with search & filters) ———

// GET /api/alumni
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, batch, department, company, industry, available } = req.query

        let query = 'SELECT * FROM alumni_profiles WHERE 1=1'
        const params: any[] = []

        if (search) {
            query += ' AND (name LIKE ? OR role LIKE ? OR company LIKE ?)'
            const s = `%${search}%`
            params.push(s, s, s)
        }
        if (batch) { query += ' AND batch = ?'; params.push(batch) }
        if (department) { query += ' AND department = ?'; params.push(department) }
        if (company) { query += ' AND company = ?'; params.push(company) }
        if (industry) { query += ' AND industry = ?'; params.push(industry) }
        if (available !== undefined) {
            query += ' AND available = ?'
            params.push(available === 'true' ? 1 : 0)
        }

        query += ' ORDER BY created_at DESC'

        const [rows] = await pool.query(query, params) as any

        // Filter options from all data
        const [allRows] = await pool.query('SELECT DISTINCT batch, department, company, industry FROM alumni_profiles') as any
        const filterOptions = {
            batches: [...new Set((allRows as any[]).map((r: any) => r.batch))].sort(),
            departments: [...new Set((allRows as any[]).map((r: any) => r.department))].filter(Boolean).sort(),
            companies: [...new Set((allRows as any[]).map((r: any) => r.company))].filter(Boolean).sort(),
            industries: [...new Set((allRows as any[]).map((r: any) => r.industry))].filter(Boolean).sort(),
        }

        // Stats
        const [statsRows] = await pool.query(
            `SELECT COUNT(*) as total,
                    SUM(available = 1) as available_mentors,
                    COUNT(DISTINCT company) as companies_count,
                    COUNT(DISTINCT industry) as industries_count
             FROM alumni_profiles`
        ) as any
        const s = statsRows[0]

        res.json({
            count: (rows as any[]).length,
            next: null,
            previous: null,
            results: (rows as any[]).map((r: any) => ({
                id: r.id,
                name: r.name,
                email: r.email,
                role: r.role,
                company: r.company,
                batch: r.batch,
                department: r.department,
                location: r.location,
                experience: r.experience,
                industry: r.industry,
                skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : (r.skills || []),
                available: Boolean(r.available),
                linkedin: r.linkedin,
            })),
            filter_options: filterOptions,
            stats: {
                total: Number(s.total),
                available_mentors: Number(s.available_mentors),
                companies_count: Number(s.companies_count),
                industries_count: Number(s.industries_count),
            },
        })
    } catch (err) {
        console.error('Alumni list error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ——— GET single alumni ———

// GET /api/alumni/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query('SELECT * FROM alumni_profiles WHERE id = ?', [req.params.id]) as any
        if (!rows.length) { res.status(404).json({ error: 'Alumni not found' }); return }
        const r = rows[0]
        res.json({
            id: r.id, name: r.name, email: r.email, role: r.role,
            company: r.company, batch: r.batch, department: r.department,
            location: r.location, experience: r.experience, industry: r.industry,
            skills: typeof r.skills === 'string' ? JSON.parse(r.skills) : (r.skills || []),
            available: Boolean(r.available), linkedin: r.linkedin,
            created_at: r.created_at, updated_at: r.updated_at,
        })
    } catch (err) {
        console.error('Alumni detail error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ——— REGISTER (self-registration) ———

// POST /api/alumni
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, role, company, batch, department, location, experience, industry, skills, available, linkedin } = req.body

        if (!name || !email || !batch) {
            res.status(400).json({ error: 'Name, email, and batch are required' })
            return
        }

        const [result] = await pool.query(
            `INSERT INTO alumni_profiles (name, email, role, company, batch, department, location, experience, industry, skills, available, linkedin)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, role || '', company || '', batch, department || '', location || '', experience || '', industry || '', JSON.stringify(skills || []), available !== false ? 1 : 0, linkedin || '']
        ) as any

        res.status(201).json({ id: result.insertId, success: true, message: 'Alumni registered successfully' })
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'An alumni with this email already exists' })
            return
        }
        console.error('Alumni register error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ——— UPDATE ———

// PUT /api/alumni/:id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, role, company, batch, department, location, experience, industry, skills, available, linkedin } = req.body
        await pool.query(
            `UPDATE alumni_profiles SET name=?, email=?, role=?, company=?, batch=?, department=?, location=?, experience=?, industry=?, skills=?, available=?, linkedin=? WHERE id=?`,
            [name, email, role, company, batch, department, location, experience, industry, JSON.stringify(skills || []), available ? 1 : 0, linkedin, req.params.id]
        )
        res.json({ success: true })
    } catch (err) {
        console.error('Alumni update error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ——— DELETE ———

// DELETE /api/alumni/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        await pool.query('DELETE FROM alumni_profiles WHERE id = ?', [req.params.id])
        res.json({ success: true })
    } catch (err) {
        console.error('Alumni delete error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
