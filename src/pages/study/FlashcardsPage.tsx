import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RotateCcw, ChevronLeft, ChevronRight, Brain, Zap, Check, X, Shuffle } from 'lucide-react'

const flashcardSets = [
    { id: '1', title: 'DSA - Arrays & Sorting', cards: 20, mastered: 14, subject: 'DSA', lastReview: '2 hours ago' },
    { id: '2', title: 'OS - Process Management', cards: 15, mastered: 8, subject: 'OS', lastReview: '1 day ago' },
    { id: '3', title: 'DBMS - Normalization', cards: 12, mastered: 12, subject: 'DBMS', lastReview: '3 days ago' },
    { id: '4', title: 'CN - OSI Model', cards: 10, mastered: 3, subject: 'CN', lastReview: '5 days ago' },
]

const sampleCards = [
    { q: 'What is the time complexity of QuickSort in the average case?', a: 'O(n log n) — QuickSort uses divide-and-conquer with a pivot element, giving average-case linearithmic time.' },
    { q: 'What is a Binary Search Tree (BST)?', a: 'A BST is a binary tree where for each node, left subtree values are less and right subtree values are greater than the node.' },
    { q: 'Explain the concept of Dynamic Programming.', a: 'DP solves complex problems by breaking them into overlapping subproblems, storing results to avoid redundant computation (memoization/tabulation).' },
    { q: 'What is a Hash Table collision? Name two resolution strategies.', a: 'Collision occurs when two keys hash to the same index. Resolution: 1) Chaining (linked lists), 2) Open Addressing (linear/quadratic probing).' },
    { q: 'What is the difference between Stack and Queue?', a: 'Stack follows LIFO (Last In, First Out). Queue follows FIFO (First In, First Out). Stack: push/pop. Queue: enqueue/dequeue.' },
]

export default function FlashcardsPage() {
    const [activeSet, setActiveSet] = useState<string | null>(null)
    const [currentCard, setCurrentCard] = useState(0)
    const [flipped, setFlipped] = useState(false)
    const [score, setScore] = useState({ correct: 0, wrong: 0 })

    if (activeSet) {
        const card = sampleCards[currentCard % sampleCards.length]
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => { setActiveSet(null); setCurrentCard(0); setFlipped(false); setScore({ correct: 0, wrong: 0 }) }}>
                        <ChevronLeft className="w-4 h-4 mr-1" />Back
                    </Button>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-500">✓ {score.correct}</span>
                        <span className="text-red-500">✗ {score.wrong}</span>
                        <Badge variant="outline">{currentCard + 1}/{sampleCards.length}</Badge>
                    </div>
                </div>

                <Progress value={((currentCard + 1) / sampleCards.length) * 100} className="h-1.5" />

                {/* Flashcard */}
                <div
                    className="cursor-pointer"
                    onClick={() => setFlipped(!flipped)}
                >
                    <Card className="min-h-[300px] flex items-center justify-center hover:shadow-lg transition-shadow">
                        <CardContent className="p-8 text-center">
                            <Badge variant="secondary" className="mb-4">{flipped ? 'Answer' : 'Question'}</Badge>
                            <p className={`text-lg ${flipped ? 'text-base text-muted-foreground' : 'font-semibold'}`}>
                                {flipped ? card.a : card.q}
                            </p>
                            {!flipped && <p className="text-xs text-muted-foreground mt-4">Click to flip</p>}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center gap-3">
                    <Button variant="outline" size="lg" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950" onClick={() => { setScore(s => ({ ...s, wrong: s.wrong + 1 })); setFlipped(false); setCurrentCard(c => Math.min(c + 1, sampleCards.length - 1)) }}>
                        <X className="w-5 h-5 mr-1" />Didn't Know
                    </Button>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { setScore(s => ({ ...s, correct: s.correct + 1 })); setFlipped(false); setCurrentCard(c => Math.min(c + 1, sampleCards.length - 1)) }}>
                        <Check className="w-5 h-5 mr-1" />Got It!
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Flashcards</h1>
                <p className="text-muted-foreground text-sm">Spaced repetition study cards</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                {flashcardSets.map(set => (
                    <Card key={set.id} className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => setActiveSet(set.id)}>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <Badge variant="secondary" className="text-[10px]">{set.subject}</Badge>
                                <span className="text-xs text-muted-foreground">{set.lastReview}</span>
                            </div>
                            <h3 className="font-semibold mb-1">{set.title}</h3>
                            <p className="text-xs text-muted-foreground mb-3">{set.cards} cards • {set.mastered} mastered</p>
                            <Progress value={(set.mastered / set.cards) * 100} className="h-2 mb-2" />
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-muted-foreground">{Math.round((set.mastered / set.cards) * 100)}% mastered</span>
                                <Button size="sm" variant="outline" className="text-xs"><Brain className="w-3 h-3 mr-1" />Review</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
