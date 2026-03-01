import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Users, Building2, Calendar, MessageCircle, Share2, Linkedin, MapPin, Briefcase } from 'lucide-react'

const alumni = [
    { id: '1', name: 'Ankit Verma', role: 'SDE-2', company: 'Google', batch: '2020', department: 'CS', location: 'Bangalore', experience: '4 yrs', industry: 'Technology', skills: ['React', 'Go', 'K8s'], available: true, linkedin: '#' },
    { id: '2', name: 'Priya Singh', role: 'Product Manager', company: 'Microsoft', batch: '2019', department: 'CS', location: 'Hyderabad', experience: '5 yrs', industry: 'Technology', skills: ['Agile', 'Data', 'Strategy'], available: true, linkedin: '#' },
    { id: '3', name: 'Rohit Mehta', role: 'Data Scientist', company: 'Amazon', batch: '2021', department: 'IT', location: 'Bangalore', experience: '3 yrs', industry: 'Technology', skills: ['Python', 'ML', 'SQL'], available: false, linkedin: '#' },
    { id: '4', name: 'Sneha Patel', role: 'UX Designer', company: 'Flipkart', batch: '2020', department: 'CS', location: 'Bangalore', experience: '4 yrs', industry: 'E-Commerce', skills: ['Figma', 'Research', 'Design'], available: true, linkedin: '#' },
    { id: '5', name: 'Vikram Joshi', role: 'DevOps Engineer', company: 'Netflix', batch: '2018', department: 'CS', location: 'Remote', experience: '6 yrs', industry: 'Entertainment', skills: ['AWS', 'Docker', 'CI/CD'], available: true, linkedin: '#' },
    { id: '6', name: 'Meera Reddy', role: 'ML Engineer', company: 'Meta', batch: '2019', department: 'ECE', location: 'Menlo Park', experience: '5 yrs', industry: 'Technology', skills: ['PyTorch', 'NLP', 'CV'], available: false, linkedin: '#' },
    { id: '7', name: 'Arjun Nair', role: 'Consultant', company: 'McKinsey', batch: '2017', department: 'MBA', location: 'Mumbai', experience: '7 yrs', industry: 'Consulting', skills: ['Strategy', 'Analytics', 'Leadership'], available: true, linkedin: '#' },
    { id: '8', name: 'Kavita Sharma', role: 'Backend Engineer', company: 'Razorpay', batch: '2021', department: 'CS', location: 'Bangalore', experience: '3 yrs', industry: 'FinTech', skills: ['Node.js', 'PostgreSQL', 'Redis'], available: true, linkedin: '#' },
    { id: '9', name: 'Deepak Gupta', role: 'CTO', company: 'HealthTech Startup', batch: '2016', department: 'IT', location: 'Delhi', experience: '8 yrs', industry: 'Healthcare', skills: ['Architecture', 'Cloud', 'Team Lead'], available: false, linkedin: '#' },
]

export default function AlumniDirectory() {
    const [search, setSearch] = useState('')
    const [companyFilter, setCompanyFilter] = useState('All')
    const [batchFilter, setBatchFilter] = useState('All')
    const [deptFilter, setDeptFilter] = useState('All')
    const [industryFilter, setIndustryFilter] = useState('All')

    const companies = ['All', ...new Set(alumni.map(a => a.company))]
    const batches = ['All', ...new Set(alumni.map(a => a.batch))].sort()
    const departments = ['All', ...new Set(alumni.map(a => a.department))]
    const industries = ['All', ...new Set(alumni.map(a => a.industry))]

    const filtered = alumni.filter(a => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.role.toLowerCase().includes(search.toLowerCase()) && !a.company.toLowerCase().includes(search.toLowerCase())) return false
        if (companyFilter !== 'All' && a.company !== companyFilter) return false
        if (batchFilter !== 'All' && a.batch !== batchFilter) return false
        if (deptFilter !== 'All' && a.department !== deptFilter) return false
        if (industryFilter !== 'All' && a.industry !== industryFilter) return false
        return true
    })

    const availableMentors = alumni.filter(a => a.available).length

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Alumni Network</h1>
                    <p className="text-muted-foreground text-sm">Connect with alumni for mentorship & referrals</p>
                </div>
                <Badge variant="outline">{filtered.length} alumni found</Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Alumni', value: alumni.length, icon: Users, color: 'text-blue-500' },
                    { label: 'Available Mentors', value: availableMentors, icon: MessageCircle, color: 'text-emerald-500' },
                    { label: 'Companies', value: new Set(alumni.map(a => a.company)).size, icon: Building2, color: 'text-purple-500' },
                    { label: 'Industries', value: new Set(alumni.map(a => a.industry)).size, icon: Briefcase, color: 'text-amber-500' },
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
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search by name, role, or company..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="px-3 py-1.5 text-xs rounded-md border bg-background">
                            {batches.map(b => <option key={b} value={b}>{b === 'All' ? 'All Batches' : `Batch ${b}`}</option>)}
                        </select>
                        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-1.5 text-xs rounded-md border bg-background">
                            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                        </select>
                        <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="px-3 py-1.5 text-xs rounded-md border bg-background">
                            {industries.map(i => <option key={i} value={i}>{i === 'All' ? 'All Industries' : i}</option>)}
                        </select>
                        <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="px-3 py-1.5 text-xs rounded-md border bg-background">
                            {companies.map(c => <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>)}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Alumni Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(a => (
                    <Card key={a.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{a.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm">{a.name}</h3>
                                    <p className="text-xs text-muted-foreground">{a.role} at {a.company}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Calendar className="w-3 h-3" />Batch {a.batch}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin className="w-3 h-3" />{a.location}</span>
                                    </div>
                                </div>
                                <Badge variant={a.available ? 'default' : 'secondary'} className="text-[10px] shrink-0">{a.available ? 'Available' : 'Busy'}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                                <Badge variant="outline" className="text-[10px] bg-accent/50">{a.department}</Badge>
                                <Badge variant="outline" className="text-[10px]">{a.industry}</Badge>
                                <Badge variant="outline" className="text-[10px]">{a.experience}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {a.skills.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="flex-1" disabled={!a.available}><MessageCircle className="w-3 h-3 mr-1" />Mentorship</Button>
                                <Button size="sm" variant="outline" disabled={!a.available}><Share2 className="w-3 h-3 mr-1" />Referral</Button>
                                <Button size="sm" variant="ghost" className="px-2"><Linkedin className="w-3.5 h-3.5" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <Card><CardContent className="p-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No alumni found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                </CardContent></Card>
            )}
        </div>
    )
}
