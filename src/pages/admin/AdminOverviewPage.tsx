import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare,
  UserCheck,
  Coins,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Star,
  Layers,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatINR } from '@/utils/pricing'
import { computeAdminAnalytics } from '@/utils/analytics'

export function AdminOverviewPage() {
  const { retreats, organizers, bookings, payments, payouts, refunds, reviews } = useDemoStore()

  const metrics = useMemo(() => {
    return computeAdminAnalytics(
      bookings,
      payments,
      payouts,
      refunds,
      retreats,
      organizers
    )
  }, [bookings, payments, payouts, refunds, retreats, organizers])

  const pendingRetreats = retreats.filter((r) => r.status === 'pending_review')
  const pendingOrganizers = organizers.filter((o) => o.verificationStatus === 'pending')
  const pendingReviews = reviews.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Operations & Marketplace Health"
        description="Monitor marketplace integrity, curate listing submissions, verify yoga school credentials, and supervise payout pipelines."
        badge={
          <Badge variant="gold" size="sm">
            Staff Level &bull; Production Demo
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/admin/listings">
              <Button size="sm" variant="default" className="gap-1.5 font-medium">
                <CheckSquare className="h-3.5 w-3.5" />
                Moderation Queue ({pendingRetreats.length + pendingReviews.length})
              </Button>
            </Link>
            <Link to="/admin/finance">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Coins className="h-3.5 w-3.5" />
                Financial Ledger
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Booking Value */}
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
              {formatINR(metrics.grossBookingValue)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Platform Take: <strong className="text-foreground">{formatINR(metrics.grossPlatformCommission)}</strong> (10% fee)
          </div>
        </Card>

        {/* Deposits Collected vs Venue Balances */}
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Platform Cash (Deposits)
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(metrics.depositsCollected)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Venue Balances Due: <span className="font-medium text-foreground">{formatINR(metrics.venuePaidBalances)}</span>
          </div>
        </Card>

        {/* Refunds & Net Retained */}
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Refunds & Reversals
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(metrics.totalRefundsValue)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Net Retained Rev: <strong className="text-foreground">{formatINR(metrics.netRetainedPlatformRevenue)}</strong>
          </div>
        </Card>

        {/* Moderation Pending Workload */}
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ops Action Items
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {pendingRetreats.length + pendingOrganizers.length + pendingReviews.length}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Pending</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            {pendingRetreats.length} listings &bull; {pendingOrganizers.length} schools &bull; {pendingReviews.length} reviews
          </div>
        </Card>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Marketplace Financial Capital Breakdown */}
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Marketplace Capital Distribution (INR)
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distinguishing platform escrow cash, venue-paid balances, fees, and reversals
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.financeBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" name="Volume" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>* Venue balances are collected directly on-site; excluded from platform escrow cash.</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Booking Lifecycle Funnel Chart */}
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Booking Lifecycle Funnel
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution of all reservations across verified lifecycle states
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.bookingStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [val, 'Bookings']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Bookings" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Active Stays: {metrics.funnel.confirmed + metrics.funnel.checked_in + metrics.funnel.completed}</span>
              <span>Rejections / Cancellations: {metrics.funnel.cancelled + metrics.funnel.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Hub: Listings, Organizers, and Reviews Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Pending Listings Moderation */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                Listings in Review ({pendingRetreats.length})
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Curriculum & venue safety checks</p>
            </div>
            <Link to="/admin/listings">
              <Button variant="ghost" size="sm" className="text-xs text-primary p-0 h-auto">
                All <ArrowRight className="h-3 w-3 inline" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {pendingRetreats.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                All retreat listings are reviewed.
              </p>
            ) : (
              pendingRetreats.slice(0, 3).map((ret) => (
                <div
                  key={ret.id}
                  className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-semibold truncate block">{ret.title}</span>
                    <span className="text-[10px] text-muted-foreground">{ret.organizerName}</span>
                  </div>
                  <Link to="/admin/listings">
                    <Button size="sm" variant="outline" className="text-[11px] h-6 px-2">
                      Inspect
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 2. School Verification Queue */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-primary" />
                School Accreditation ({pendingOrganizers.length})
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">RYS credentials and host KYC</p>
            </div>
            <Link to="/admin/organizers">
              <Button variant="ghost" size="sm" className="text-xs text-primary p-0 h-auto">
                All <ArrowRight className="h-3 w-3 inline" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {organizers.slice(0, 3).map((org) => (
              <div
                key={org.id}
                className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-semibold truncate block">{org.name}</span>
                  <span className="text-[10px] text-muted-foreground">{org.location}</span>
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
                  {org.verificationStatus}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Review Moderation Queue */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                Guest Reviews ({pendingReviews.length} pending)
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Reflections awaiting approval</p>
            </div>
            <Link to="/admin/listings">
              <Button variant="ghost" size="sm" className="text-xs text-primary p-0 h-auto">
                Review Tab <ArrowRight className="h-3 w-3 inline" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {pendingReviews.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                All guest reflections are moderated.
              </p>
            ) : (
              pendingReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{rev.guestName}</span>
                    <Badge variant="warning" size="sm">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                    "{rev.comment}"
                  </p>
                  <div className="flex justify-end pt-1">
                    <Link to="/admin/listings">
                      <Button size="sm" variant="default" className="text-[11px] h-6 px-2">
                        Moderate
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
