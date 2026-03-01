import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Search, Briefcase, MapPin, Clock, Building2, Users,
    Heart, Send, CheckCircle2, ArrowRight, Star
} from 'lucide-react'

interface Referral {
    id: string; title: string; company: string; location: string
    type: 'full-time' | 'internship' | 'contract'
    experience: string; skills: string[]; deadline: string
    referrer: { name: string; role: string; batch: string }
    slots: number; applied: number; featured: boolean
}

const referrals: Referral[] = [
    {
        id: '1', title: 'Software Engineer', company: 'Google', location: 'Bangalore',
        type: 'full-time', experience: '0-2 years', skills: ['DSA', 'System Design', 'Go/Java'],
        deadline: '2026-03-30', referrer: { name: 'Ankit Verma', role: 'SDE-2', batch: '2020' },
        slots: 3, applied: 18, featured: true,
    },
    {
        id: '2', title: 'Product Management Intern', company: 'Microsoft', location: 'Remote',
        type: 'internship', experience: 'Current student', skills: ['Analytics', 'SQL', 'Communication'],
        deadline: '2026-03-20', referrer: { name: 'Priya Singh', role: 'PM', batch: '2019' },
        slots: 2, applied: 12, featured: true,
    },
    {
        id: '3', title: 'ML Engineer', company: 'Amazon', location: 'Hyderabad',
        type: 'full-time', experience: '1-3 years', skills: ['Python', 'PyTorch', 'AWS'],
        deadline: '2026-04-15', referrer: { name: 'Rohit Mehta', role: 'Data Scientist', batch: '2021' },
        slots: 2, applied: 8, featured: false,
    },
    {
        id: '4', title: 'Frontend Developer', company: 'Flipkart', location: 'Bangalore',
        type: 'full-time', experience: '0-2 years', skills: ['React', 'TypeScript', 'CSS'],
        deadline: '2026-04-01', referrer: { name: 'Sneha Patel', role: 'UX Engineer', batch: '2020' },
        slots: 4, applied: 22, featured: false,
    },
    {
        id: '5', title: 'DevOps Intern', company: 'Netflix', location: 'Remote',
        type: 'internship', experience: 'Current student', skills: ['Docker', 'Linux', 'CI/CD'],
        deadline: '2026-03-25', referrer: { name: 'Vikram Joshi', role: 'DevOps Lead', batch: '2018' },
        slots: 1, applied: 15, featured: false,
    },
    {
        id: '6', title: 'Data Analyst (Contract)', company: 'Deloitte', location: 'Gurugram',
        type: 'contract', experience: '1-2 years', skills: ['Excel', 'Python', 'Tableau'],
        deadline: '2026-04-10', referrer: { name: 'Meera Reddy', role: 'Sr. Analyst', batch: '2019' },
        slots: 3, applied: 6, featured: false,
    },
]

const typeColors: Record<string, string> = {
    'full-time': 'bg-blue-500/10 text-blue-600',
    internship: 'bg-emerald-500/10 text-emerald-600',
    contract: 'bg-amber-500/10 text-amber-600',
}

export default function AlumniJobReferrals() {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('All')
    const [savedJobs, setSavedJobs] = useState<string[]>([])
    const [appliedJobs, setAppliedJobs] = useState<string[]>([])

    const filtered = referrals.filter(r => {
        if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.company.toLowerCase().includes(search.toLowerCase())) return false
        if (typeFilter !== 'All' && r.type !== typeFilter) return false
        return true
    })

    const toggleSave = (id: string) => setSavedJobs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    const applyForReferral = (id: string) => setAppliedJobs(prev => [...prev, id])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Job Referrals</h1>
                    <p className="text-muted-foreground text-sm">Get referred by alumni working at top companies</p>
                </div>
                <Badge variant="outline">{filtered.length} referral opportunities</Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Open Referrals', value: referrals.length, icon: Briefcase, color: 'text-blue-500' },
                    { label: 'Companies', value: new Set(referrals.map(r => r.company)).size, icon: Building2, color: 'text-emerald-500' },
                    { label: 'Total Slots', value: referrals.reduce((s, r) => s + r.slots, 0), icon: Users, color: 'text-purple-500' },
                    { label: 'Your Applications', value: appliedJobs.length, icon: Send, color: 'text-amber-500' },
                ].map(s => (
                    <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} bg-current/10`}>
                            <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    </CardContent></Card>
                ))}
            </div>

            {/* Filters */}
            <Card><CardContent className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by role or company..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'full-time', 'internship', 'contract'].map(t => (
                        <Button key={t} size="sm" variant={typeFilter === t ? 'default' : 'outline'} onClick={() => setTypeFilter(t)} className="text-xs capitalize">
                            {t === 'All' ? 'All Types' : t}
                        </Button>
                    ))}
                </div>
            </CardContent></Card>

            {/* Listings */}
            <div className="grid gap-4">
                {filtered.map(ref => (
                    <Card key={ref.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                {ref.title}
                                                {ref.featured && <Badge className="text-[10px]"><Star className="w-2.5 h-2.5 mr-0.5" />Hot</Badge>}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{ref.company}</p>
                                        </div>
                                        <button onClick={() => toggleSave(ref.id)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                                            <Heart className={`w-4 h-4 ${savedJobs.includes(ref.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ref.location}</span>
                                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{ref.experience}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Due {new Date(ref.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{ref.slots} slots • {ref.applied} applied</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {ref.skills.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                                    </div>

                                    {/* Referrer info */}
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                        <Avatar className="h-7 w-7">
                                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{ref.referrer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <p className="text-xs text-muted-foreground">
                                            Referred by <span className="font-medium text-foreground">{ref.referrer.name}</span> • {ref.referrer.role} • Batch {ref.referrer.batch}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <Badge variant="outline" className={`text-[10px] ${typeColors[ref.type]} border-0`}>{ref.type}</Badge>
                                        {appliedJobs.includes(ref.id) ? (
                                            <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Applied</Badge>
                                        ) : (
                                            <Button size="sm" onClick={() => applyForReferral(ref.id)} className="text-xs gap-1">
                                                Request Referral <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filtered.length === 0 && (
                    <Card><CardContent className="p-12 text-center text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No referrals found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </CardContent></Card>
                )}
            </div>
        </div>
    )
}
