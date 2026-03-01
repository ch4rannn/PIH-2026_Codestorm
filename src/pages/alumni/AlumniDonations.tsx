import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Heart, TrendingUp, Users, Gift, Award,
    GraduationCap, Building2, FlaskConical, Landmark, IndianRupee, Star
} from 'lucide-react'

interface Campaign {
    id: string
    title: string
    description: string
    category: 'scholarship' | 'infrastructure' | 'research' | 'general'
    goal: number
    raised: number
    donors: number
    endDate: string
    featured: boolean
}

interface RecentDonation {
    id: string
    name: string
    amount: number
    campaign: string
    date: string
    anonymous: boolean
}

const campaigns: Campaign[] = [
    {
        id: '1', title: 'Merit Scholarship Fund 2026', description: 'Support deserving students with merit-based scholarships covering tuition and living expenses.',
        category: 'scholarship', goal: 2500000, raised: 1875000, donors: 342, endDate: '2026-06-30', featured: true,
    },
    {
        id: '2', title: 'New Computer Lab Infrastructure', description: 'Help us build a state-of-the-art computer lab with 200+ workstations and latest hardware.',
        category: 'infrastructure', goal: 5000000, raised: 3200000, donors: 189, endDate: '2026-09-15', featured: true,
    },
    {
        id: '3', title: 'AI Research Center Fund', description: 'Contribute to establishing a dedicated AI & ML research center for cutting-edge research.',
        category: 'research', goal: 10000000, raised: 4500000, donors: 127, endDate: '2026-12-31', featured: false,
    },
    {
        id: '4', title: 'Campus Green Initiative', description: 'Fund solar panels, rain water harvesting, and campus beautification projects.',
        category: 'general', goal: 1500000, raised: 980000, donors: 256, endDate: '2026-05-01', featured: false,
    },
    {
        id: '5', title: 'Need-Based Financial Aid', description: 'Provide financial assistance to students from economically disadvantaged backgrounds.',
        category: 'scholarship', goal: 3000000, raised: 2100000, donors: 410, endDate: '2026-08-20', featured: false,
    },
]

const recentDonations: RecentDonation[] = [
    { id: '1', name: 'Ankit Verma', amount: 50000, campaign: 'Merit Scholarship Fund 2026', date: '2 hours ago', anonymous: false },
    { id: '2', name: 'Anonymous', amount: 100000, campaign: 'New Computer Lab Infrastructure', date: '5 hours ago', anonymous: true },
    { id: '3', name: 'Priya Singh', amount: 25000, campaign: 'AI Research Center Fund', date: '1 day ago', anonymous: false },
    { id: '4', name: 'Rohit Mehta', amount: 10000, campaign: 'Campus Green Initiative', date: '1 day ago', anonymous: false },
    { id: '5', name: 'Anonymous', amount: 75000, campaign: 'Need-Based Financial Aid', date: '2 days ago', anonymous: true },
    { id: '6', name: 'Sneha Patel', amount: 30000, campaign: 'Merit Scholarship Fund 2026', date: '3 days ago', anonymous: false },
]

const topDonors = [
    { name: 'Vikram Joshi', batch: '2018', total: 500000, donations: 12 },
    { name: 'Meera Reddy', batch: '2019', total: 350000, donations: 8 },
    { name: 'Ankit Verma', batch: '2020', total: 275000, donations: 15 },
    { name: 'Priya Singh', batch: '2019', total: 200000, donations: 6 },
    { name: 'Rohit Mehta', batch: '2021', total: 150000, donations: 10 },
]

const categoryIcons: Record<string, typeof Heart> = {
    scholarship: GraduationCap,
    infrastructure: Building2,
    research: FlaskConical,
    general: Landmark,
}

const categoryColors: Record<string, string> = {
    scholarship: 'text-blue-500 bg-blue-500/10',
    infrastructure: 'text-amber-500 bg-amber-500/10',
    research: 'text-purple-500 bg-purple-500/10',
    general: 'text-emerald-500 bg-emerald-500/10',
}

const quickAmounts = [1000, 5000, 10000, 25000, 50000]

const formatCurrency = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
    return `₹${n}`
}

