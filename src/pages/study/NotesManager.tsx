import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Edit3, Trash2, Search, X, Save } from 'lucide-react'
import { getNotes, saveNote, deleteNote, type StudyNote } from '@/services/studyStore'

const SUBJECTS = ['DSA', 'OS', 'DBMS', 'CN', 'SE', 'Math', 'Other']

export default function NotesManager() {
    const [notes, setNotes] = useState<StudyNote[]>(() => getNotes())
    const [search, setSearch] = useState('')
    const [filterSubject, setFilterSubject] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingNote, setEditingNote] = useState<StudyNote | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [form, setForm] = useState({ title: '', content: '', subject: 'DSA' })

    const filtered = notes.filter(n => {
        const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
        const matchSubject = !filterSubject || n.subject === filterSubject
        return matchSearch && matchSubject
    })

    const openCreate = () => {
        setEditingNote(null)
        setForm({ title: '', content: '', subject: 'DSA' })
        setModalOpen(true)
    }

    const openEdit = (note: StudyNote) => {
        setEditingNote(note)
        setForm({ title: note.title, content: note.content, subject: note.subject })
        setModalOpen(true)
    }

    const handleSave = () => {
        if (!form.title.trim() || !form.content.trim()) return
        saveNote({ id: editingNote?.id, title: form.title.trim(), content: form.content.trim(), subject: form.subject })
        setNotes(getNotes())
        setModalOpen(false)
        setEditingNote(null)
    }

    const handleDelete = (id: string) => {
        deleteNote(id)
        setNotes(getNotes())
        setDeleteId(null)
    }

    const timeAgo = (dateStr: string) => {
        const now = new Date()
        const diff = now.getTime() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Notes Manager</h1>
                    <p className="text-muted-foreground text-sm">Organize your study notes</p>
                </div>
                <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New Note</Button>
            </div>

            {/* Search + Subject Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search notes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Badge
                        variant={filterSubject === null ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setFilterSubject(null)}
                    >All</Badge>
                    {SUBJECTS.map(s => (
                        <Badge
                            key={s}
                            variant={filterSubject === s ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setFilterSubject(filterSubject === s ? null : s)}
                        >{s}</Badge>
                    ))}
                </div>
            </div>

            {/* Notes List */}
            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            <p className="font-medium">No notes found</p>
                            <p className="text-sm mt-1">{search || filterSubject ? 'Try a different search or filter' : 'Click "New Note" to create your first note'}</p>
                        </CardContent>
                    </Card>
                ) : filtered.map(note => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-[10px]">{note.subject}</Badge>
                                        <span className="text-xs text-muted-foreground">{timeAgo(note.updatedAt)}</span>
                                    </div>
                                    <h3 className="font-semibold text-sm">{note.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 whitespace-pre-line">{note.content}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(note)}>
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => setDeleteId(note.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">{editingNote ? 'Edit Note' : 'New Note'}</h2>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setModalOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="space-y-3">
                            <Input
                                placeholder="Note title..."
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                autoFocus
                            />
                            <div className="flex gap-2 flex-wrap">
                                {SUBJECTS.map(s => (
                                    <Badge
                                        key={s}
                                        variant={form.subject === s ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => setForm(f => ({ ...f, subject: s }))}
                                    >{s}</Badge>
                                ))}
                            </div>
                            <textarea
                                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                                placeholder="Write your notes here..."
                                value={form.content}
                                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={!form.title.trim() || !form.content.trim()}>
                                <Save className="w-4 h-4 mr-2" />{editingNote ? 'Save Changes' : 'Create Note'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold">Delete Note</h2>
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete this note? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDelete(deleteId)}>
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
