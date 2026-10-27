import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  ExternalLink,
  MapPin,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { RetreatStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatINR } from '@/utils/pricing'

export function OrganizerListingsPage() {
  const { retreats, activeOrganizerId, updateRetreatStatus } = useDemoStore()
  const [filter, setFilter] = useState<'all' | RetreatStatus>('all')

  const orgRetreats = retreats.filter((r) => r.organizerId === activeOrganizerId)

  const displayedRetreats = orgRetreats.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  const handleTogglePublish = (retreatId: string, currentStatus: RetreatStatus) => {
    const nextStatus: RetreatStatus =
      currentStatus === 'published' ? 'draft' : 'published'
    updateRetreatStatus(retreatId, nextStatus)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retreat Listings Management"
        description="Create, manage, and publish immersion schedules and accommodation packages for your school."
        badge={
          <Badge variant="gold" size="sm">
            {orgRetreats.length} Total Listings
          </Badge>
        }
        actions={
          <Link to="/organizer/listings/new">
            <Button size="sm" className="gap-1.5 font-medium">
              <Plus className="h-4 w-4" />
              Create Retreat Listing
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 text-xs">
        {(['all', 'published', 'pending_review', 'draft'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              filter === tab
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Listings Table / Cards */}
      <div className="space-y-4">
        {displayedRetreats.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            No retreats matching &ldquo;{filter}&rdquo; status.
          </div>
        ) : (
          displayedRetreats.map((retreat) => (
            <Card
              key={retreat.id}
              className="p-5 border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-card"
            >
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={retreat.heroImage}
                  alt={retreat.title}
                  className="h-20 w-28 rounded-lg object-cover shrink-0 border border-border"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-base font-semibold text-foreground">
                      {retreat.title}
                    </h3>
                    <Badge
                      variant={
                        retreat.status === 'published'
                          ? 'success'
                          : retreat.status === 'pending_review'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {retreat.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      {retreat.location.city}, {retreat.location.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {retreat.durationDays} Days / {retreat.durationNights} Nights
                    </span>
                    <span>Starting {formatINR(retreat.startingPrice)}</span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {retreat.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePublish(retreat.id, retreat.status)}
                  className="text-xs gap-1"
                >
                  {retreat.status === 'published' ? (
                    <>
                      <ToggleRight className="h-3.5 w-3.5 text-primary" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                      Publish
                    </>
                  )}
                </Button>

                <Link to={`/organizer/listings/${retreat.id}/edit`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Edit
                  </Button>
                </Link>

                <Link to={`/retreats/${retreat.id}`}>
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    Preview
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