export default function AlumniDonations() {
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
    const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

    const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0)
    const totalDonors = campaigns.reduce((s, c) => s + c.donors, 0)

    const filtered = campaigns.filter(c => categoryFilter === 'All' || c.category === categoryFilter)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Alumni Giving</h1>
                    <p className="text-muted-foreground text-sm">Support your alma mater — every contribution makes a difference</p>
                </div>
                <Button className="gap-2"><Heart className="w-4 h-4" />Make a Donation</Button>
            </div>

            {/* Impact Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Total Raised', value: formatCurrency(totalRaised), icon: IndianRupee, color: 'text-emerald-500' },
                    { label: 'Total Donors', value: totalDonors.toLocaleString(), icon: Users, color: 'text-blue-500' },
                    { label: 'Active Campaigns', value: campaigns.length, icon: Gift, color: 'text-purple-500' },
                    { label: 'Avg Progress', value: `${Math.round(campaigns.reduce((s, c) => s + (c.raised / c.goal) * 100, 0) / campaigns.length)}%`, icon: TrendingUp, color: 'text-amber-500' },
                ].map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} bg-current/10`}>
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

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {['All', 'scholarship', 'infrastructure', 'research', 'general'].map(c => (
                    <Button key={c} size="sm" variant={categoryFilter === c ? 'default' : 'outline'} onClick={() => setCategoryFilter(c)} className="capitalize text-xs">
                        {c === 'All' ? 'All Campaigns' : c}
                    </Button>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Campaigns */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold">Active Campaigns</h2>
                    {filtered.map(campaign => {
                        const Icon = categoryIcons[campaign.category]
                        const colorClass = categoryColors[campaign.category]
                        const progress = Math.round((campaign.raised / campaign.goal) * 100)
                        return (
                            <Card key={campaign.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-sm">{campaign.title}</h3>
                                                {campaign.featured && <Badge className="text-[10px] shrink-0 gap-1"><Star className="w-2.5 h-2.5" />Featured</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{campaign.description}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium">{formatCurrency(campaign.raised)} raised</span>
                                            <span className="text-muted-foreground">of {formatCurrency(campaign.goal)}</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{campaign.donors} donors</span>
                                            <span>{progress}% funded</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[10px] capitalize">{campaign.category}</Badge>
                                        <Button size="sm" onClick={() => setSelectedCampaign(campaign.id)} className="text-xs gap-1">
                                            <Heart className="w-3 h-3" />Donate
                                        </Button>
                                    </div>

                                    {/* Quick Donate Panel */}
                                    {selectedCampaign === campaign.id && (
                                        <div className="mt-4 pt-4 border-t space-y-3">
                                            <p className="text-xs font-medium">Select amount:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {quickAmounts.map(amt => (
                                                    <Button
                                                        key={amt}
                                                        size="sm"
                                                        variant={selectedAmount === amt ? 'default' : 'outline'}
                                                        onClick={() => setSelectedAmount(amt)}
                                                        className="text-xs"
                                                    >
                                                        ₹{amt.toLocaleString()}
                                                    </Button>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="flex-1" disabled={!selectedAmount}>Proceed to Pay</Button>
                                                <Button size="sm" variant="ghost" onClick={() => { setSelectedCampaign(null); setSelectedAmount(null) }}>Cancel</Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Recent Donations Feed */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Recent Donations</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {recentDonations.slice(0, 5).map(d => (
                                <div key={d.id} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {d.anonymous ? '?' : d.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{d.anonymous ? 'Anonymous Donor' : d.name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{d.campaign}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-semibold text-emerald-500">₹{d.amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground">{d.date}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Top Donors Leaderboard */}
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" />Top Donors</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {topDonors.map((donor, i) => (
                                <div key={donor.name} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                                        ${i === 0 ? 'bg-amber-500/20 text-amber-600' : i === 1 ? 'bg-gray-300/30 text-gray-500' : i === 2 ? 'bg-orange-400/20 text-orange-500' : 'bg-muted text-muted-foreground'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{donor.name}</p>
                                        <p className="text-[10px] text-muted-foreground">Batch {donor.batch} • {donor.donations} donations</p>
                                    </div>
                                    <p className="text-xs font-semibold shrink-0">{formatCurrency(donor.total)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
