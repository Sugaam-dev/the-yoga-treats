import { useState, useMemo } from 'react'
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
  X,
  Tag,
  Calendar,
  CreditCard,
  Ban,
  Star,
  Send,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { Booking } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatINR, calculateNights } from '@/utils/pricing'
import { calculateCancellationQuote } from '@/utils/cancellation'
import { maskEmail, maskPhone } from '@/utils/masking'
import { cn } from '@/lib/utils'

const CURRENT_TIMESTAMP = Date.now()

function buildBookingReceiptText(
  booking: Booking,
  fallbackEmail?: string,
  fallbackPhone?: string
): string {
  const issuedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `=====================================================
THE YOGA TREATS - OFFICIAL BOOKING CONFIRMATION & RECEIPT
=====================================================
Booking Reference: ${booking.bookingReference}
Date Issued: ${issuedDate}
Status: ${booking.bookingStatus.toUpperCase()}

GUEST INFORMATION:
Name: ${booking.guestName}
Email: ${booking.guestEmail || fallbackEmail || ''}
Phone: ${booking.guestPhone || fallbackPhone || 'N/A'}
Number of Guests: ${booking.guestsCount}

RETREAT DETAILS:
Sanctuary: ${booking.retreatTitle}
Location: ${booking.retreatLocation}
Organizer: ${booking.organizerName}
Package Tier: ${booking.packageName}
Check-in Date: ${booking.startDate}
Check-out Date: ${booking.endDate}
Duration: ${booking.nightsCount ?? calculateNights(booking.startDate, booking.endDate)} Nights

FINANCIAL SUMMARY:
Total Booking Value: ${formatINR(booking.totalAmount)}
Deposit Paid Online: ${formatINR(booking.depositPaidAmount || Math.round(booking.totalAmount * 0.25))}
Remaining Balance: ${formatINR(booking.remainingBalance || 0)} (Payable at venue check-in)
Transaction Reference: ${booking.transactionReference || 'PAY-SIM-' + booking.bookingReference}

=====================================================
Thank you for booking with The Yoga Treats.
Preserve this confirmation for your arrival at the sanctuary.
=====================================================
`
}

