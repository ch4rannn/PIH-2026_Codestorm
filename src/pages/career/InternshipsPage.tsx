import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Briefcase, MapPin, Clock, IndianRupee, Heart, Search, Filter, ExternalLink, Building2 } from 'lucide-react'

const mockInternships = [
    { id: '1', title: 'Frontend Developer Intern', company: 'TechCorp India', location: 'Remote', stipend: '₹25,000/mo', domain: 'Web Development', duration: '3 months', verified: true, saved: false, status: 'open' },
    { id: '2', title: 'Data Science Intern', company: 'DataViz Inc', location: 'Bangalore', stipend: '₹30,000/mo', domain: 'Data Science', duration: '6 months', verified: true, saved: true, status: 'open' },
    { id: '3', title: 'UI/UX Design Intern', company: 'DesignLab', location: 'Hybrid - Delhi', stipend: '₹20,000/mo', domain: 'Design', duration: '4 months', verified: true, saved: false, status: 'open' },
    { id: '4', title: 'Backend Engineer Intern', company: 'CloudStack', location: 'Remote', stipend: '₹28,000/mo', domain: 'Backend', duration: '6 months', verified: false, saved: false, status: 'open' },
    { id: '5', title: 'ML Research Intern', company: 'AI Labs', location: 'Hyderabad', stipend: '₹35,000/mo', domain: 'AI/ML', duration: '3 months', verified: true, saved: false, status: 'open' },
    { id: '6', title: 'App Developer Intern', company: 'MobileFirst', location: 'Remote', stipend: '₹22,000/mo', domain: 'Mobile Dev', duration: '4 months', verified: true, saved: false, status: 'open' },
]

const domains = ['All', 'Web Development', 'Data Science', 'Design', 'Backend', 'AI/ML', 'Mobile Dev']
const locationFilters = ['All', 'Remote', 'On-site', 'Hybrid']

export default function InternshipsPage() {
    const [search, setSearch] = useState('')
    const [domainFilter, setDomainFilter] = useState('All')
    const [locationFilter, setLocationFilter] = useState('All')
    const [savedJobs, setSavedJobs] = useState<string[]>(mockInternships.filter(j => j.saved).map(j => j.id))

    const filtered = mockInternships.filter(j => {
        if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false
        if (domainFilter !== 'All' && j.domain !== domainFilter) return false
        if (locationFilter !== 'All' && !j.location.toLowerCase().includes(locationFilter.toLowerCase())) return false
        return true
    })

    const toggleSave = (id: string) => {
        setSavedJobs(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Internships</h1>
                    <p className="text-muted-foreground text-sm">Verified opportunities from top companies</p>
                </div>
                <Badge variant="outline">{filtered.length} opportunities</Badge>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search internships..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border bg-background">
                                {domains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border bg-background">
                                {locationFilters.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Listings */}
            <div className="grid gap-4">
                {filtered.map(job => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                {job.title}
                                                {job.verified && <Badge className="text-[10px]">✓ Verified</Badge>}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{job.company}</p>
                                        </div>
                                        <button onClick={() => toggleSave(job.id)} className="p-2 rounded-lg hover:bg-accent transition-colors">
                                            <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                                        <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{job.stipend}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <Badge variant="secondary" className="text-xs">{job.domain}</Badge>
                                        <Button size="sm">Apply Now <ExternalLink className="w-3 h-3 ml-1" /></Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filtered.length === 0 && (
                    <Card><CardContent className="p-12 text-center text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No internships found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </CardContent></Card>
                )}
            </div>
        </div>
    )
}
