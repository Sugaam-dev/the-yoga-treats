import { Link } from 'react-router-dom'
import {
  Layers,
  Star,
  MessageSquareText,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  PlusCircle,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function OrganizerOverviewPage() {
  const { organizers, activeOrganizerId, retreats, bookings, inquiries } =
    useDemoStore()

  const currentOrg =
    organizers.find((o) => o.id === activeOrganizerId) || organizers[0]

  const orgRetreats = retreats.filter((r) => r.organizerId === currentOrg.id)
  const orgBookings = bookings.filter((b) => b.organizerId === currentOrg.id)
  const orgInquiries = inquiries.filter((inq) => inq.organizerId === currentOrg.id)

  const totalRevenue = orgBookings.reduce((sum, b) => sum + b.totalAmount, 0)

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
          <div className="flex items-center gap-2.5">
            <Link to="/organizer/listings">
              <Button size="sm" variant="default" className="gap-1.5 font-medium">
                <PlusCircle className="h-3.5 w-3.5" />
                New Listing Draft
              </Button>
            </Link>
            <Link to={`/retreats/${orgRetreats[0]?.id || 'ret-bali-01'}`}>
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
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">USD</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>{orgBookings.length} bookings confirmed</span>
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Listings
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {orgRetreats.length}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Published</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {orgRetreats.filter((r) => r.status === 'published').length} live on marketplace
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Student Inquiries
            </span>
            <div className="p-2 rounded-lg bg-accent/15 text-accent">
              <MessageSquareText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {orgInquiries.length}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">Threads</span>
          </div>
          <div className="mt-2 text-[11px] text-accent font-medium">
            {orgInquiries.filter((inq) => inq.unreadByOrganizer).length} requires response
          </div>
        </Card>

        <Card className="p-5 border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              School Reputation
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">
              {currentOrg.rating}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5">/ 5.0</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Based on {currentOrg.reviewCount} verified guest reviews
          </div>
        </Card>
      </div>

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
              orgBookings.map((b) => (
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
                      ${b.totalAmount.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-medium">
                      Paid
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
            {orgInquiries.map((inq) => (
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
