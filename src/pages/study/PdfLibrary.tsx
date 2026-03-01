import { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Eye, Trash2, Search, X, ArrowLeft } from 'lucide-react'
import { getPdfs, savePdf, deletePdf, logPdfView, type StudyPdf } from '@/services/studyStore'

const SUBJECTS = ['DSA', 'OS', 'DBMS', 'CN', 'SE', 'Math', 'Other']

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function PdfLibrary() {
    const [pdfs, setPdfs] = useState<StudyPdf[]>(() => getPdfs())
    const [viewPdf, setViewPdf] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadSubject, setUploadSubject] = useState('Other')
    const [showSubjectPicker, setShowSubjectPicker] = useState<File | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const filtered = pdfs.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.subject.toLowerCase().includes(search.toLowerCase())
    )

    const handleFileUpload = useCallback((file: File) => {
        if (!file.name.endsWith('.pdf')) return
        setShowSubjectPicker(file)
        setUploadSubject('Other')
    }, [])

    const confirmUpload = useCallback(() => {
        const file = showSubjectPicker
        if (!file) return
        setUploading(true)
        setShowSubjectPicker(null)
        const reader = new FileReader()
        reader.onload = () => {
            const dataUrl = reader.result as string
            savePdf({
                name: file.name,
                size: formatFileSize(file.size),
                subject: uploadSubject,
                pages: Math.ceil(file.size / 3000), // rough estimate
                dataUrl,
            })
            setPdfs(getPdfs())
            setUploading(false)
        }
        reader.onerror = () => setUploading(false)
        reader.readAsDataURL(file)
    }, [showSubjectPicker, uploadSubject])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileUpload(file)
    }, [handleFileUpload])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFileUpload(file)
        e.target.value = ''
    }, [handleFileUpload])

    const handleView = (pdf: StudyPdf) => {
        setViewPdf(pdf.id)
        logPdfView(pdf.id, pdf.name)
    }

    const handleDelete = (id: string) => {
        deletePdf(id)
        setPdfs(getPdfs())
        setDeleteId(null)
    }

    const viewingPdf = viewPdf ? pdfs.find(p => p.id === viewPdf) : null

    if (viewingPdf) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setViewPdf(null)}>
                        <ArrowLeft className="w-4 h-4 mr-1" />Back
                    </Button>
                    <h2 className="font-semibold truncate">{viewingPdf.name}</h2>
                    <Badge variant="secondary">{viewingPdf.subject}</Badge>
                </div>
                <Card>
                    <CardContent className="p-0">
                        {viewingPdf.dataUrl ? (
                            <iframe
                                src={viewingPdf.dataUrl}
                                className="w-full rounded-lg border-0"
                                style={{ height: '75vh' }}
                                title={viewingPdf.name}
                            />
                        ) : (
                            <div className="w-full rounded-lg bg-muted/50 border flex items-center justify-center" style={{ height: '75vh' }}>
                                <div className="text-center text-muted-foreground">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p className="font-medium">PDF Preview Unavailable</p>
                                    <p className="text-sm mt-1">This is a demo PDF entry without file data</p>
                                    <p className="text-xs mt-2 opacity-50">Upload a real PDF to see the in-browser viewer</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">PDF Library</h1>
                    <p className="text-muted-foreground text-sm">Upload and manage your study materials</p>
                </div>
                <div>
                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleInputChange} />
                    <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <Upload className="w-4 h-4 mr-2" />{uploading ? 'Uploading...' : 'Upload PDF'}
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search PDFs..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* PDF Grid */}
            <div
                className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 ${dragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {filtered.map(pdf => (
                    <Card key={pdf.id} className="hover:shadow-md transition-all hover:-translate-y-0.5 group">
                        <CardContent className="p-4">
                            <div className="w-full h-32 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 flex items-center justify-center mb-3 relative">
                                <FileText className="w-12 h-12 text-red-500/50" />
                                {pdf.dataUrl && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="secondary" className="text-[9px] px-1.5">Real</Badge>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <Badge variant="outline" className="text-[9px]">{pdf.subject}</Badge>
                            </div>
                            <h3 className="font-medium text-sm truncate" title={pdf.name}>{pdf.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{pdf.pages} pages • {pdf.size}</p>
                            <div className="flex gap-1 mt-3">
                                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleView(pdf)}>
                                    <Eye className="w-3 h-3 mr-1" />View
                                </Button>
                                <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => setDeleteId(pdf.id)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Upload Card */}
                <Card
                    className={`border-dashed hover:border-primary/50 transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => fileRef.current?.click()}
                >
                    <CardContent className="p-4 h-full flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                        <Upload className={`w-8 h-8 mb-2 ${dragOver ? 'opacity-80 text-primary' : 'opacity-30'}`} />
                        <p className="text-sm font-medium">{dragOver ? 'Drop PDF to upload' : 'Drop PDF here'}</p>
                        <p className="text-xs">or click to browse</p>
                    </CardContent>
                </Card>
            </div>

            {/* Subject Picker Modal */}
            {showSubjectPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubjectPicker(null)} />
                    <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Upload PDF</h2>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowSubjectPicker(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">File: <span className="font-medium text-foreground">{showSubjectPicker.name}</span></p>
                            <p className="text-xs text-muted-foreground">Size: {formatFileSize(showSubjectPicker.size)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-2">Select Subject</p>
                            <div className="flex gap-2 flex-wrap">
                                {SUBJECTS.map(s => (
                                    <Badge
                                        key={s}
                                        variant={uploadSubject === s ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => setUploadSubject(s)}
                                    >{s}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowSubjectPicker(null)}>Cancel</Button>
                            <Button onClick={confirmUpload}>
                                <Upload className="w-4 h-4 mr-2" />Upload
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
                        <h2 className="text-lg font-bold">Delete PDF</h2>
                        <p className="text-sm text-muted-foreground">Are you sure you want to delete this PDF? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDelete(deleteId)}>
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
