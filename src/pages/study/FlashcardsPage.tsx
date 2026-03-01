import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, Brain, Check, X, Plus, Trash2, Trophy, RotateCcw, Save } from 'lucide-react'
import {
    getFlashcardSets, saveFlashcardSet, deleteFlashcardSet,
    updateSetMastery, logFlashcardReview, type FlashcardSet
} from '@/services/studyStore'

const SUBJECTS = ['DSA', 'OS', 'DBMS', 'CN', 'SE', 'Math', 'Other']

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

export default function FlashcardsPage() {
    const [sets, setSets] = useState<FlashcardSet[]>(() => getFlashcardSets())
    const [activeSetId, setActiveSetId] = useState<string | null>(null)
    const [currentCard, setCurrentCard] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [score, setScore] = useState({ correct: 0, wrong: 0 })
    const [completed, setCompleted] = useState(false)
    const [createModal, setCreateModal] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [newSet, setNewSet] = useState({ title: '', subject: 'DSA', cards: [{ q: '', a: '' }] })

    const activeSet = activeSetId ? sets.find(s => s.id === activeSetId) : null

    const startReview = (id: string) => {
        setActiveSetId(id)
        setCurrentCard(0)
        setFlipped(false)
        setScore({ correct: 0, wrong: 0 })
        setCompleted(false)
    }

    const exitReview = () => {
        setActiveSetId(null)
        setCurrentCard(0)
        setFlipped(false)
        setScore({ correct: 0, wrong: 0 })
        setCompleted(false)
    }

    const answerCard = (correct: boolean) => {
        const newScore = { ...score, [correct ? 'correct' : 'wrong']: score[correct ? 'correct' : 'wrong'] + 1 }
        setScore(newScore)
        setFlipped(false)

        if (activeSet && currentCard >= activeSet.cards.length - 1) {
            // End of deck
            const newMastery = Math.min(activeSet.cards.length, Math.round((newScore.correct / activeSet.cards.length) * activeSet.cards.length))
            updateSetMastery(activeSet.id, newMastery)
            logFlashcardReview(activeSet.id, newScore.correct, newScore.wrong)
            setSets(getFlashcardSets())
            setCompleted(true)
        } else {
            setCurrentCard(c => c + 1)
        }
    }

    const handleCreateSet = () => {
        const validCards = newSet.cards.filter(c => c.q.trim() && c.a.trim())
        if (!newSet.title.trim() || validCards.length === 0) return
        saveFlashcardSet({ title: newSet.title.trim(), subject: newSet.subject, cards: validCards })
        setSets(getFlashcardSets())
        setCreateModal(false)
        setNewSet({ title: '', subject: 'DSA', cards: [{ q: '', a: '' }] })
    }

    const handleDeleteSet = (id: string) => {
        deleteFlashcardSet(id)
        setSets(getFlashcardSets())
        setDeleteId(null)
    }

    const addCardField = () => {
        setNewSet(s => ({ ...s, cards: [...s.cards, { q: '', a: '' }] }))
    }

    const updateCardField = (index: number, field: 'q' | 'a', value: string) => {
        setNewSet(s => {
            const cards = [...s.cards]
            cards[index] = { ...cards[index], [field]: value }
            return { ...s, cards }
        })
    }

    const removeCardField = (index: number) => {
        setNewSet(s => ({ ...s, cards: s.cards.filter((_, i) => i !== index) }))
    }

    // ─── Completion Screen ─────────────────────────────────────────────
    if (activeSet && completed) {
        const pct = Math.round((score.correct / activeSet.cards.length) * 100)
        return (
            <div className="space-y-6 max-w-lg mx-auto text-center">
                <div className="pt-8">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Trophy className={`w-10 h-10 ${pct >= 80 ? 'text-yellow-500' : pct >= 50 ? 'text-blue-500' : 'text-muted-foreground'}`} />
                    </div>
                    <h1 className="text-2xl font-bold">{pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good Job!' : 'Keep Practicing!'}</h1>
                    <p className="text-muted-foreground mt-1">You completed <span className="font-semibold text-foreground">{activeSet.title}</span></p>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-3xl font-bold text-green-500">{score.correct}</p>
                                <p className="text-xs text-muted-foreground">Correct</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-red-500">{score.wrong}</p>
                                <p className="text-xs text-muted-foreground">Wrong</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-primary">{pct}%</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                        </div>
                        <Progress value={pct} className="h-3" />
                    </CardContent>
                </Card>

                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => startReview(activeSet.id)}>
                        <RotateCcw className="w-4 h-4 mr-2" />Review Again
                    </Button>
                    <Button onClick={exitReview}>
                        <ChevronLeft className="w-4 h-4 mr-2" />Back to Sets
                    </Button>
                </div>
            </div>
        )
    }

    // ─── Study Mode ────────────────────────────────────────────────────
    if (activeSet) {
        const card = activeSet.cards[currentCard]
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={exitReview}>
                        <ChevronLeft className="w-4 h-4 mr-1" />Back
                    </Button>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-500 font-medium">✓ {score.correct}</span>
                        <span className="text-red-500 font-medium">✗ {score.wrong}</span>
                        <Badge variant="outline">{currentCard + 1}/{activeSet.cards.length}</Badge>
                    </div>
                </div>

                <Progress value={((currentCard + 1) / activeSet.cards.length) * 100} className="h-1.5" />

                {/* Flashcard with 3D flip */}
                <div
                    className="cursor-pointer"
                    onClick={() => setFlipped(!flipped)}
                    style={{ perspective: '1000px' }}
                >
                    <div
                        className="relative transition-transform duration-500"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                    >
                        {/* Front */}
                        <Card className="min-h-[280px] flex items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                            <CardContent className="p-8 text-center">
                                <Badge variant="secondary" className="mb-4">Question</Badge>
                                <p className="text-lg font-semibold">{card.q}</p>
                                <p className="text-xs text-muted-foreground mt-6">Click to flip</p>
                            </CardContent>
                        </Card>
                        {/* Back */}
                        <Card
                            className="min-h-[280px] flex items-center justify-center absolute inset-0"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <CardContent className="p-8 text-center">
                                <Badge variant="default" className="mb-4">Answer</Badge>
                                <p className="text-base text-muted-foreground">{card.a}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    <Button
                        variant="outline" size="lg"
                        className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => answerCard(false)}
                    >
                        <X className="w-5 h-5 mr-1" />Didn&apos;t Know
                    </Button>
                    <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => answerCard(true)}
                    >
                        <Check className="w-5 h-5 mr-1" />Got It!
                    </Button>
                </div>
            </div>
        )
    }

    // ─── Set Listing ───────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Flashcards</h1>
                    <p className="text-muted-foreground text-sm">Spaced repetition study cards</p>
                </div>
                <Button onClick={() => setCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />New Set
                </Button>
            </div>

            {sets.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No flashcard sets yet</p>
                        <p className="text-sm mt-1">Click "New Set" to create your first flashcard deck</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {sets.map(set => (
                        <Card key={set.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <Badge variant="secondary" className="text-[10px]">{set.subject}</Badge>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">{timeAgo(set.lastReview)}</span>
                                        <Button
                                            size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive"
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(set.id) }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="font-semibold mb-1">{set.title}</h3>
                                <p className="text-xs text-muted-foreground mb-3">{set.cards.length} cards • {set.mastered} mastered</p>
                                <Progress value={(set.mastered / set.cards.length) * 100} className="h-2 mb-2" />
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-muted-foreground">{Math.round((set.mastered / set.cards.length) * 100)}% mastered</span>
                                    <Button size="sm" variant="outline" className="text-xs" onClick={() => startReview(set.id)}>
                                        <Brain className="w-3 h-3 mr-1" />Review
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Set Modal */}
            {createModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCreateModal(false)} />
                    <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">New Flashcard Set</h2>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setCreateModal(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <Input
                            placeholder="Set title (e.g. DSA - Graphs)"
                            value={newSet.title}
                            onChange={e => setNewSet(s => ({ ...s, title: e.target.value }))}
                            autoFocus
                        />
                        <div className="flex gap-2 flex-wrap">
                            {SUBJECTS.map(s => (
                                <Badge
                                    key={s}
                                    variant={newSet.subject === s ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => setNewSet(prev => ({ ...prev, subject: s }))}
                                >{s}</Badge>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium">Cards ({newSet.cards.length})</p>
                            {newSet.cards.map((card, i) => (
                                <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground font-medium">Card {i + 1}</span>
                                        {newSet.cards.length > 1 && (
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeCardField(i)}>
                                                <X className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input placeholder="Question" value={card.q} onChange={e => updateCardField(i, 'q', e.target.value)} />
                                    <Input placeholder="Answer" value={card.a} onChange={e => updateCardField(i, 'a', e.target.value)} />
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full" onClick={addCardField}>
                                <Plus className="w-3 h-3 mr-1" />Add Card
                            </Button>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setCreateModal(false)}>Cancel</Button>
                            <Button
                                onClick={handleCreateSet}
                                disabled={!newSet.title.trim() || !newSet.cards.some(c => c.q.trim() && c.a.trim())}
                            >
                                <Save className="w-4 h-4 mr-2" />Create Set
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold">Delete Flashcard Set</h2>
                        <p className="text-sm text-muted-foreground">Are you sure? All cards in this set will be permanently deleted.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDeleteSet(deleteId)}>
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
