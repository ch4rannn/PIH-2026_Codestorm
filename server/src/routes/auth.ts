import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role } = req.body

        let user: any = null

        if (role) {
            // Demo login — find the seeded user for this role
            const [rows] = await pool.query('SELECT * FROM users WHERE role = ? LIMIT 1', [role]) as any
            if (rows.length) user = rows[0]
        }

        if (!user && email) {
            // Normal login — find by email
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as any
            if (rows.length) {
                // Verify password for non-demo login
                const valid = await bcrypt.compare(password || '', rows[0].password_hash)
                if (!valid) {
                    res.status(401).json({ error: 'Invalid credentials' })
                    return
                }
                user = rows[0]
            }
        }

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        )

        res.json({
            token,
            user: {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar || '',
            },
        })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role = 'student', department } = req.body
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password required' })
            return
        }

        const hash = await bcrypt.hash(password, 10)
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
            [name, email, hash, role, department || null]
        ) as any

        const token = jwt.sign(
            { id: result.insertId, role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        )

        res.status(201).json({
            token,
            user: { id: String(result.insertId), name, email, role, department, avatar: '' },
        })
    } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Email already registered' })
            return
        }
        console.error('Register error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, role, department, avatar FROM users WHERE id = ?',
            [req.user!.id]
        ) as any

        if (!rows.length) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        const user = rows[0]
        res.json({ id: String(user.id), name: user.name, email: user.email, role: user.role, department: user.department, avatar: user.avatar || '' })
    } catch (err) {
        console.error('Me error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
