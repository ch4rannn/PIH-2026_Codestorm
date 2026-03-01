import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Edit3, Trash2, Search } from 'lucide-react'

const mockNotes = [
    { id: '1', title: 'DSA - Binary Trees Summary', content: 'Binary tree traversals: Inorder (L-Root-R), Preorder (Root-L-R), Postorder (L-R-Root). BST property: left < root < right...', subject: 'DSA', updatedAt: '2 hours ago' },
    { id: '2', title: 'OS - Deadlock Conditions', content: 'Four conditions for deadlock: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, 4) Circular Wait...', subject: 'OS', updatedAt: '1 day ago' },
    { id: '3', title: 'DBMS - SQL Joins Cheatsheet', content: 'INNER JOIN: matching rows only. LEFT JOIN: all from left + matching. RIGHT JOIN: all from right + matching. FULL: all from both...', subject: 'DBMS', updatedAt: '3 days ago' },
]

export default function NotesManager() {
    const [notes] = useState(mockNotes)
    const [search, setSearch] = useState('')

    const filtered = notes.filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Notes Manager</h1>
                    <p className="text-muted-foreground text-sm">Organize your study notes</p>
                </div>
                <Button><Plus className="w-4 h-4 mr-2" />New Note</Button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search notes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="grid gap-4">
                {filtered.map(note => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="secondary" className="text-[10px]">{note.subject}</Badge>
                                        <span className="text-xs text-muted-foreground">{note.updatedAt}</span>
                                    </div>
                                    <h3 className="font-semibold text-sm">{note.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{note.content}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Edit3 className="w-3.5 h-3.5" /></Button>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
