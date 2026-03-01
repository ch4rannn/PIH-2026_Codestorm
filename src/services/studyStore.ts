// localStorage-based persistence for all Study modules

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StudyNote {
    id: string
    title: string
    content: string
    subject: string
    createdAt: string
    updatedAt: string
}

export interface StudyPdf {
    id: string
    name: string
    size: string
    subject: string
    pages: number
    uploadedAt: string
    dataUrl: string // base64 data URL for in-browser viewing
}

export interface FlashcardSet {
    id: string
    title: string
    subject: string
    cards: { q: string; a: string }[]
    mastered: number
    lastReview: string
    createdAt: string
}

export interface ActivityEntry {
    id: string
    type: 'flashcard_review' | 'pdf_view' | 'note_edit' | 'study_session'
    data: Record<string, unknown>
    timestamp: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getItem<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}

function setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
}

const KEYS = {
    notes: 'uims_study_notes',
    pdfs: 'uims_study_pdfs',
    flashcards: 'uims_flashcard_sets',
    activity: 'uims_study_activity',
} as const

// ─── Default Data ────────────────────────────────────────────────────────────

const DEFAULT_NOTES: StudyNote[] = [
    { id: 'n1', title: 'DSA - Binary Trees Summary', content: 'Binary tree traversals: Inorder (L-Root-R), Preorder (Root-L-R), Postorder (L-R-Root). BST property: left < root < right.\n\nKey operations:\n- Insert: O(log n) average, O(n) worst\n- Search: O(log n) average, O(n) worst\n- Delete: O(log n) average\n\nBalanced BSTs (AVL, Red-Black) guarantee O(log n) for all operations.', subject: 'DSA', createdAt: '2026-02-28T10:00:00Z', updatedAt: '2026-02-28T12:00:00Z' },
    { id: 'n2', title: 'OS - Deadlock Conditions', content: 'Four conditions for deadlock:\n1) Mutual Exclusion - at least one resource held in non-shareable mode\n2) Hold and Wait - process holds resources while waiting for others\n3) No Preemption - resources can\'t be forcibly taken\n4) Circular Wait - circular chain of processes waiting\n\nPrevention: Break at least one condition.\nAvoidance: Banker\'s Algorithm.\nDetection: Resource Allocation Graph.', subject: 'OS', createdAt: '2026-02-27T08:00:00Z', updatedAt: '2026-02-27T10:00:00Z' },
    { id: 'n3', title: 'DBMS - SQL Joins Cheatsheet', content: 'INNER JOIN: matching rows only\nLEFT JOIN: all from left + matching from right\nRIGHT JOIN: all from right + matching from left\nFULL OUTER JOIN: all from both tables\nCROSS JOIN: cartesian product\nSELF JOIN: table joined with itself\n\nPerformance tip: Always index JOIN columns.', subject: 'DBMS', createdAt: '2026-02-25T14:00:00Z', updatedAt: '2026-02-25T14:00:00Z' },
]

const DEFAULT_PDFS: StudyPdf[] = [
    { id: 'p1', name: 'DSA Complete Notes.pdf', size: '2.4 MB', uploadedAt: '2026-02-20', subject: 'DSA', pages: 48, dataUrl: '' },
    { id: 'p2', name: 'Operating Systems - Unit 3.pdf', size: '1.8 MB', uploadedAt: '2026-02-18', subject: 'OS', pages: 32, dataUrl: '' },
    { id: 'p3', name: 'DBMS ER-Diagrams Tutorial.pdf', size: '3.1 MB', uploadedAt: '2026-02-15', subject: 'DBMS', pages: 55, dataUrl: '' },
    { id: 'p4', name: 'Computer Networks - TCP/IP.pdf', size: '1.2 MB', uploadedAt: '2026-02-10', subject: 'CN', pages: 28, dataUrl: '' },
]

