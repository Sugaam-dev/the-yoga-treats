import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  MapPin,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { RetreatStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function AdminListingsPage() {
  const { retreats, updateRetreatStatus } = useDemoStore()
  const [statusFilter, setStatusFilter] = useState<'all' | RetreatStatus>('all')

  const filteredRetreats = retreats.filter((r) => {
    if (statusFilter === 'all') return true
    return r.status === statusFilter
  })

  const handleApprove = (retreatId: string) => {
    updateRetreatStatus(retreatId, 'published')
  }

  const handleReject = (retreatId: string) => {
    updateRetreatStatus(retreatId, 'draft')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listing Moderation Center"
        description="Inspect submitted yoga retreat curricula, safety guidelines, and imagery before approving them for marketplace discovery."
        badge={
          <Badge variant="gold" size="sm">
            {retreats.length} Sanctuaries Catalogued
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 text-xs">
        {(['all', 'pending_review', 'published', 'draft'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              statusFilter === tab
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            {tab.replace('_', ' ')}
            {tab === 'pending_review' && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                {retreats.filter((r) => r.status === 'pending_review').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Moderation Table */}
      <Card className="overflow-hidden border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Retreat Sanctuary</th>
                <th className="py-3 px-4">Organizer School</th>
                <th className="py-3 px-4">Pricing</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRetreats.map((ret) => (
                <tr key={ret.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={ret.heroImage}
                        alt={ret.title}
                        className="h-12 w-16 rounded-lg object-cover shrink-0 border border-border"
                      />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground text-xs block">
                          {ret.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          {ret.location.city}, {ret.location.country} &bull; {ret.durationDays}D
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-foreground block">
                      {ret.organizerName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID: {ret.organizerId}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-foreground">
                      ${ret.startingPrice.toLocaleString()} {ret.currency}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant={
                        ret.status === 'published'
                          ? 'success'
                          : ret.status === 'pending_review'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {ret.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/retreats/${ret.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>

                      {ret.status !== 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleApprove(ret.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}

                      {ret.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-rose-700 hover:bg-rose-50"
                          onClick={() => handleReject(ret.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Unlist
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
