import { Link } from 'react-router-dom'
import {
  CheckSquare,
  UserCheck,
  Coins,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function AdminOverviewPage() {
  const { retreats, organizers, bookings, payouts } = useDemoStore()

  const pendingRetreats = retreats.filter((r) => r.status === 'pending_review')
  const pendingOrganizers = organizers.filter((o) => o.verificationStatus === 'pending')
  const totalGMV = bookings.reduce((sum, b) => sum + b.totalAmount, 0)
  const platformTake = Math.round(totalGMV * 0.1) // 10% platform take rate

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Operations Overview"
        description="Monitor marketplace integrity, curate listing submissions, verify yoga school credentials, and supervise payout pipelines."
        badge={
          <Badge variant="gold" size="sm">
            Staff Level &bull; Production Demo
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/listings">
              <Button size="sm" variant="default" className="gap-1.5 font-medium">
                <CheckSquare className="h-3.5 w-3.5" />
                Moderation Queue ({pendingRetreats.length})
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gross Marketplace Volume
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              ${totalGMV.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Platform Take: ~${platformTake.toLocaleString()} (10% fee)
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Listings in Review
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {pendingRetreats.length}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Pending</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            Requires safety & accreditation check
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              School Verifications
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {pendingOrganizers.length}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Queued</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {organizers.filter((o) => o.verificationStatus === 'verified').length} verified schools active
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scheduled Payouts
            </span>
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {payouts.length}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Batches</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            ${payouts.reduce((s, p) => s + p.netAmount, 0).toLocaleString()} net transfers
          </div>
        </Card>
      </div>

      {/* Two Column Ops Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Listings Moderation preview */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Pending Retreat Moderation
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Sanctuary submissions awaiting review
              </p>
            </div>
            <Link to="/admin/listings">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Moderation Hub <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRetreats.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                All retreats are approved and published.
              </p>
            ) : (
              pendingRetreats.map((ret) => (
                <div
                  key={ret.id}
                  className="p-3.5 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-semibold text-foreground truncate block">
                      {ret.title}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      School: {ret.organizerName} &bull; {ret.location.city}, {ret.location.country}
                    </p>
                  </div>
                  <Link to="/admin/listings">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Review
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Organizer Verification preview */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                School Verification Queue
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Organizers submitting RYS credentials & banking
              </p>
            </div>
            <Link to="/admin/organizers">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Verification Hub <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {organizers.map((org) => (
              <div
                key={org.id}
                className="p-3 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={org.logoUrl}
                    alt={org.name}
                    className="h-8 w-8 rounded-md object-cover border border-border"
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground truncate block">
                      {org.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {org.location}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    org.verificationStatus === 'verified'
                      ? 'success'
                      : org.verificationStatus === 'pending'
                      ? 'warning'
                      : 'destructive'
                  }
                  size="sm"
                >
                  {org.verificationStatus.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
