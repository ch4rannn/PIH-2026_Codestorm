import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Clock, Search, Loader2, Check } from 'lucide-react'
import api from '@/services/api'

interface Gig {
    id: string; title: string; client: string; budget: string; deadline: string; skills: string[]; difficulty: string; category: string; applied: boolean
}

const categories = ['All', 'Web Development', 'Design', 'Data Entry', 'Testing']

export default function FreelancePage() {
    const [gigs, setGigs] = useState<Gig[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [applying, setApplying] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        try {
            const params: Record<string, string> = {}
            if (search) params.search = search
            if (category !== 'All') params.category = category
            const res = await api.get('/career/freelance', { params })
            setGigs(res.data)
        } catch (err) {
            console.error('Failed to load gigs:', err)
        } finally {
            setLoading(false)
        }
    }, [search, category])

    useEffect(() => { loadData() }, [loadData])

    const handleApply = async (id: string) => {
        setApplying(id)
        try {
            await api.post(`/career/apply/${id}`)
            await loadData()
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } }
            if (error.response?.status === 409) alert('Already applied!')
            else console.error('Apply failed:', err)
        } finally {
            setApplying(null)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Freelance Gigs</h1>
                    <p className="text-muted-foreground text-sm">Quick earning opportunities for students</p>
                </div>
                <Badge variant="outline">{gigs.length} gigs available</Badge>
            </div>

            {/* Search + Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search gigs..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map(c => (
                                <Badge key={c} variant={category === c ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCategory(c)}>{c}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gigs.map(gig => (
                    <Card key={gig.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <Badge variant="secondary" className="text-[10px]">{gig.category}</Badge>
                                <Badge variant={gig.difficulty === 'Easy' ? 'outline' : 'default'} className="text-[10px]">{gig.difficulty}</Badge>
                            </div>
                            <h3 className="font-semibold text-sm mb-1">{gig.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3">by {gig.client}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{gig.budget}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{gig.deadline}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {gig.skills.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                            </div>
                            {gig.applied ? (
                                <Button size="sm" variant="outline" className="w-full" disabled><Check className="w-3 h-3 mr-1" />Applied</Button>
                            ) : (
                                <Button size="sm" className="w-full" onClick={() => handleApply(gig.id)} disabled={applying === gig.id}>
                                    {applying === gig.id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                                    {applying === gig.id ? 'Applying...' : 'Apply for Gig'}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