const DEFAULT_FLASHCARD_SETS: FlashcardSet[] = [
    {
        id: 'f1', title: 'DSA - Arrays & Sorting', subject: 'DSA', mastered: 5, lastReview: new Date().toISOString(), createdAt: '2026-02-15T10:00:00Z',
        cards: [
            { q: 'What is the time complexity of QuickSort in the average case?', a: 'O(n log n) — QuickSort uses divide-and-conquer with a pivot element.' },
            { q: 'What is a Binary Search Tree (BST)?', a: 'A binary tree where left subtree values < node < right subtree values.' },
            { q: 'Explain Dynamic Programming.', a: 'DP breaks problems into overlapping subproblems, storing results to avoid redundant computation.' },
            { q: 'What is a Hash Table collision?', a: 'When two keys hash to the same index. Resolution: Chaining or Open Addressing.' },
            { q: 'Difference between Stack and Queue?', a: 'Stack: LIFO (push/pop). Queue: FIFO (enqueue/dequeue).' },
            { q: 'What is Merge Sort\'s space complexity?', a: 'O(n) — requires auxiliary array for merging.' },
            { q: 'What is the best case of Bubble Sort?', a: 'O(n) — when array is already sorted (with early termination flag).' },
        ],
    },
    {
        id: 'f2', title: 'OS - Process Management', subject: 'OS', mastered: 3, lastReview: new Date(Date.now() - 86400000).toISOString(), createdAt: '2026-02-14T10:00:00Z',
        cards: [
            { q: 'What is a process?', a: 'A program in execution with its own memory space, program counter, and resources.' },
            { q: 'What are the states of a process?', a: 'New → Ready → Running → Waiting → Terminated.' },
            { q: 'What is a context switch?', a: 'Saving the state of one process and loading another. Involves saving/restoring PCB.' },
            { q: 'Difference between process and thread?', a: 'Process has its own memory; threads share process memory but have own stack/registers.' },
            { q: 'What is a semaphore?', a: 'A synchronization mechanism using wait (P) and signal (V) operations on an integer.' },
        ],
    },
    {
        id: 'f3', title: 'DBMS - Normalization', subject: 'DBMS', mastered: 4, lastReview: new Date(Date.now() - 259200000).toISOString(), createdAt: '2026-02-12T10:00:00Z',
        cards: [
            { q: 'What is 1NF?', a: 'First Normal Form: All attributes contain only atomic (indivisible) values.' },
            { q: 'What is 2NF?', a: '1NF + no partial dependency (non-key attributes depend on entire candidate key).' },
            { q: 'What is 3NF?', a: '2NF + no transitive dependency (non-key attributes don\'t depend on other non-key attributes).' },
            { q: 'What is BCNF?', a: 'For every FD X→Y, X must be a super key. Stricter than 3NF.' },
            { q: 'What is denormalization?', a: 'Intentionally adding redundancy to improve read performance at cost of write complexity.' },
        ],
    },
    {
        id: 'f4', title: 'CN - OSI Model', subject: 'CN', mastered: 3, lastReview: new Date(Date.now() - 432000000).toISOString(), createdAt: '2026-02-10T10:00:00Z',
        cards: [
            { q: 'Name the 7 OSI layers.', a: 'Physical → Data Link → Network → Transport → Session → Presentation → Application.' },
            { q: 'What does the Transport layer do?', a: 'End-to-end communication, segmentation, flow control. Protocols: TCP, UDP.' },
            { q: 'Difference between TCP and UDP?', a: 'TCP: reliable, ordered, connection-oriented. UDP: unreliable, fast, connectionless.' },
            { q: 'What is ARP?', a: 'Address Resolution Protocol: maps IP addresses to MAC addresses on a LAN.' },
            { q: 'What is DNS?', a: 'Domain Name System: translates domain names to IP addresses. Uses port 53.' },
            { q: 'What is subnetting?', a: 'Dividing a network into smaller sub-networks using subnet masks for efficient IP allocation.' },
        ],
    },
]

// ─── Notes ───────────────────────────────────────────────────────────────────

export function getNotes(): StudyNote[] {
    const notes = getItem<StudyNote[]>(KEYS.notes, [])
    if (notes.length === 0) {
        setItem(KEYS.notes, DEFAULT_NOTES)
        return DEFAULT_NOTES
    }
    return notes
}

export function saveNote(note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): StudyNote {
    const notes = getNotes()
    const now = new Date().toISOString()
    if (note.id) {
        const idx = notes.findIndex(n => n.id === note.id)
        if (idx >= 0) {
            notes[idx] = { ...notes[idx], ...note, updatedAt: now }
            setItem(KEYS.notes, notes)
            logActivity('note_edit', { noteId: note.id, title: note.title })
            return notes[idx]
        }
    }
    const newNote: StudyNote = { ...note, id: generateId(), createdAt: now, updatedAt: now }
    notes.unshift(newNote)
    setItem(KEYS.notes, notes)
    logActivity('note_edit', { noteId: newNote.id, title: newNote.title })
    return newNote
}

export function deleteNote(id: string): void {
    const notes = getNotes().filter(n => n.id !== id)
    setItem(KEYS.notes, notes)
}

// ─── PDFs ────────────────────────────────────────────────────────────────────

export function getPdfs(): StudyPdf[] {
    const pdfs = getItem<StudyPdf[]>(KEYS.pdfs, [])
    if (pdfs.length === 0) {
        setItem(KEYS.pdfs, DEFAULT_PDFS)
        return DEFAULT_PDFS
    }
    return pdfs
}

