import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  FileDown,
  CheckCircle,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export function GuestBookingsPage() {
  const { guest, bookings, addToast } = useDemoStore()
  const guestBookings = bookings.filter((b) => b.guestId === guest.id)

  const handleDownloadInvoice = (reference: string) => {
    addToast({
      title: 'Booking Confirmation Downloaded',
      description: `Receipt PDF for ${reference} generated for offline travel preparation.`,
      type: 'info',
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with guest profile snapshot */}
      <PageHeader
        title="My Mindful Bookings"
        description="Review your upcoming retreat reservations, package details, and pre-arrival instructions."
        badge={
          <Badge variant="gold" size="sm">
            {guestBookings.length} Active Bookings
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <Link to="/explore">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Explore More Sanctuaries
              </Button>
            </Link>
          </div>
        }
      />

      {/* Guest profile card */}
      <Card className="p-5 border-border/80 bg-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={guest.avatarUrl}
            alt={guest.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-primary/20"
          />
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {guest.name}
            </h3>
            <p className="text-xs text-muted-foreground">{guest.email} &bull; {guest.country}</p>
            <div className="flex gap-2 flex-wrap pt-1.5">
              <Badge variant="secondary" size="sm">
                Level: {guest.yogaExperienceLevel}
              </Badge>
              {guest.dietaryPreferences.map((pref, i) => (
                <Badge key={i} variant="forest" size="sm">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Bookings listing */}
      {guestBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No retreat bookings found"
          description="You haven't reserved any retreats yet. Browse our curated collection to start your mindful journey."
          action={
            <Link to="/explore">
              <Button>Discover Retreats</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {guestBookings.map((booking) => (
            <Card
              key={booking.id}
              className="overflow-hidden border-border/80 flex flex-col md:flex-row gap-0"
            >
              <div className="md:w-64 h-48 md:h-auto relative bg-secondary shrink-0">
                <img
                  src={booking.retreatImage}
                  alt={booking.retreatTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="forest" size="sm">
                    {booking.bookingStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-accent tracking-wider">
                      Reference: {booking.bookingReference}
                    </span>
                    <Badge variant="success" size="sm" className="w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid in Full (${booking.totalAmount.toLocaleString()} {booking.currency})
                    </Badge>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {booking.retreatTitle}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {booking.retreatLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {booking.startDate} &rarr; {booking.endDate}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs">
                    <span className="font-semibold text-foreground">
                      Package: {booking.packageName}
                    </span>
                    <p className="text-muted-foreground mt-0.5">
                      Host: {booking.organizerName} &bull; {booking.guestsCount} Guest(s)
                    </p>
                    {booking.specialRequests && (
                      <p className="text-muted-foreground mt-1 italic">
                        &ldquo;{booking.specialRequests}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Link to={`/retreats/${booking.retreatId}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        View Retreat
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Link to="/organizer/inquiries">
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Host Chat
                      </Button>
                    </Link>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadInvoice(booking.bookingReference)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
