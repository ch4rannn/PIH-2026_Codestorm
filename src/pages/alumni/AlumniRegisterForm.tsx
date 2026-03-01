import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    UserPlus, X, CheckCircle2, Loader2, GraduationCap,
    Building2, Briefcase, Plus
} from 'lucide-react'
import { createAlumni } from '@/services/alumniService'

interface AlumniRegisterFormProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

const departments = ['CS', 'IT', 'ECE', 'EE', 'ME', 'CE', 'MBA', 'Other']
const industries = ['Technology', 'FinTech', 'E-Commerce', 'Healthcare', 'Consulting', 'Education', 'Entertainment', 'Other']

export default function AlumniRegisterForm({ open, onClose, onSuccess }: AlumniRegisterFormProps) {
    const [form, setForm] = useState({
        name: '', email: '', role: '', company: '', batch: '',
        department: 'CS', location: '', experience: '', industry: 'Technology',
        linkedin: '', available: true,
    })
    const [skills, setSkills] = useState<string[]>([])
    const [skillInput, setSkillInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const update = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }))

    const addSkill = () => {
        const s = skillInput.trim()
        if (s && !skills.includes(s)) {
            setSkills(prev => [...prev, s])
            setSkillInput('')
        }
    }

    const removeSkill = (skill: string) => setSkills(prev => prev.filter(s => s !== skill))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.role || !form.company || !form.batch) {
            setError('Please fill in all required fields')
            return
        }
        setLoading(true)
        setError(null)
        try {
            await createAlumni({ ...form, skills })
            setSuccess(true)
            setTimeout(() => {
                onSuccess()
                onClose()
                setSuccess(false)
                setForm({ name: '', email: '', role: '', company: '', batch: '', department: 'CS', location: '', experience: '', industry: 'Technology', linkedin: '', available: true })
                setSkills([])
            }, 1500)
        } catch (err: unknown) {
            setError((err as Error).message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Alumni Registration
                        </CardTitle>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground">Join the alumni network and connect with your batchmates</p>
                </CardHeader>

                {success ? (
                    <CardContent className="py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">Registration Successful!</h3>
                        <p className="text-sm text-muted-foreground mt-1">Welcome to the alumni network 🎉</p>
                    </CardContent>
                ) : (
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Preview */}
                            {form.name && (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                            {form.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{form.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {form.role || 'Role'} at {form.company || 'Company'} • Batch {form.batch || '20XX'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Personal Info */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Personal Info</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Full Name *</label>
                                        <Input placeholder="e.g. Ankit Verma" value={form.name} onChange={e => update('name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Email *</label>
                                        <Input type="email" placeholder="ankit@alumni.edu" value={form.email} onChange={e => update('email', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Info */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1"><GraduationCap className="w-3 h-3" />Academic</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Batch Year *</label>
                                        <Input placeholder="e.g. 2020" value={form.batch} onChange={e => update('batch', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Department *</label>
                                        <select value={form.department} onChange={e => update('department', e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border bg-background">
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Info */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1"><Building2 className="w-3 h-3" />Professional</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Current Role *</label>
                                        <Input placeholder="e.g. SDE-2" value={form.role} onChange={e => update('role', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Company *</label>
                                        <Input placeholder="e.g. Google" value={form.company} onChange={e => update('company', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Location</label>
                                        <Input placeholder="e.g. Bangalore" value={form.location} onChange={e => update('location', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Experience</label>
                                        <Input placeholder="e.g. 4 yrs" value={form.experience} onChange={e => update('experience', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">Industry</label>
                                        <select value={form.industry} onChange={e => update('industry', e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border bg-background">
                                            {industries.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium mb-1 block">LinkedIn URL</label>
                                        <Input placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={e => update('linkedin', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1"><Briefcase className="w-3 h-3" />Skills</p>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        placeholder="Add a skill..."
                                        value={skillInput}
                                        onChange={e => setSkillInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                                    />
                                    <Button type="button" size="sm" variant="outline" onClick={addSkill}><Plus className="w-4 h-4" /></Button>
                                </div>
                                {skills.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {skills.map(s => (
                                            <Badge key={s} variant="secondary" className="text-xs gap-1 pr-1">
                                                {s}
                                                <button type="button" onClick={() => removeSkill(s)} className="ml-0.5 hover:text-destructive">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Availability */}
                            <div className="flex items-center gap-3 p-3 rounded-lg border">
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={form.available}
                                    onChange={e => update('available', e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="available" className="text-sm cursor-pointer">
                                    I'm available for mentorship & referrals
                                </label>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    {loading ? 'Registering...' : 'Register as Alumni'}
                                </Button>
                                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
