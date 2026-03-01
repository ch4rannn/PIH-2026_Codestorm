import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import academicRoutes from './routes/academic.js'
import noticeRoutes from './routes/notices.js'
import alumniRoutes from './routes/alumni.js'
import feedRoutes from './routes/feed.js'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3001')

// Middleware
app.use(helmet())
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/academic', academicRoutes)
app.use('/api/academic/notices', noticeRoutes)
app.use('/api/alumni', alumniRoutes)
app.use('/api/feed', feedRoutes)

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`\n🚀 UIMS Server running on http://localhost:${PORT}`)
    console.log(`   Health: http://localhost:${PORT}/api/health`)
    console.log(`   Auth:   POST http://localhost:${PORT}/api/auth/login`)
    console.log(`   API:    http://localhost:${PORT}/api/academic/*\n`)
})