export function GuestBookingsPage() {
  const {
    guest,
    bookings,
    offers,
    inquiries,
    messages,
    addToast,
    cancelBookingWithRefund,
    acceptCustomOffer,
    declineCustomOffer,
    submitReview,
    addInquiryMessage,
  } = useDemoStore()

  // State
  const [activeTab, setActiveTab] = useState<'bookings' | 'offers' | 'messages'>('bookings')
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [isSubmittingCancellation, setIsSubmittingCancellation] = useState(false)
  const [isProcessingOfferId, setIsProcessingOfferId] = useState<string | null>(null)

  // Review modal state
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewTeacherRating, setReviewTeacherRating] = useState<number>(5)
  const [reviewVenueRating, setReviewVenueRating] = useState<number>(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Guest inquiry messaging state
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>('')
  const [guestReplyText, setGuestReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  const guestBookings = useMemo(
    () => bookings.filter((b) => b.guestId === guest.id),
    [bookings, guest.id]
  )

  const guestOffers = useMemo(
    () =>
      offers.filter(
        (o) =>
          o.guestId === guest.id ||
          o.guestEmail?.toLowerCase() === guest.email.toLowerCase() ||
          guest.id === 'guest-01'
      ),
    [offers, guest]
  )

  const guestInquiries = useMemo(
    () =>
      inquiries.filter(
        (inq) => inq.guestId === guest.id || guest.id === 'guest-01'
      ),
    [inquiries, guest.id]
  )

  const activeInquiry =
    guestInquiries.find((i) => i.id === selectedInquiryId) || guestInquiries[0]

  const threadMessages = useMemo(
    () => (activeInquiry ? messages.filter((m) => m.inquiryId === activeInquiry.id) : []),
    [messages, activeInquiry]
  )

  const handleDownloadInvoice = (reference: string) => {
    const booking = guestBookings.find((b) => b.bookingReference === reference)
    if (!booking) return

    const receiptContent = buildBookingReceiptText(booking, guest.email, guest.phone)
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${booking.bookingReference}-receipt.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast({
      title: 'Booking Receipt Downloaded',
      description: `Receipt for ${reference} saved to your device.`,
      type: 'success',
    })
  }

  // Handle Cancellation submission
  const handleConfirmCancellation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancellingBooking || !cancellationReason.trim()) return

    setIsSubmittingCancellation(true)
    const result = cancelBookingWithRefund(cancellingBooking.id, cancellationReason.trim())
    setIsSubmittingCancellation(false)

    if (result.success) {
      setCancellingBooking(null)
      setCancellationReason('')
    }
  }

  // Handle Custom Offer Accept
  const handleAcceptOffer = (offerId: string) => {
    setIsProcessingOfferId(offerId)
    const result = acceptCustomOffer(offerId)
    setIsProcessingOfferId(null)

    if (result.success) {
      setActiveTab('bookings')
    }
  }

  // Handle Custom Offer Decline
  const handleDeclineOffer = (offerId: string) => {
    declineCustomOffer(offerId)
  }

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingBooking || !reviewTitle.trim() || !reviewComment.trim()) return

    setIsSubmittingReview(true)
    const res = submitReview({
      retreatId: reviewingBooking.retreatId,
      retreatTitle: reviewingBooking.retreatTitle,
      bookingId: reviewingBooking.id,
      rating: reviewRating,
      teacherRating: reviewTeacherRating,
      venueRating: reviewVenueRating,
      title: reviewTitle.trim(),
      comment: reviewComment.trim(),
    })
    setIsSubmittingReview(false)

    if (res.success) {
      setReviewingBooking(null)
      setReviewTitle('')
      setReviewComment('')
      setReviewRating(5)
    }
  }

  // Handle Guest Reply to Host
  const handleSendGuestReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInquiry || !guestReplyText.trim()) return

    setIsSendingReply(true)
    addInquiryMessage(activeInquiry.id, guestReplyText.trim(), 'guest')
    setGuestReplyText('')
    setIsSendingReply(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with guest profile snapshot */}
      <PageHeader
        title="My Mindful Bookings & Proposals"
        description="Review your upcoming retreat reservations, manage cancellation protections, and inspect tailored host offers."
        badge={
          <Badge variant="gold" size="sm">
            {guestBookings.length} Reservations &bull; {guestOffers.filter((o) => o.status === 'pending').length} Pending Offers
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <Link to="/explore">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Explore More Sanctuaries
              </Button>
            </Link>
          </div>
        }
      />

      {/* Guest Profile Summary Card */}
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
            <p className="text-xs text-muted-foreground">
              {guest.email} &bull; {guest.phone || '+91 98201 44820'}
            </p>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-card rounded-xl border border-border w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setActiveTab('bookings')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === 'bookings'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            Bookings ({guestBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === 'offers'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Tag className="h-3.5 w-3.5" />
            Proposals ({guestOffers.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
              activeTab === 'messages'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Inbox ({guestInquiries.length})
          </button>
        </div>
      </Card>

      {/* Tab 1: Mindful Bookings */}
      {activeTab === 'bookings' && (
        <>
          {guestBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No retreat reservations yet"
              description="Discover serene yoga sanctuaries and book your first transformative immersion with flexible deposit protection."
              action={
                <Link to="/explore">
                  <Button size="sm">Browse Retreats</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-6">
              {guestBookings.map((booking) => {
                const isCancelled = booking.bookingStatus === 'cancelled'
                const isCompleted = booking.bookingStatus === 'completed'
                const canCancel =
                  booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'pending'

                return (
                  <Card
                    key={booking.id}
                    className={cn(
                      'overflow-hidden border-border/80 flex flex-col md:flex-row transition-all',
                      isCancelled && 'opacity-75 bg-muted/30 border-dashed'
                    )}
                  >
                    {/* Thumbnail Image */}
                    <div className="md:w-72 relative aspect-16/10 md:aspect-auto shrink-0 bg-secondary">
                      <img
                        src={booking.retreatImage}
                        alt={booking.retreatTitle}
                        className={cn(
                          'w-full h-full object-cover min-h-[200px]',
                          isCancelled && 'grayscale-50'
                        )}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={
                            booking.bookingStatus === 'confirmed'
                              ? 'forest'
                              : booking.bookingStatus === 'checked_in'
                              ? 'gold'
                              : booking.bookingStatus === 'completed'
                              ? 'success'
                              : booking.bookingStatus === 'cancelled'
                              ? 'destructive'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {booking.bookingStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-accent tracking-wider font-mono">
                            Ref: {booking.bookingReference}
                          </span>
                          <Badge
                            variant={
                              booking.paymentStatus === 'paid'
                                ? 'success'
                                : booking.paymentStatus === 'refunded'
                                ? 'destructive'
                                : booking.paymentStatus === 'partially_refunded'
                                ? 'warning'
                                : 'gold'
                            }
                            size="sm"
                            className="w-fit"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {booking.paymentStatus === 'paid'
                              ? `Paid in Full (${formatINR(booking.totalAmount)})`
                              : booking.paymentStatus === 'refunded'
                              ? `Deposit Fully Refunded (${formatINR(booking.refundAmount || 0)})`
                              : booking.paymentStatus === 'partially_refunded'
                              ? `Partially Refunded (${formatINR(booking.refundAmount || 0)})`
                              : `Deposit Paid (${formatINR(
                                  booking.depositPaidAmount || Math.round(booking.totalAmount * 0.25)
                                )})`}
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
                            {booking.startDate} &rarr; {booking.endDate} (
                            {booking.nightsCount ?? calculateNights(booking.startDate, booking.endDate)} nights)
                          </span>
                        </div>

                        {/* Cancellation Notice if Cancelled */}
                        {isCancelled && (
                          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Ban className="h-3.5 w-3.5 text-rose-600" />
                              <span>Reservation Cancelled</span>
                            </div>
                            <p className="text-[11px]">
                              Reason: &ldquo;{booking.cancellationReason || 'Requested by guest'}&rdquo;
                            </p>
                            {booking.refundAmount !== undefined && booking.refundAmount > 0 ? (
                              <p className="text-[11px] font-semibold text-emerald-800">
                                Refund of {formatINR(booking.refundAmount)} processed (Ref: {booking.refundReference}).
                              </p>
                            ) : (
                              <p className="text-[11px] text-muted-foreground">
                                Non-refundable deposit per 14-day cancellation policy.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Booking Details Card */}
                        <div className="mt-3 p-3.5 rounded-lg bg-secondary/50 border border-border/60 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">
                              Package: {booking.packageName}
                            </span>
                            <span className="text-muted-foreground">
                              {booking.guestsCount} Guest(s)
                            </span>
                          </div>

                          {booking.selectedAddons && booking.selectedAddons.length > 0 && (
                            <div className="pt-1.5 border-t border-border/50">
                              <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                                Included Add-ons:
                              </span>
                              <div className="flex gap-2 flex-wrap">
                                {booking.selectedAddons.map((ad, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-secondary px-2 py-0.5 rounded text-[11px] text-foreground"
                                  >
                                    &check; {ad.name} ({formatINR(ad.totalPrice)})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">
                              Total Value: <strong>{formatINR(booking.totalAmount)}</strong>
                            </span>
                            {!isCancelled &&
                              booking.remainingBalance !== undefined &&
                              booking.remainingBalance > 0 && (
                                <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                                  Remaining Due at Venue: {formatINR(booking.remainingBalance)}
                                </span>
                              )}
                          </div>

                          {booking.specialRequests && (
                            <p className="text-muted-foreground italic pt-1 border-t border-border/40 text-[11px]">
                              &ldquo;{booking.specialRequests}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Link to={`/retreats/${booking.retreatId}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                              View Sanctuary
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                          <button
                            onClick={() => setActiveTab('messages')}
                            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Messages
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <Button
                              variant="gold"
                              size="sm"
                              className="text-xs gap-1"
                              onClick={() => setReviewingBooking(booking)}
                            >
                              <Star className="h-3.5 w-3.5" />
                              Write a Review
                            </Button>
                          )}

                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                              onClick={() => setCancellingBooking(booking)}
                            >
                              Cancel Reservation
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(booking.bookingReference)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            <FileDown className="h-3.5 w-3.5 mr-1" />
                            Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Custom Host Proposals */}
      {activeTab === 'offers' && (
        <>
          {guestOffers.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No bespoke host proposals yet"
              description="When you send inquiries to retreat organizers, hosts can design personalized accommodation rates and custom date packages for you."
              action={
                <Link to="/explore">
                  <Button size="sm">Browse Retreats</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-6">
              {guestOffers.map((offer) => {
                const isPending = offer.status === 'pending'
                const isExpired =
                  new Date(offer.expiresAt).getTime() < CURRENT_TIMESTAMP || offer.status === 'expired'

                return (
                  <Card
                    key={offer.id}
                    className={cn(
                      'overflow-hidden border-border/80 flex flex-col md:flex-row shadow-sm',
                      !isPending && 'opacity-80'
                    )}
                  >
                    <div className="md:w-72 relative aspect-16/10 md:aspect-auto shrink-0 bg-secondary">
                      <img
                        src={offer.retreatImage}
                        alt={offer.retreatTitle}
                        className="w-full h-full object-cover min-h-[220px]"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={
                            offer.status === 'accepted'
                              ? 'success'
                              : offer.status === 'declined'
                              ? 'destructive'
                              : isExpired
                              ? 'neutral'
                              : 'gold'
                          }
                          size="sm"
                        >
                          {isExpired && isPending ? 'EXPIRED' : offer.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-accent">
                            Proposal #{offer.offerReference}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Offered by: <strong>{offer.organizerName}</strong>
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-semibold text-foreground">
                          {offer.retreatTitle}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {offer.startDate} &rarr; {offer.endDate} ({offer.nightsCount} nights)
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            {offer.packageName}
                          </span>
                        </div>

                        {offer.message && (
                          <div className="mt-3 p-3 rounded-lg bg-secondary/40 border border-border/60 text-xs italic text-foreground/80">
                            &ldquo;{offer.message}&rdquo;
                          </div>
                        )}

                        <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-semibold">
                            <span>Total Booking Value:</span>
                            <span className="text-base text-foreground font-bold">
                              {formatINR(offer.pricing.totalAmount)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-700 font-medium">
                            <span>Advance Deposit to Confirm (25%):</span>
                            <span>{formatINR(offer.pricing.depositAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                            <span>Remaining Balance (Due at Venue):</span>
                            <span>{formatINR(offer.pricing.remainingBalance)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-[11px] text-muted-foreground">
                          {isPending && !isExpired
                            ? `Valid until ${offer.expiresAt.split('T')[0]}`
                            : `Offer ${offer.status}`}
                        </span>

                        {isPending && !isExpired && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeclineOffer(offer.id)}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="gold"
                              size="sm"
                              className="text-xs gap-1.5 font-semibold"
                              isLoading={isProcessingOfferId === offer.id}
                              onClick={() => handleAcceptOffer(offer.id)}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Accept & Confirm Deposit
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 3: Messages & Inquiries Inbox */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Masking Privacy Banner */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3 text-xs text-foreground/90">
            <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Confidential Guest Communication:</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Your direct contact info ({maskEmail(guest.email)} &bull; {maskPhone(guest.phone)}) is masked to protect your privacy prior to confirmed arrival.
              </p>
            </div>
          </div>

          {guestInquiries.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No school inquiries yet"
              description="Have questions regarding accommodation, dietary menus, or private shala sessions? Ask host schools directly from any retreat listing."
              action={
                <Link to="/explore">
                  <Button size="sm">Explore Sanctuaries</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inquiry Threads List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                  Conversations ({guestInquiries.length})
                </span>
                {guestInquiries.map((inq) => (
                  <button
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border transition-all text-xs space-y-1 block',
                      activeInquiry?.id === inq.id
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/80 bg-card hover:bg-secondary/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate">
                        {inq.organizerName}
                      </span>
                      <Badge variant="forest" size="sm">
                        {inq.status}
                      </Badge>
                    </div>
                    <div className="font-medium text-[11px] text-foreground truncate">
                      {inq.subject}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {inq.lastMessageSnippet}
                    </p>
                  </button>
                ))}
              </div>

              {/* Thread Messages Viewer & Reply */}
              <div className="md:col-span-2">
                {activeInquiry ? (
                  <Card className="border-border/80 flex flex-col h-[480px]">
                    {/* Thread Header */}
                    <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-foreground">
                          {activeInquiry.subject}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Host School: {activeInquiry.organizerName} &bull; {activeInquiry.retreatTitle}
                        </p>
                      </div>
                      <Badge variant="gold" size="sm">
                        {activeInquiry.inquiryNumber}
                      </Badge>
                    </div>

                    {/* Messages Body */}
                    <div className="p-4 flex-1 overflow-y-auto space-y-3">
                      {threadMessages.map((msg) => {
                        const isMe = msg.senderRole === 'guest'
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              'flex flex-col max-w-[85%] space-y-1 text-xs',
                              isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                            )}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <span>{msg.senderName}</span>
                              {msg.isAutoReply && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold">
                                  Auto-Reply
                                </span>
                              )}
                              <span>&bull;</span>
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div
                              className={cn(
                                'p-3 rounded-2xl leading-relaxed',
                                isMe
                                  ? 'bg-primary text-primary-foreground rounded-br-xs'
                                  : 'bg-secondary text-foreground border border-border/80 rounded-bl-xs'
                              )}
                            >
                              {msg.content}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Reply Input Form */}
                    <form
                      onSubmit={handleSendGuestReply}
                      className="p-3 border-t border-border bg-secondary/20 flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Type your response to the host..."
                        value={guestReplyText}
                        onChange={(e) => setGuestReplyText(e.target.value)}
                        className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        isLoading={isSendingReply}
                        disabled={!guestReplyText.trim()}
                        className="gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </Button>
                    </form>
                  </Card>
                ) : (
                  <Card className="p-12 text-center text-xs text-muted-foreground border-border/80">
                    Select an inquiry conversation from the list to view message history.
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guest Cancellation Dialog */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-rose-700">
                <Ban className="h-5 w-5" />
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Cancel Reservation
                </h3>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Live cancellation policy quote */}
            {(() => {
              const quote = calculateCancellationQuote(cancellingBooking)
              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {cancellingBooking.retreatTitle}
                      </span>
                      <span className="text-muted-foreground">
                        Arrival: {cancellingBooking.startDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/60">
                      <span className="text-muted-foreground">Days to Arrival:</span>
                      <span className="font-bold text-foreground">{quote.daysUntilArrival} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Applicable Policy Tier:</span>
                      <Badge variant={quote.refundPercentage === 100 ? 'success' : quote.refundPercentage === 50 ? 'warning' : 'destructive'}>
                        {quote.policyRule}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60 font-semibold">
                      <span>Calculated Refund:</span>
                      <span className="text-sm font-bold text-emerald-700">
                        {formatINR(quote.refundableAmount)}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleConfirmCancellation} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Reason for Cancellation <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Please share why you need to cancel (e.g. Schedule change, travel conflict)..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="w-full text-xs p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
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
                        variant="destructive"
                        size="sm"
                        isLoading={isSubmittingCancellation}
                        disabled={!cancellationReason.trim()}
                      >
                        Confirm Cancellation
                      </Button>
                    </div>
                  </form>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Share Your Reflection
                  </h3>
                  <p className="text-xs text-muted-foreground">{reviewingBooking.retreatTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewingBooking(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Selectors */}
              <div className="space-y-3 p-3.5 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Overall Sanctuary Experience:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewRating(num)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            'h-5 w-5',
                            num <= reviewRating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-muted-foreground/40'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Teacher & Instruction Quality:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewTeacherRating(num)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            'h-4 w-4',
                            num <= reviewTeacherRating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-muted-foreground/40'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Venue, Accommodations & Meals:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setReviewVenueRating(num)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            'h-4 w-4',
                            num <= reviewVenueRating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-muted-foreground/40'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Comment */}
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Reflection Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deeply restorative Mysore practice amidst the palms"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Your Experience Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details regarding the teachers, daily rhythm, accommodations, and culinary offerings..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="p-3 rounded-lg bg-sand-100 dark:bg-sand-900/30 text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  All reviews are submitted to staff moderation prior to affecting public listing scores.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewingBooking(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  isLoading={isSubmittingReview}
                  disabled={!reviewTitle.trim() || !reviewComment.trim()}
                >
                  Submit Review for Moderation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
