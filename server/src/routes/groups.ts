import express from 'express'
import pool from '../db.js'

const router = express.Router()

// Simulated auth middle - gets user id from header (or defaults to 1 for demo)
const getUserId = (req: express.Request) => {
    return parseInt(req.headers['x-user-id'] as string || '1')
}

// Get all groups for the current user
router.get('/', async (req, res) => {
    try {
        const userId = getUserId(req)

        const [groups] = await pool.query(`
            SELECT g.*, 
                   (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
                   m.role as user_role
            FROM study_groups g
            JOIN group_members m ON g.id = m.group_id
            WHERE m.user_id = ?
            ORDER BY g.created_at DESC
        `, [userId])

        res.json({ groups })
    } catch (error) {
        console.error('Error fetching groups:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

// Get messages for a specific group
router.get('/:id/messages', async (req, res) => {
    try {
        const userId = getUserId(req)
        const groupId = parseInt(req.params.id)

        // Verify user is in group
        const [membership] = await pool.query('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId]) as any
        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this group' })
        }

        const [messages] = await pool.query(`
            SELECT m.id, m.content, m.created_at, u.name as sender_name, u.role as sender_role, u.avatar, m.sender_id
            FROM group_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.group_id = ?
            ORDER BY m.created_at ASC
        `, [groupId])

        res.json({ messages })
    } catch (error) {
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

// Send a message to a group
router.post('/:id/messages', async (req, res) => {
    try {
        const userId = getUserId(req)
        const groupId = parseInt(req.params.id)
        const { content } = req.body

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required' })
        }

        // Verify user is in group
        const [membership] = await pool.query('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId]) as any
        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this group' })
        }

        const [result] = await pool.query(
            'INSERT INTO group_messages (group_id, sender_id, content) VALUES (?, ?, ?)',
            [groupId, userId, content.trim()]
        ) as any

        // Fetch back the created message
        const [newMessage] = await pool.query(`
            SELECT m.id, m.content, m.created_at, u.name as sender_name, u.role as sender_role, u.avatar, m.sender_id
            FROM group_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?
        `, [result.insertId]) as any

        res.status(201).json(newMessage[0])
    } catch (error) {
        console.error('Error sending message:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

// Get members of a group
router.get('/:id/members', async (req, res) => {
    try {
        const userId = getUserId(req)
        const groupId = parseInt(req.params.id)

        // Verify user is in group
        const [membership] = await pool.query('SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId]) as any
        if (membership.length === 0) {
            return res.status(403).json({ error: 'Not a member of this group' })
        }

        const [members] = await pool.query(`
            SELECT u.id, u.name, u.role, u.department, m.role as group_role, m.joined_at
            FROM group_members m
            JOIN users u ON m.user_id = u.id
            WHERE m.group_id = ?
            ORDER BY m.role ASC, u.name ASC
        `, [groupId])

        res.json({ members })
    } catch (error) {
        console.error('Error fetching members:', error)
        res.status(500).json({ error: 'Server error' })
    }
})

export default router
