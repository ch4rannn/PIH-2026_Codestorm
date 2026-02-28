import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Users, Building2, Calendar, MessageCircle, Share2, Linkedin } from 'lucide-react'

const alumni = [
    { id: '1', name: 'Ankit Verma', role: 'SDE-2', company: 'Google', batch: '2020', experience: '4 yrs', skills: ['React', 'Go', 'K8s'], available: true },
    { id: '2', name: 'Priya Singh', role: 'Product Manager', company: 'Microsoft', batch: '2019', experience: '5 yrs', skills: ['Agile', 'Data', 'Strategy'], available: true },
    { id: '3', name: 'Rohit Mehta', role: 'Data Scientist', company: 'Amazon', batch: '2021', experience: '3 yrs', skills: ['Python', 'ML', 'SQL'], available: false },
    { id: '4', name: 'Sneha Patel', role: 'UX Designer', company: 'Flipkart', batch: '2020', experience: '4 yrs', skills: ['Figma', 'Research', 'Design'], available: true },
    { id: '5', name: 'Vikram Joshi', role: 'DevOps Engineer', company: 'Netflix', batch: '2018', experience: '6 yrs', skills: ['AWS', 'Docker', 'CI/CD'], available: true },
    { id: '6', name: 'Meera Reddy', role: 'ML Engineer', company: 'Meta', batch: '2019', experience: '5 yrs', skills: ['PyTorch', 'NLP', 'CV'], available: false },
]

export default function AlumniDirectory() {
    const [search, setSearch] = useState('')
    const [companyFilter, setCompanyFilter] = useState('All')
    const companies = ['All', ...new Set(alumni.map(a => a.company))]
    const filtered = alumni.filter(a => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.role.toLowerCase().includes(search.toLowerCase())) return false
        if (companyFilter !== 'All' && a.company !== companyFilter) return false
        return true
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Alumni Network</h1>
                <p className="text-muted-foreground text-sm">Connect with alumni for mentorship & referrals</p>
            </div>
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search alumni..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border bg-background">
                        {companies.map(c => <option key={c}>{c}</option>)}
                    </select>
                </CardContent>
            </Card>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(a => (
                    <Card key={a.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary/10 text-primary">{a.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm">{a.name}</h3>
                                    <p className="text-xs text-muted-foreground">{a.role} at {a.company}</p>
                                    <p className="text-xs text-muted-foreground">Batch {a.batch} • {a.experience}</p>
                                </div>
                                <Badge variant={a.available ? 'default' : 'secondary'} className="text-[10px] shrink-0">{a.available ? 'Available' : 'Busy'}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {a.skills.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="flex-1" disabled={!a.available}><MessageCircle className="w-3 h-3 mr-1" />Mentorship</Button>
                                <Button size="sm" variant="outline" disabled={!a.available}><Share2 className="w-3 h-3 mr-1" />Referral</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
