import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Bell, Calendar, AlertCircle, Search, Loader2, Pin } from 'lucide-react'
import api from '@/services/api'

interface Notice {
    id: string
    title: string
    content: string
    type: string
    priority: string
    pinned: boolean
    date: string
    author: string
}

const TYPES = ['all', 'exam', 'general', 'event', 'finance', 'academic']

const priorityColors: Record<string, string> = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    low: 'bg-green-500/10 text-green-500',
}

export default function NoticeBoard() {
    const [notices, setNotices] = useState<Notice[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')

    const loadNotices = useCallback(async () => {
        try {
            const params: Record<string, string> = {}
            if (typeFilter !== 'all') params.type = typeFilter
            if (search) params.search = search
            const res = await api.get('/academic/notices', { params })
            setNotices(res.data)
        } catch (err) {
            console.error('Failed to load notices:', err)
        } finally {
            setLoading(false)
        }
    }, [typeFilter, search])

    useEffect(() => { loadNotices() }, [loadNotices])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">Notice Board</h1>
                <p className="text-muted-foreground text-sm">University announcements & notices</p>
            </div>

            {/* Search + Filter */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search notices..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {TYPES.map(t => (
                        <Badge
                            key={t}
                            variant={typeFilter === t ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => setTypeFilter(t)}
                        >{t}</Badge>
                    ))}
                </div>
            </div>

            {/* Notices */}
            <div className="space-y-4">
                {notices.length === 0 ? (
                    <Card><CardContent className="p-8 text-center text-muted-foreground">No notices found</CardContent></Card>
                ) : notices.map(notice => (
                    <Card key={notice.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${priorityColors[notice.priority] || priorityColors.medium}`}>
                                    {notice.priority === 'high' ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        {notice.pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                                        <h3 className="font-semibold text-sm">{notice.title}</h3>
                                        <Badge variant="outline" className="text-[10px]">{notice.type}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notice.content}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />{new Date(notice.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">by {notice.author}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
