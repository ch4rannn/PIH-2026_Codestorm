import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Users, Building2, Calendar, MessageCircle, Share2, Linkedin, MapPin, Briefcase, Loader2, UserPlus } from 'lucide-react'
import { getAlumni, type AlumniData, type AlumniListResponse } from '@/services/alumniService'
import AlumniRegisterForm from './AlumniRegisterForm'

export default function AlumniDirectory() {
    const [search, setSearch] = useState('')
    const [companyFilter, setCompanyFilter] = useState('All')
    const [batchFilter, setBatchFilter] = useState('All')
    const [deptFilter, setDeptFilter] = useState('All')
    const [industryFilter, setIndustryFilter] = useState('All')

    const [alumniList, setAlumniList] = useState<AlumniData[]>([])
    const [filterOptions, setFilterOptions] = useState<AlumniListResponse['filter_options'] | null>(null)
    const [stats, setStats] = useState<AlumniListResponse['stats'] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showRegister, setShowRegister] = useState(false)

    const fetchAlumni = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAlumni({
                search: search || undefined,
                batch: batchFilter !== 'All' ? batchFilter : undefined,
                department: deptFilter !== 'All' ? deptFilter : undefined,
                company: companyFilter !== 'All' ? companyFilter : undefined,
                industry: industryFilter !== 'All' ? industryFilter : undefined,
            })
            setAlumniList(data.results)
            setFilterOptions(data.filter_options)
            setStats(data.stats)
        } catch (err) {
            setError('Failed to load alumni data. Make sure the backend server is running.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [search, batchFilter, deptFilter, companyFilter, industryFilter])

    useEffect(() => {
        const debounce = setTimeout(fetchAlumni, 300)
        return () => clearTimeout(debounce)
    }, [fetchAlumni])

    const batches = ['All', ...(filterOptions?.batches ?? [])]
    const departments = ['All', ...(filterOptions?.departments ?? [])]
    const companies = ['All', ...(filterOptions?.companies ?? [])]
    const industries = ['All', ...(filterOptions?.industries ?? [])]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Alumni Network</h1>
                    <p className="text-muted-foreground text-sm">Connect with alumni for mentorship & referrals</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{alumniList.length} alumni found</Badge>
                    <Button size="sm" className="gap-1.5" onClick={() => setShowRegister(true)}>
                        <UserPlus className="w-3.5 h-3.5" />Register
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Alumni', value: stats?.total ?? '-', icon: Users, color: 'text-blue-500' },
                    { label: 'Available Mentors', value: stats?.available_mentors ?? '-', icon: MessageCircle, color: 'text-emerald-500' },
                    { label: 'Companies', value: stats?.companies_count ?? '-', icon: Building2, color: 'text-purple-500' },
                    { label: 'Industries', value: stats?.industries_count ?? '-', icon: Briefcase, color: 'text-amber-500' },
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

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                    <span className="text-muted-foreground text-sm">Loading alumni...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <Card><CardContent className="p-6 text-center">
                    <p className="text-destructive font-medium">{error}</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={fetchAlumni}>Retry</Button>
                </CardContent></Card>
            )}

            {/* Alumni Grid */}
            {!loading && !error && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alumniList.map(a => (
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
                                    {a.linkedin && <Button size="sm" variant="ghost" className="px-2" onClick={() => window.open(a.linkedin, '_blank')}><Linkedin className="w-3.5 h-3.5" /></Button>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && alumniList.length === 0 && (
                <Card><CardContent className="p-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No alumni found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                </CardContent></Card>
            )}
            {/* Registration Modal */}
            <AlumniRegisterForm
                open={showRegister}
                onClose={() => setShowRegister(false)}
                onSuccess={fetchAlumni}
            />
        </div>
    )
}
