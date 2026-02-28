import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'

export default function Unauthorized() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <ShieldX className="w-16 h-16 mx-auto mb-4 text-destructive opacity-50" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
                <Button asChild><Link to="/dashboard">Go to Dashboard</Link></Button>
            </div>
        </div>
    )
}
