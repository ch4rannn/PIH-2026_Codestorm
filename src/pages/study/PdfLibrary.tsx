import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Eye, Trash2 } from 'lucide-react'

const mockPdfs = [
    { id: '1', name: 'DSA Complete Notes.pdf', size: '2.4 MB', uploadedAt: '2026-02-20', subject: 'DSA', pages: 48 },
    { id: '2', name: 'Operating Systems - Unit 3.pdf', size: '1.8 MB', uploadedAt: '2026-02-18', subject: 'OS', pages: 32 },
    { id: '3', name: 'DBMS ER-Diagrams Tutorial.pdf', size: '3.1 MB', uploadedAt: '2026-02-15', subject: 'DBMS', pages: 55 },
    { id: '4', name: 'Computer Networks - TCP/IP.pdf', size: '1.2 MB', uploadedAt: '2026-02-10', subject: 'CN', pages: 28 },
]

export default function PdfLibrary() {
    const [pdfs] = useState(mockPdfs)
    const [viewPdf, setViewPdf] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">PDF Library</h1>
                    <p className="text-muted-foreground text-sm">Upload and manage your study materials</p>
                </div>
                <div>
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={() => { }} />
                    <Button onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Upload PDF</Button>
                </div>
            </div>

            {viewPdf ? (
                <Card>
                    <CardHeader className="flex-row items-center justify-between py-3">
                        <CardTitle className="text-base">{pdfs.find(p => p.id === viewPdf)?.name}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setViewPdf(null)}>Close</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[600px] rounded-lg bg-muted/50 border flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">PDF Viewer Container</p>
                                <p className="text-sm mt-1">Ready for PDF.js or Adobe Embed API integration</p>
                                <p className="text-xs mt-2 opacity-50">Connect your preferred PDF rendering library here</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pdfs.map(pdf => (
                        <Card key={pdf.id} className="hover:shadow-md transition-all hover:-translate-y-0.5 group">
                            <CardContent className="p-4">
                                <div className="w-full h-32 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 flex items-center justify-center mb-3">
                                    <FileText className="w-12 h-12 text-red-500/50" />
                                </div>
                                <h3 className="font-medium text-sm truncate" title={pdf.name}>{pdf.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{pdf.subject} • {pdf.pages} pages • {pdf.size}</p>
                                <div className="flex gap-1 mt-3">
                                    <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setViewPdf(pdf.id)}>
                                        <Eye className="w-3 h-3 mr-1" />View
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-xs text-destructive"><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {/* Upload Card */}
                    <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                        <CardContent className="p-4 h-full flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                            <Upload className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">Drop PDF here</p>
                            <p className="text-xs">or click to browse</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
