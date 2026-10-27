import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  MessageSquareText,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  Users,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatINR } from '@/utils/pricing'
import { computeOrganizerAnalytics, type AnalyticsTimeRange } from '@/utils/analytics'

export function OrganizerOverviewPage() {
  const {
    organizers,
    activeOrganizerId,
    retreats,
    packages,
    bookings,
    inquiries,
    offers,
  } = useDemoStore()

  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('all')

  const currentOrg =
    organizers.find((o) => o.id === activeOrganizerId) || organizers[0]

  const metrics = useMemo(() => {
    return computeOrganizerAnalytics(
      currentOrg.id,
      bookings,
      retreats,
      packages,
      inquiries,
      offers,
      timeRange
    )
  }, [currentOrg.id, bookings, retreats, packages, inquiries, offers, timeRange])

  const orgBookings = bookings.filter((b) => b.organizerId === currentOrg.id)
  const orgInquiries = inquiries.filter((inq) => inq.organizerId === currentOrg.id)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Welcome, ${currentOrg.name}`}
        description="Monitor school listings, guest reservations, and student inquiries across all your retreat immersions."
        badge={
          <Badge variant="success" size="sm">
            {currentOrg.verificationStatus.toUpperCase()} SCHOOL
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Timeframe filter */}
            <div className="flex items-center bg-card border border-border rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  timeRange === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeRange('last_30_days')}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  timeRange === 'last_30_days'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeRange('next_90_days')}
                className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                  timeRange === 'next_90_days'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Next 90 Days
              </button>
            </div>

            <Link to="/organizer/listings/new">
              <Button size="sm" variant="default" className="gap-1.5 font-medium">
                <PlusCircle className="h-3.5 w-3.5" />
                New Listing
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="sm" variant="outline" className="gap-1.5">
                Marketplace View
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Booking Value */}
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Booking Value
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(metrics.totalBookingValue)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>{metrics.activeBookingsCount} active confirmed stays</span>
          </div>
        </Card>

        {/* Deposit Cash Collected vs Venue Balances */}
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Deposits Collected
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(metrics.depositCashCollected)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Venue Balances Due: <strong className="text-foreground">{formatINR(metrics.venueBalanceReceivable)}</strong>
          </div>
        </Card>

        {/* Overall Occupancy & Capacity */}
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Occupancy Rate
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {metrics.overallOccupancyRate}%
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">
              ({metrics.totalBookedSpots} / {metrics.totalCapacitySpots} spots)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Across {metrics.listingPerformance.length} retreat cohorts
          </div>
        </Card>

        {/* Inquiry to Booking Conversion */}
        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Inquiry Conversion
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <MessageSquareText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {metrics.conversionRate}%
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Conversion</span>
          </div>
          <div className="mt-2 text-[11px] text-accent font-medium">
            {metrics.offersAccepted} accepted / {metrics.totalInquiries} inquiries
          </div>
        </Card>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Revenue & Deposit Trends Chart */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Revenue & Booking Cash Trends
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Gross booking value vs. advance deposits collected (INR)
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.trendsData}>
                  <defs>
                    <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1b4332" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1b4332" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="depositGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b08968" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#b08968" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="grossVolume"
                    name="Gross Booking Value"
                    stroke="#1b4332"
                    fillOpacity={1}
                    fill="url(#grossGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    name="Deposit Cash Collected"
                    stroke="#b08968"
                    fillOpacity={1}
                    fill="url(#depositGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Occupancy & Capacity Chart */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Occupancy vs. Capacity by Retreat
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Attendee spots filled against maximum sanctuary capacity
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.listingPerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="title"
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => (val.length > 14 ? val.slice(0, 14) + '...' : val)}
                  />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name: any) => [val, name]}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="capacity" name="Total Capacity Spots" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bookedSpots" name="Reserved Spots" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listing Performance Table */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Retreat Listing Performance
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Revenue contribution, occupancy health, and guest satisfaction across active immersions
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider border-b border-border/60">
                <tr>
                  <th className="p-3">Sanctuary Listing</th>
                  <th className="p-3">Gross Revenue</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3">Occupancy</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {metrics.listingPerformance.map((lp) => (
                  <tr key={lp.retreatId} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-medium text-foreground">
                      <div className="font-semibold text-xs">{lp.title}</div>
                      <span className="text-[10px] text-muted-foreground">ID: {lp.retreatId}</span>
                    </td>
                    <td className="p-3 font-bold text-foreground">
                      {formatINR(lp.grossRevenue)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground text-[11px] font-medium">
                        {lp.bookingsCount} stays
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${Math.min(100, lp.occupancyRate)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold">{lp.occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{lp.rating}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Link to={`/retreats/${lp.retreatId}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                          View <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Grid: Recent Bookings & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Guest Bookings
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Confirmed spots for upcoming retreats
              </p>
            </div>
            <Link to="/organizer/bookings">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {orgBookings.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No bookings recorded yet.
              </p>
            ) : (
              orgBookings.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-lg border border-border/60 bg-secondary/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {b.guestName}
                      </span>
                      <Badge variant="forest" size="sm">
                        {b.bookingStatus}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {b.packageName} &bull; {b.startDate}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-foreground">
                      {formatINR(b.totalAmount)}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-medium">
                      Deposit: {formatINR(b.depositPaidAmount || 0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Inquiries preview */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Student Enquiry Inbox
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Questions from prospective attendees
              </p>
            </div>
            <Link to="/organizer/inquiries">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Open inbox <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {orgInquiries.slice(0, 4).map((inq) => (
              <Link
                key={inq.id}
                to="/organizer/inquiries"
                className="block p-3.5 rounded-lg border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    {inq.guestName}
                  </span>
                  <Badge
                    variant={inq.status === 'open' ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {inq.status.toUpperCase()}
                  </Badge>
                </div>
                <h5 className="font-medium text-foreground text-[11px]">
                  {inq.subject}
                </h5>
                <p className="text-muted-foreground text-[11px] line-clamp-1">
                  {inq.lastMessageSnippet}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
