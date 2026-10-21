import { Link } from 'react-router-dom'
import { Compass, Sparkles, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-full bg-secondary/80 flex items-center justify-center text-primary shadow-xs">
          <Compass className="h-8 w-8 text-accent animate-spin-slow" />
        </div>

        <Badge variant="gold" size="sm">
          Sanctuary Not Found &bull; 404
        </Badge>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
          The path you seek has wandered
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          The retreat, portal view, or resource you are looking for does not exist or may have been repositioned in this demonstration.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button size="default" className="gap-2 font-medium w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" size="default" className="gap-2 w-full sm:w-auto">
              <Sparkles className="h-4 w-4 text-accent" />
              Discover Retreats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
