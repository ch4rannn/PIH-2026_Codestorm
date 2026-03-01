import { Router, Request, Response } from 'express'
import pool from '../db.js'

const router = Router()

// ——— LIST feed posts ———

// GET /api/feed
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, search } = req.query

        let query = 'SELECT * FROM boost_feed WHERE 1=1'
        const params: any[] = []

        if (type && type !== 'all') {
            query += ' AND type = ?'
            params.push(type)
        }
        if (search) {
            query += ' AND (title LIKE ? OR content LIKE ? OR author_name LIKE ?)'
            const s = `%${search}%`
            params.push(s, s, s)
        }

        query += ' ORDER BY created_at DESC'

        const [rows] = await pool.query(query, params) as any

        const posts = (rows as any[]).map((r: any) => ({
            id: r.id,
            author_name: r.author_name,
            author_role: r.author_role,
            author_company: r.author_company,
            author_batch: r.author_batch,
            type: r.type,
            title: r.title,
            content: r.content,
            tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : (r.tags || []),
            likes_count: r.likes_count,
            comments_count: r.comments_count,
            created_at: r.created_at,
        }))

        // Stats
        const [statsRows] = await pool.query(
            `SELECT COUNT(*) as total,
                    SUM(type = 'achievement') as achievements,
                    SUM(type = 'opportunity') as opportunities,
                    SUM(likes_count) as total_likes
             FROM boost_feed`
        ) as any
        const s = statsRows[0]

        res.json({
            posts,
            stats: {
                total: Number(s.total),
                achievements: Number(s.achievements || 0),
                opportunities: Number(s.opportunities || 0),
                total_likes: Number(s.total_likes || 0),
            },
        })
    } catch (err) {
        console.error('Feed list error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ——— CREATE post ———

// POST /api/feed
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { author_name, author_role, author_company, author_batch, type, title, content, tags } = req.body

        if (!author_name || !title || !content) {
            res.status(400).json({ error: 'Author name, title, and content are required' })
            return
        }

        const [result] = await pool.query(
            `INSERT INTO boost_feed (author_name, author_role, author_company, author_batch, type, title, content, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [author_name, author_role || '', author_company || '', author_batch || '', type || 'update', title, content, JSON.stringify(tags || [])]
        ) as any

        res.status(201).json({ id: result.insertId, success: true })
    } catch (err) {
        console.error('Feed create error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ——— LIKE a post ———

// POST /api/feed/:id/like
router.post('/:id/like', async (req: Request, res: Response): Promise<void> => {
    try {
        const feedId = req.params.id
        const { user_identifier } = req.body

        if (!user_identifier) {
            res.status(400).json({ error: 'user_identifier is required' })
            return
        }

        try {
            await pool.query(
                'INSERT INTO boost_feed_likes (feed_id, user_identifier) VALUES (?, ?)',
                [feedId, user_identifier]
            )
            await pool.query('UPDATE boost_feed SET likes_count = likes_count + 1 WHERE id = ?', [feedId])
            res.json({ liked: true })
        } catch (err: any) {
            if (err.code === 'ER_DUP_ENTRY') {
                // Unlike
                await pool.query('DELETE FROM boost_feed_likes WHERE feed_id = ? AND user_identifier = ?', [feedId, user_identifier])
                await pool.query('UPDATE boost_feed SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [feedId])
                res.json({ liked: false })
            } else {
                throw err
            }
        }
    } catch (err) {
        console.error('Feed like error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// ——— DELETE post ———

// DELETE /api/feed/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        await pool.query('DELETE FROM boost_feed WHERE id = ?', [req.params.id])
        res.json({ success: true })
    } catch (err) {
        console.error('Feed delete error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
