import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Calendar, MapPin, Clock, Users, Search, Video, Globe,
    PartyPopper, GraduationCap, Presentation, Handshake, CalendarCheck
} from 'lucide-react'

interface AlumniEvent {
    id: string
    title: string
    description: string
    date: string
    time: string
    location: string
    type: 'reunion' | 'webinar' | 'workshop' | 'networking'
    mode: 'online' | 'offline' | 'hybrid'
    attendees: number
    maxAttendees: number
    organizer: string
    rsvpd: boolean
    isPast: boolean
}

const events: AlumniEvent[] = [
    {
        id: '1', title: 'Annual Alumni Reunion 2026', description: 'Join us for the grand annual reunion! Reconnect with batchmates, enjoy cultural performances, and celebrate memories.',
        date: '2026-04-15', time: '10:00 AM', location: 'University Main Auditorium', type: 'reunion', mode: 'offline',
        attendees: 234, maxAttendees: 500, organizer: 'Alumni Association', rsvpd: false, isPast: false,
    },
    {
        id: '2', title: 'Tech Leadership in the AI Era', description: 'A webinar by industry leaders on navigating careers in the age of artificial intelligence.',
        date: '2026-03-20', time: '6:00 PM', location: 'Google Meet', type: 'webinar', mode: 'online',
        attendees: 156, maxAttendees: 300, organizer: 'CS Department Alumni', rsvpd: true, isPast: false,
    },
    {
        id: '3', title: 'Resume & Personal Branding Workshop', description: 'Hands-on workshop to craft standout resumes and build your professional brand with alumni mentors.',
        date: '2026-03-10', time: '2:00 PM', location: 'Seminar Hall B', type: 'workshop', mode: 'hybrid',
        attendees: 89, maxAttendees: 120, organizer: 'Placement Cell Alumni', rsvpd: false, isPast: false,
    },
    {
        id: '4', title: 'Startup Founders Networking Night', description: 'An exclusive networking event for alumni entrepreneurs and aspiring founders.',
        date: '2026-03-28', time: '7:00 PM', location: 'Innovation Hub', type: 'networking', mode: 'offline',
        attendees: 67, maxAttendees: 100, organizer: 'E-Cell Alumni', rsvpd: false, isPast: false,
    },
    {
        id: '5', title: 'Batch of 2020 — 5-Year Reunion', description: 'Special reunion for the class of 2020. Share your journey and reconnect with your batch!',
        date: '2026-02-10', time: '11:00 AM', location: 'University Lawn', type: 'reunion', mode: 'offline',
        attendees: 145, maxAttendees: 200, organizer: 'Batch 2020 Committee', rsvpd: true, isPast: true,
    },
    {
        id: '6', title: 'Data Engineering Deep Dive', description: 'Technical workshop on modern data pipelines, orchestration tools, and real-world case studies.',
        date: '2026-02-05', time: '3:00 PM', location: 'Zoom', type: 'workshop', mode: 'online',
        attendees: 210, maxAttendees: 250, organizer: 'IT Department Alumni', rsvpd: false, isPast: true,
    },
]

const typeIcons: Record<string, typeof Calendar> = {
    reunion: PartyPopper,
    webinar: Presentation,
    workshop: GraduationCap,
    networking: Handshake,
}

const typeColors: Record<string, string> = {
    reunion: 'text-pink-500 bg-pink-500/10',
    webinar: 'text-blue-500 bg-blue-500/10',
    workshop: 'text-amber-500 bg-amber-500/10',
    networking: 'text-emerald-500 bg-emerald-500/10',
}

export default function AlumniEvents() {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('All')
    const [rsvps, setRsvps] = useState<string[]>(events.filter(e => e.rsvpd).map(e => e.id))

    const upcoming = events.filter(e => !e.isPast)
    const past = events.filter(e => e.isPast)

    const filterEvents = (list: AlumniEvent[]) =>
        list.filter(e => {
            if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false
            if (typeFilter !== 'All' && e.type !== typeFilter) return false
            return true
        })

    const toggleRsvp = (id: string) => {
        setRsvps(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Alumni Events</h1>
                    <p className="text-muted-foreground text-sm">Reunions, webinars, workshops & networking events</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="gap-1"><CalendarCheck className="w-3 h-3" />{upcoming.length} upcoming</Badge>
                    <Badge variant="secondary" className="gap-1">{rsvps.length} RSVP'd</Badge>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: 'text-blue-500' },
                    { label: 'Total Attendees', value: events.reduce((s, e) => s + e.attendees, 0), icon: Users, color: 'text-emerald-500' },
                    { label: 'Your RSVPs', value: rsvps.length, icon: CalendarCheck, color: 'text-purple-500' },
                    { label: 'Past Events', value: past.length, icon: Clock, color: 'text-amber-500' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${s.color} bg-current/10 flex items-center justify-center`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-xl font-bold">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search events..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border bg-background">
                        <option value="All">All Types</option>
                        <option value="reunion">Reunions</option>
                        <option value="webinar">Webinars</option>
                        <option value="workshop">Workshops</option>
                        <option value="networking">Networking</option>
                    </select>
                </CardContent>
            </Card>

            {/* Upcoming Events */}
            {filterEvents(upcoming).length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />Upcoming Events</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {filterEvents(upcoming).map(event => {
                            const Icon = typeIcons[event.type]
                            const colorClass = typeColors[event.type]
                            return (
                                <Card key={event.id} className="hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
                                    <div className={`h-1.5 ${colorClass.split(' ')[1]}`} />
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm leading-tight">{event.title}</h3>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(event.date)}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.attendees}/{event.maxAttendees}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] capitalize">{event.type}</Badge>
                                                <Badge variant="secondary" className="text-[10px] gap-1">
                                                    {event.mode === 'online' ? <Video className="w-2.5 h-2.5" /> : event.mode === 'hybrid' ? <Globe className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                                                    {event.mode}
                                                </Badge>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={rsvps.includes(event.id) ? 'default' : 'outline'}
                                                onClick={() => toggleRsvp(event.id)}
                                                className="text-xs"
                                            >
                                                <CalendarCheck className="w-3 h-3 mr-1" />
                                                {rsvps.includes(event.id) ? 'RSVP\'d ✓' : 'RSVP'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Past Events */}
            {filterEvents(past).length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground"><Clock className="w-5 h-5" />Past Events</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {filterEvents(past).map(event => {
                            const Icon = typeIcons[event.type]
                            return (
                                <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                                <Icon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm">{event.title}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(event.date)} • {event.attendees} attended</p>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] shrink-0">Ended</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filterEvents(upcoming).length === 0 && filterEvents(past).length === 0 && (
                <Card><CardContent className="p-12 text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No events found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                </CardContent></Card>
            )}
        </div>
    )
}
