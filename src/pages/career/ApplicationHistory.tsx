import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Hourglass, CheckCircle2, XCircle, Search, Loader2 } from 'lucide-react'
import api from '@/services/api'

interface Application {
    id: string; title: string; company: string; type: string; status: string; appliedDate: string
}

interface Summary {
    total: number; under_review: number; shortlisted: number; accepted: number; rejected: number
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    under_review: { label: 'Under Review', icon: <Hourglass className="w-3 h-3" />, variant: 'secondary' },
    shortlisted: { label: 'Shortlisted', icon: <CheckCircle2 className="w-3 h-3" />, variant: 'default' },
    accepted: { label: 'Accepted', icon: <CheckCircle2 className="w-3 h-3" />, variant: 'default' },
    rejected: { label: 'Rejected', icon: <XCircle className="w-3 h-3" />, variant: 'destructive' },
}

const types = ['all', 'Internship', 'Freelance', 'Micro Task']
const statuses = ['all', 'under_review', 'shortlisted', 'accepted', 'rejected']

export default function ApplicationHistoryPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [summary, setSummary] = useState<Summary>({ total: 0, under_review: 0, shortlisted: 0, accepted: 0, rejected: 0 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const loadData = useCallback(async () => {
        try {
            const params: Record<string, string> = {}
            if (search) params.search = search
            if (typeFilter !== 'all') params.type = typeFilter
            if (statusFilter !== 'all') params.status = statusFilter
            const res = await api.get('/career/applications', { params })
            setApplications(res.data.applications)
            setSummary(res.data.summary)
        } catch (err) {
            console.error('Failed to load applications:', err)
        } finally {
            setLoading(false)
        }
    }, [search, typeFilter, statusFilter])

    useEffect(() => { loadData() }, [loadData])

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Application History</h1>
                <p className="text-muted-foreground text-sm">Track all your job & gig applications</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Applied', value: summary.total, color: 'text-blue-500' },
                    { label: 'Under Review', value: summary.under_review, color: 'text-yellow-500' },
                    { label: 'Shortlisted', value: summary.shortlisted, color: 'text-green-500' },
                    { label: 'Accepted', value: summary.accepted, color: 'text-emerald-500' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search applications..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border bg-background">
                            {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border bg-background">
                            {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : statusConfig[s]?.label || s}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Position</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Company</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Type</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Applied</th>
                                    <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No applications found</td></tr>
                                ) : applications.map(app => {
                                    const sc = statusConfig[app.status] || statusConfig.under_review
                                    return (
                                        <tr key={app.id} className="border-b last:border-0 hover:bg-accent/50 transition-colors">
                                            <td className="p-4"><span className="font-medium text-sm">{app.title}</span></td>
                                            <td className="p-4 text-sm text-muted-foreground">{app.company}</td>
                                            <td className="p-4"><Badge variant="outline" className="text-[10px]">{app.type}</Badge></td>
                                            <td className="p-4 text-sm text-muted-foreground">{new Date(app.appliedDate).toLocaleDateString()}</td>
                                            <td className="p-4"><Badge variant={sc.variant} className="text-[10px] gap-1">{sc.icon}{sc.label}</Badge></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
