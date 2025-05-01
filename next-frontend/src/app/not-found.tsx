import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center py-12">
      <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
      <h1 className="mb-2 text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mb-6 text-lg text-muted-foreground">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
        <Link href="/">Go Back Home</Link>
      </Button>
    </div>
  )
}
