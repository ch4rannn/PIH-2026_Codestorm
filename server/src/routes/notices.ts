import { Router, Response } from 'express'
import pool from '../db.js'
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/academic/notices
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, search } = req.query
        let query = 'SELECT n.*, u.name as author_name FROM notices n LEFT JOIN users u ON n.author_id = u.id'
        const conditions: string[] = []
        const params: string[] = []

        if (type && type !== 'all') {
            conditions.push('n.type = ?')
            params.push(type as string)
        }
        if (search) {
            conditions.push('(n.title LIKE ? OR n.content LIKE ?)')
            params.push(`%${search}%`, `%${search}%`)
        }

        if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
        query += ' ORDER BY n.pinned DESC, n.created_at DESC'

        const [rows] = await pool.query(query, params) as any

        res.json((rows as any[]).map((n: any) => ({
            id: String(n.id),
            title: n.title,
            content: n.content,
            type: n.type,
            priority: n.priority,
            pinned: !!n.pinned,
            date: n.created_at,
            author: n.author_name || 'System',
        })))
    } catch (err) {
        console.error('Notices error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/academic/notices (admin/faculty)
router.post('/', requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, content, type = 'general', priority = 'medium' } = req.body
        if (!title || !content) { res.status(400).json({ error: 'Title and content required' }); return }

        const [result] = await pool.query(
            'INSERT INTO notices (title, content, type, priority, author_id) VALUES (?, ?, ?, ?, ?)',
            [title, content, type, priority, req.user!.id]
        ) as any

        res.status(201).json({ id: String(result.insertId), success: true })
    } catch (err) {
        console.error('Create notice error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/academic/notices/:id (admin/faculty)
router.put('/:id', requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { title, content, type, priority } = req.body
        await pool.query(
            'UPDATE notices SET title = COALESCE(?, title), content = COALESCE(?, content), type = COALESCE(?, type), priority = COALESCE(?, priority) WHERE id = ?',
            [title, content, type, priority, id]
        )
        res.json({ success: true })
    } catch (err) {
        console.error('Update notice error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// DELETE /api/academic/notices/:id (admin/faculty)
router.delete('/:id', requireRole('admin', 'faculty'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await pool.query('DELETE FROM notices WHERE id = ?', [req.params.id])
        res.json({ success: true })
    } catch (err) {
        console.error('Delete notice error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// PUT /api/academic/notices/:id/pin (admin)
router.put('/:id/pin', requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await pool.query('UPDATE notices SET pinned = NOT pinned WHERE id = ?', [req.params.id])
        res.json({ success: true })
    } catch (err) {
        console.error('Pin notice error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
