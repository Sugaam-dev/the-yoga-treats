import { useState, useMemo } from 'react'
import {
  Search,
  Check,
  X,
  Mail,
  User,
  Clock,
  Download,
  Printer,
  Calendar,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  LogIn,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { Booking, BookingStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatINR } from '@/utils/pricing'
import { calculateCancellationQuote } from '@/utils/cancellation'

const ROSTER_GENERATED_DATE = new Date().toLocaleDateString()

export function OrganizerBookingsPage() {
  const {
    bookings,
    activeOrganizerId,
    transitionBookingStatus,
    cancelBookingWithRefund,
  } = useDemoStore()

  // State
  const [activeTab, setActiveTab] = useState<'table' | 'roster'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all')
  const [selectedCohortDate, setSelectedCohortDate] = useState<string>('all')

  // Modals state
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  const orgBookings = useMemo(
    () => bookings.filter((b) => b.organizerId === activeOrganizerId),
    [bookings, activeOrganizerId]
  )

  // Unique cohort date ranges for filtering roster
  const cohortDates = useMemo(() => {
    const dates = new Set<string>()
    orgBookings.forEach((b) => {
      dates.add(`${b.startDate} to ${b.endDate}`)
    })
    return Array.from(dates)
  }, [orgBookings])

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return orgBookings.filter((b) => {
      if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false
      if (selectedCohortDate !== 'all') {
        const cohortKey = `${b.startDate} to ${b.endDate}`
        if (cohortKey !== selectedCohortDate) return false
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        return (
          b.guestName.toLowerCase().includes(q) ||
          b.bookingReference.toLowerCase().includes(q) ||
          b.retreatTitle.toLowerCase().includes(q) ||
          (b.guestEmail && b.guestEmail.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [orgBookings, statusFilter, selectedCohortDate, searchTerm])

  // Handlers for lifecycle transitions
  const handleTransition = (bookingId: string, targetStatus: BookingStatus, note?: string) => {
    setIsSubmittingAction(true)
    const result = transitionBookingStatus(bookingId, targetStatus, note)
    setIsSubmittingAction(false)
    if (result.success && inspectBooking?.id === bookingId) {
      // Refresh inspect modal if open
      const refreshed = useDemoStore.getState().bookings.find((b) => b.id === bookingId)
      if (refreshed) setInspectBooking(refreshed)
    }
  }

  // Handle cancellation with refund
  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancellingBooking || !cancellationReason.trim()) return

    setIsSubmittingAction(true)
    const result = cancelBookingWithRefund(cancellingBooking.id, cancellationReason.trim())
    setIsSubmittingAction(false)

    if (result.success) {
      setCancellingBooking(null)
      setCancellationReason('')
      if (inspectBooking?.id === cancellingBooking.id) {
        setInspectBooking(null)
      }
    }
  }

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Booking Reference',
      'Guest Name',
      'Guest Email',
      'Guest Phone',
      'Retreat Title',
      'Package Name',
      'Check-in Date',
      'Check-out Date',
      'Guests Count',
      'Deposit Paid (INR)',
      'Remaining Balance (INR)',
      'Status',
      'Special Requests & Dietary',
    ]

    const rows = filteredBookings.map((b) => [
      `"${b.bookingReference}"`,
      `"${b.guestName}"`,
      `"${b.guestEmail || ''}"`,
      `"${b.guestPhone || ''}"`,
      `"${b.retreatTitle}"`,
      `"${b.packageName}"`,
      `"${b.startDate}"`,
      `"${b.endDate}"`,
      b.guestsCount,
      b.depositPaidAmount || Math.round(b.totalAmount * 0.25),
      b.remainingBalance || 0,
      `"${b.bookingStatus.toUpperCase()}"`,
      `"${(b.specialRequests || 'None').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `cohort-roster-${activeOrganizerId}-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Roster Handler
  const handlePrintRoster = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Student Reservations & Cohort Rosters"
        description="Verify enrollments, manage check-in lifecycles, and access student medical/dietary requirements."
        badge={
          <Badge variant="gold" size="sm">
            {orgBookings.length} Total Bookings
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintRoster}
              className="gap-1.5 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Roster
            </Button>
          </div>
        }
      />

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3 gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'table'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            Bookings Ledger ({orgBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'roster'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Cohort Roster ({orgBookings.filter((b) => b.bookingStatus !== 'cancelled').length} Active)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student, ref, or retreat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border print:hidden">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-0.5">
          {(['all', 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors text-xs whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-secondary/60'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Cohort Date Selector */}
        {cohortDates.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Cohort Dates:
            </span>
            <select
              value={selectedCohortDate}
              onChange={(e) => setSelectedCohortDate(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Cohort Dates ({cohortDates.length})</option>
              {cohortDates.map((dateStr) => (
                <option key={dateStr} value={dateStr}>
                  {dateStr}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* View 1: Bookings Table with Lifecycle Actions */}
      {activeTab === 'table' && (
        <Card className="overflow-hidden border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref & Student</th>
                  <th className="py-3 px-4">Retreat & Accommodation</th>
                  <th className="py-3 px-4">Immersion Dates</th>
                  <th className="py-3 px-4">Financials</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No reservations matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                      onClick={() => setInspectBooking(booking)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-accent">
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
                          {booking.selectedAddons && booking.selectedAddons.length > 0 && (
                            <span className="inline-block text-[10px] text-primary/90 font-medium">
                              +{booking.selectedAddons.length} add-on(s)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary shrink-0" />
                          <span>
                            {booking.startDate} &rarr; {booking.endDate}
                          </span>
                        </div>
                        <span className="text-[10px] block pl-4">
                          {booking.nightsCount || 6} nights
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-foreground">
                          {formatINR(booking.totalAmount)}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-medium">
                          Deposit Paid: {formatINR(booking.depositPaidAmount || Math.round(booking.totalAmount * 0.25))}
                        </span>
                        {booking.remainingBalance !== undefined && booking.remainingBalance > 0 && (
                          <span className="block text-[10px] text-amber-800">
                            Due at check-in: {formatINR(booking.remainingBalance)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            booking.bookingStatus === 'confirmed'
                              ? 'success'
                              : booking.bookingStatus === 'checked_in'
                              ? 'forest'
                              : booking.bookingStatus === 'completed'
                              ? 'neutral'
                              : booking.bookingStatus === 'pending'
                              ? 'warning'
                              : 'destructive'
                          }
                          size="sm"
                        >
                          {booking.bookingStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>

                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Pending: Accept or Reject */}
                          {booking.bookingStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                                disabled={isSubmittingAction}
                                onClick={() => handleTransition(booking.id, 'confirmed', 'Organizer accepted pending booking')}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs text-rose-700 hover:bg-rose-50"
                                disabled={isSubmittingAction}
                                onClick={() => handleTransition(booking.id, 'rejected', 'Sanctuary capacity reached')}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}

                          {/* 2. Confirmed: Check In or Cancel */}
                          {booking.bookingStatus === 'confirmed' && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={isSubmittingAction}
                                onClick={() => handleTransition(booking.id, 'checked_in', 'Guest arrived and checked in')}
                              >
                                <LogIn className="h-3 w-3 mr-1" />
                                Check In
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-rose-700 hover:bg-rose-50"
                                onClick={() => setCancellingBooking(booking)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}

                          {/* 3. Checked In: Complete Stay */}
                          {booking.bookingStatus === 'checked_in' && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                              disabled={isSubmittingAction}
                              onClick={() => handleTransition(booking.id, 'completed', 'Immersion successfully finished')}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          )}

                          {/* Details Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setInspectBooking(booking)}
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* View 2: Cohort Roster (Print-ready & Student Dietary Focus) */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="hidden print:block mb-6 text-center border-b pb-4">
            <h1 className="font-serif text-2xl font-bold">The Yoga Treats — Student Cohort Roster</h1>
            <p className="text-xs text-muted-foreground">
              Official Sanctuary Manifest &bull; Generated {ROSTER_GENERATED_DATE}
            </p>
          </div>

          <Card className="overflow-hidden border-border/80 p-0">
            <div className="p-4 bg-secondary/30 border-b border-border/80 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  Attendee Manifest & Wellness Requirements
                </h3>
                <p className="text-xs text-muted-foreground">
                  Includes dietary accommodations, accessibility notes, and room allocations.
                </p>
              </div>
              <Badge variant="gold" size="sm">
                {filteredBookings.length} Students Listed
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 text-muted-foreground border-b border-border/80 uppercase text-[10px] font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Accommodation & Dates</th>
                    <th className="py-3 px-4">Guests</th>
                    <th className="py-3 px-4">Dietary & Special Notes</th>
                    <th className="py-3 px-4">Check-in Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No attendees found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-secondary/20">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-foreground block">{b.guestName}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {b.bookingReference}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          <div>{b.guestEmail}</div>
                          <div className="text-[11px] font-mono">{b.guestPhone || 'No phone'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-foreground block">{b.packageName}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {b.startDate} &rarr; {b.endDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {b.guestsCount}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {b.specialRequests ? (
                            <span className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded block leading-tight">
                              {b.specialRequests}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">Standard Sattvic menu</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              b.bookingStatus === 'checked_in'
                                ? 'forest'
                                : b.bookingStatus === 'completed'
                                ? 'neutral'
                                : b.bookingStatus === 'confirmed'
                                ? 'success'
                                : 'destructive'
                            }
                            size="sm"
                          >
                            {b.bookingStatus.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Booking Details Modal / Inspection Drawer */}
      {inspectBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Booking #{inspectBooking.bookingReference}
                  </h3>
                  <Badge
                    variant={
                      inspectBooking.bookingStatus === 'confirmed'
                        ? 'success'
                        : inspectBooking.bookingStatus === 'checked_in'
                        ? 'forest'
                        : inspectBooking.bookingStatus === 'completed'
                        ? 'neutral'
                        : inspectBooking.bookingStatus === 'pending'
                        ? 'warning'
                        : 'destructive'
                    }
                    size="sm"
                  >
                    {inspectBooking.bookingStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reserved on {inspectBooking.createdAt} &bull; Transaction Ref: {inspectBooking.transactionReference || 'PAY-OFFLINE'}
                </p>
              </div>

              <button
                onClick={() => setInspectBooking(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Student & Retreat Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 space-y-1.5">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Student Details
                </span>
                <p className="font-bold text-foreground text-sm">{inspectBooking.guestName}</p>
                <p className="text-muted-foreground">{inspectBooking.guestEmail}</p>
                <p className="text-muted-foreground">{inspectBooking.guestPhone || '+91 98201 44820'}</p>
                <p className="text-[11px] font-medium text-primary">
                  Party size: {inspectBooking.guestsCount} guest(s)
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 space-y-1.5">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Immersion & Room
                </span>
                <p className="font-bold text-foreground text-sm">{inspectBooking.retreatTitle}</p>
                <p className="text-muted-foreground">{inspectBooking.packageName}</p>
                <p className="text-muted-foreground">
                  {inspectBooking.startDate} &rarr; {inspectBooking.endDate} ({inspectBooking.nightsCount || 6} nights)
                </p>
              </div>
            </div>

            {/* Add-ons & Special Requests */}
            <div className="space-y-3 text-xs">
              {inspectBooking.selectedAddons && inspectBooking.selectedAddons.length > 0 && (
                <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/80">
                  <span className="font-semibold text-foreground block mb-2">
                    Selected Wellness Add-ons:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {inspectBooking.selectedAddons.map((ad, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-card border text-[11px] font-medium">
                        &check; {ad.name} &bull; {formatINR(ad.totalPrice)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900">
                <span className="font-semibold block mb-1">
                  Dietary Preferences & Accessibility Notes:
                </span>
                <p className="italic text-[11px]">
                  &ldquo;{inspectBooking.specialRequests || 'No custom dietary notes specified. Standard organic menu applies.'}&rdquo;
                </p>
              </div>
            </div>

            {/* Itemized Financial Snapshot */}
            <div className="p-4 rounded-xl bg-secondary/40 border border-border/80 text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Reservation Value:</span>
                <span className="font-bold text-foreground">{formatINR(inspectBooking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Deposit Paid (25% Upfront):</span>
                <span className="font-bold">
                  {formatINR(inspectBooking.depositPaidAmount || Math.round(inspectBooking.totalAmount * 0.25))}
                </span>
              </div>
              <div className="flex justify-between text-amber-800 pt-1 border-t border-border/60">
                <span>Remaining Balance Payable at Check-in:</span>
                <span className="font-bold">
                  {formatINR(inspectBooking.remainingBalance || 0)}
                </span>
              </div>
            </div>

            {/* Lifecycle History / Audit Timeline */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-foreground block">
                Booking Audit Timeline:
              </span>
              <div className="space-y-2 border-l-2 border-primary/30 pl-4 py-1">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="font-bold text-foreground">Initiated & Deposit Received</span>
                  <p className="text-[11px] text-muted-foreground">{inspectBooking.createdAt}</p>
                </div>
                {inspectBooking.history?.map((h, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                    <span className="font-bold text-foreground capitalize">
                      {h.status.replace('_', ' ')}: {h.note || ''}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(h.timestamp).toLocaleString()} &bull; by {h.actorRole || 'system'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t gap-2">
              <div className="flex items-center gap-2">
                {inspectBooking.bookingStatus === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                      disabled={isSubmittingAction}
                      onClick={() => handleTransition(inspectBooking.id, 'confirmed', 'Organizer accepted booking')}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Accept Booking
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-700 hover:bg-rose-50"
                      disabled={isSubmittingAction}
                      onClick={() => handleTransition(inspectBooking.id, 'rejected', 'Sanctuary reached capacity')}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject Booking
                    </Button>
                  </>
                )}

                {inspectBooking.bookingStatus === 'confirmed' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSubmittingAction}
                      onClick={() => handleTransition(inspectBooking.id, 'checked_in', 'Checked in on-site')}
                    >
                      <LogIn className="h-3.5 w-3.5 mr-1" />
                      Check In Student
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-700 hover:bg-rose-50"
                      onClick={() => {
                        setCancellingBooking(inspectBooking)
                      }}
                    >
                      Cancel Reservation
                    </Button>
                  </>
                )}

                {inspectBooking.bookingStatus === 'checked_in' && (
                  <Button
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    disabled={isSubmittingAction}
                    onClick={() => handleTransition(inspectBooking.id, 'completed', 'Immersion concluded')}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Conclude Stay
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectBooking(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation & Refund Dialog for Organizer */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Cancel Reservation #{cancellingBooking.bookingReference}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Guest: {cancellingBooking.guestName} &bull; Check-in {cancellingBooking.startDate}
                </p>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Refund Policy Calculation Box */}
            {(() => {
              const quote = calculateCancellationQuote(cancellingBooking)
              return (
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span>Refund Calculation Quote</span>
                  </div>
                  <p className="text-muted-foreground">
                    Days until check-in: <strong>{quote.daysUntilArrival} days</strong>
                  </p>
                  <p className="text-muted-foreground">
                    Applicable policy: <strong>{quote.policyRule}</strong>
                  </p>
                  <div className="pt-2 border-t flex justify-between font-bold text-foreground">
                    <span>Eligible Refund to Guest:</span>
                    <span className="text-emerald-700">
                      {formatINR(quote.refundableAmount)} ({quote.refundPercentage}%)
                    </span>
                  </div>
                </div>
              )
            })()}

            <form onSubmit={handleConfirmCancellation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide reason for student record and administrative ledger..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCancellingBooking(null)}
                >
                  Keep Reservation
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-rose-700 hover:bg-rose-800 text-white"
                  disabled={!cancellationReason.trim() || isSubmittingAction}
                  isLoading={isSubmittingAction}
                >
                  Confirm & Cancel Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