export function savePdf(pdf: Omit<StudyPdf, 'id' | 'uploadedAt'>): StudyPdf {
    const pdfs = getPdfs()
    const newPdf: StudyPdf = { ...pdf, id: generateId(), uploadedAt: new Date().toISOString().split('T')[0] }
    pdfs.unshift(newPdf)
    setItem(KEYS.pdfs, pdfs)
    return newPdf
}

export function deletePdf(id: string): void {
    const pdfs = getPdfs().filter(p => p.id !== id)
    setItem(KEYS.pdfs, pdfs)
}

export function logPdfView(pdfId: string, name: string): void {
    logActivity('pdf_view', { pdfId, name })
}

// ─── Flashcard Sets ──────────────────────────────────────────────────────────

export function getFlashcardSets(): FlashcardSet[] {
    const sets = getItem<FlashcardSet[]>(KEYS.flashcards, [])
    if (sets.length === 0) {
        setItem(KEYS.flashcards, DEFAULT_FLASHCARD_SETS)
        return DEFAULT_FLASHCARD_SETS
    }
    return sets
}

export function saveFlashcardSet(set: Omit<FlashcardSet, 'id' | 'createdAt' | 'mastered' | 'lastReview'> & { id?: string }): FlashcardSet {
    const sets = getFlashcardSets()
    if (set.id) {
        const idx = sets.findIndex(s => s.id === set.id)
        if (idx >= 0) {
            sets[idx] = { ...sets[idx], ...set, lastReview: new Date().toISOString() }
            setItem(KEYS.flashcards, sets)
            return sets[idx]
        }
    }
    const newSet: FlashcardSet = { ...set, id: generateId(), mastered: 0, lastReview: new Date().toISOString(), createdAt: new Date().toISOString() }
    sets.unshift(newSet)
    setItem(KEYS.flashcards, sets)
    return newSet
}

export function updateSetMastery(id: string, mastered: number): void {
    const sets = getFlashcardSets()
    const idx = sets.findIndex(s => s.id === id)
    if (idx >= 0) {
        sets[idx].mastered = mastered
        sets[idx].lastReview = new Date().toISOString()
        setItem(KEYS.flashcards, sets)
    }
}

export function deleteFlashcardSet(id: string): void {
    const sets = getFlashcardSets().filter(s => s.id !== id)
    setItem(KEYS.flashcards, sets)
}

export function logFlashcardReview(setId: string, correct: number, wrong: number): void {
    logActivity('flashcard_review', { setId, correct, wrong, total: correct + wrong })
}

// ─── Activity & Progress ─────────────────────────────────────────────────────

export function logActivity(type: ActivityEntry['type'], data: Record<string, unknown>): void {
    const log = getItem<ActivityEntry[]>(KEYS.activity, [])
    log.unshift({ id: generateId(), type, data, timestamp: new Date().toISOString() })
    // Keep last 500 entries
    if (log.length > 500) log.length = 500
    setItem(KEYS.activity, log)
}

export function getActivityLog(): ActivityEntry[] {
    return getItem<ActivityEntry[]>(KEYS.activity, [])
}

export function getStudyStats() {
    const log = getActivityLog()
    const now = new Date()

    // Streak: count consecutive days with activity
    const activityDays = new Set(log.map(e => e.timestamp.split('T')[0]))
    let streak = 0
    for (let i = 0; i < 365; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const key = date.toISOString().split('T')[0]
        if (activityDays.has(key)) {
            streak++
        } else if (i > 0) {
            break
        }
    }

    // Cards reviewed (total)
    const cardsReviewed = log
        .filter(e => e.type === 'flashcard_review')
        .reduce((sum, e) => sum + ((e.data.total as number) || 0), 0)

    // PDFs viewed (unique)
    const pdfsViewed = new Set(log.filter(e => e.type === 'pdf_view').map(e => e.data.pdfId)).size

    // Weekly hours (estimate: each activity ~15 min)
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const weeklyActivities = log.filter(e => new Date(e.timestamp) >= weekAgo)
    const weeklyHours = Math.round((weeklyActivities.length * 15) / 60 * 10) / 10

    // Weekly activity by day
    const weeklyByDay: Record<string, number> = {}
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dayName = days[d.getDay()]
        const dateKey = d.toISOString().split('T')[0]
        const count = log.filter(e => e.timestamp.startsWith(dateKey)).length
        weeklyByDay[dayName] = Math.round((count * 15) / 60 * 10) / 10
    }

    // Subject mastery from flashcard sets
    const sets = getFlashcardSets()
    const subjectMastery = sets.map(s => ({
        subject: s.subject,
        mastery: s.cards.length > 0 ? Math.min(100, Math.round((s.mastered / s.cards.length) * 100)) : 0,
    }))

    return { streak, cardsReviewed, pdfsViewed, weeklyHours, weeklyByDay, subjectMastery }
}
