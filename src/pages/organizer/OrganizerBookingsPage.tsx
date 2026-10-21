import { useState } from 'react'
import {
  Search,
  Check,
  X,
  Mail,
  User,
  Clock,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { BookingStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function OrganizerBookingsPage() {
  const { bookings, activeOrganizerId, updateBookingStatus } = useDemoStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all')

  const orgBookings = bookings.filter((b) => b.organizerId === activeOrganizerId)

  const filteredBookings = orgBookings.filter((b) => {
    if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      return (
        b.guestName.toLowerCase().includes(q) ||
        b.bookingReference.toLowerCase().includes(q) ||
        b.retreatTitle.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleUpdateStatus = (bookingId: string, newStatus: BookingStatus) => {
    updateBookingStatus(bookingId, newStatus)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Booking Management"
        description="Review incoming student enrollments, manage check-in statuses, and access dietary notes."
        badge={
          <Badge variant="gold" size="sm">
            {orgBookings.length} Total Bookings
          </Badge>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by guest, reference or retreat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-secondary/30 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto justify-end">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="overflow-hidden border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref & Guest</th>
                <th className="py-3 px-4">Retreat & Package</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No bookings found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-semibold text-accent">
                          {booking.bookingReference}
                        </span>
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <User className="h-3 w-3 text-primary" />
                          <span>{booking.guestName}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" />
                          {booking.guestEmail}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        <span className="font-medium text-foreground block truncate">
                          {booking.retreatTitle}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          {booking.packageName} ({booking.guestsCount} guest)
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary shrink-0" />
                        <span>{booking.startDate} &rarr; {booking.endDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-foreground">
                        ${booking.totalAmount.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-medium">
                        {booking.paymentStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          booking.bookingStatus === 'confirmed'
                            ? 'success'
                            : booking.bookingStatus === 'completed'
                            ? 'neutral'
                            : 'destructive'
                        }
                        size="sm"
                      >
                        {booking.bookingStatus.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {booking.bookingStatus === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        {booking.bookingStatus !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-rose-700 hover:bg-rose-50"
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
