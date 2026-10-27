import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Booking,
  BookingAddon,
  BookingDraft,
  BookingStatus,
  CustomOffer,
  DemoRole,
  Guest,
  Inquiry,
  Message,
  Organizer,
  Package,
  Payment,
  Payout,
  Refund,
  Retreat,
  RetreatStatus,
  Review,
  VerificationStatus,
  DemoNotification,
} from '@/types'
import {
  AVAILABLE_BOOKING_ADDONS,
  INITIAL_BOOKINGS,
  INITIAL_GUEST,
  INITIAL_INQUIRIES,
  INITIAL_MESSAGES,
  INITIAL_OFFERS,
  INITIAL_ORGANIZERS,
  INITIAL_PACKAGES,
  INITIAL_PAYMENTS,
  INITIAL_PAYOUTS,
  INITIAL_REFUNDS,
  INITIAL_RETREATS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
} from '@/data/seedData'
import { validateBookingTransition } from '@/utils/lifecycle'
import { calculateCancellationQuote } from '@/utils/cancellation'
import { formatINR } from '@/utils/pricing'

export interface ToastItem {
  id: string
  title: string
  description?: string
  type?: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

interface DemoState {
  // Active demo perspective
  demoRole: DemoRole
  activeOrganizerId: string

  // Domain data
  retreats: Retreat[]
  packages: Package[]
  organizers: Organizer[]
  guest: Guest
  bookings: Booking[]
  inquiries: Inquiry[]
  messages: Message[]
  reviews: Review[]
  payments: Payment[]
  payouts: Payout[]
  refunds: Refund[]
  offers: CustomOffer[]
  availableAddons: BookingAddon[]
  notifications: DemoNotification[]

  // In-progress drafts
  bookingDraft: BookingDraft | null
  retreatListingDraft: Partial<Retreat> | null

  // Toast system
  toasts: ToastItem[]

  // Actions
  setDemoRole: (role: DemoRole) => void
  setActiveOrganizerId: (id: string) => void
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  resetDemoData: () => void

  // Notification Actions
  addNotification: (notification: Omit<DemoNotification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (role?: DemoRole) => void

  // Booking Flow Actions
  setBookingDraft: (draft: Partial<BookingDraft> | null) => void
  clearBookingDraft: () => void
  createBooking: (payload: { booking: Booking; payment: Payment }) => { success: boolean; error?: string }

  // Phase 2B: Lifecycle transitions & Cancellations
  transitionBookingStatus: (
    bookingId: string,
    targetStatus: BookingStatus,
    note?: string
  ) => { success: boolean; error?: string }
  cancelBookingWithRefund: (
    bookingId: string,
    reason: string,
    asOfDateStr?: string
  ) => { success: boolean; refund?: Refund; error?: string }

  // Phase 2B: Custom Offers
  createCustomOffer: (
    offerInput: Omit<CustomOffer, 'id' | 'offerReference' | 'createdAt' | 'status'>
  ) => { success: boolean; offer: CustomOffer }
  acceptCustomOffer: (offerId: string) => { success: boolean; booking?: Booking; error?: string }
  declineCustomOffer: (offerId: string) => { success: boolean; error?: string }

  // Phase 2B: Listing Builder
  saveRetreatListingDraft: (draft: Partial<Retreat> | null) => void
  clearRetreatListingDraft: () => void
  publishRetreatListing: (
    retreat: Retreat,
    packages: Package[]
  ) => { success: boolean; error?: string }
  updateRetreat: (retreat: Retreat) => void

  // Reviews and Moderation
  submitReview: (reviewData: {
    retreatId: string
    retreatTitle: string
    bookingId?: string
    rating: number
    teacherRating?: number
    venueRating?: number
    title: string
    comment: string
  }) => { success: boolean; error?: string; review?: Review }
  moderateReview: (
    reviewId: string,
    status: 'approved' | 'rejected',
    moderationNote?: string
  ) => { success: boolean; error?: string }

  // Moderation / mutations for interactive demo
  updateRetreatStatus: (retreatId: string, status: RetreatStatus) => void
  updateOrganizerVerification: (organizerId: string, status: VerificationStatus) => void
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void
  processPayoutsBatch: () => { success: boolean; count: number }
  addInquiryMessage: (inquiryId: string, content: string, senderRole?: DemoRole) => void
  createInquiry: (params: {
    retreatId?: string
    subject: string
    message: string
  }) => { success: boolean; inquiryId: string }
  markInquiryRead: (inquiryId: string, role: DemoRole) => void
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      demoRole: 'guest',
      activeOrganizerId: 'org-bali-prana',

      retreats: INITIAL_RETREATS,
      packages: INITIAL_PACKAGES,
      organizers: INITIAL_ORGANIZERS,
      guest: INITIAL_GUEST,
      bookings: INITIAL_BOOKINGS,
      inquiries: INITIAL_INQUIRIES,
      messages: INITIAL_MESSAGES,
      reviews: INITIAL_REVIEWS,
      payments: INITIAL_PAYMENTS,
      payouts: INITIAL_PAYOUTS,
      refunds: INITIAL_REFUNDS,
      offers: INITIAL_OFFERS,
      availableAddons: AVAILABLE_BOOKING_ADDONS,
      notifications: INITIAL_NOTIFICATIONS,

      bookingDraft: null,
      retreatListingDraft: null,
      toasts: [],

      setDemoRole: (role) => {
        set({ demoRole: role })
        const label = role === 'guest' ? 'Guest Traveler' : role === 'organizer' ? 'School Organizer' : 'Team Admin'
        get().addToast({
          title: `Role Switched: ${label}`,
          description: `You are now browsing from the perspective of a ${label.toLowerCase()}.`,
          type: 'info',
        })
      },

      setActiveOrganizerId: (id) => set({ activeOrganizerId: id }),

      addToast: (toast) => {
        const id = 'toast-' + Math.random().toString(36).substring(2, 9)
        const newToast: ToastItem = { ...toast, id }
        set((state) => ({ toasts: [...state.toasts, newToast] }))

        const duration = toast.duration ?? 4500
        setTimeout(() => {
          get().removeToast(id)
        }, duration)
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      },

      addNotification: (notif) => {
        const id = 'notif-' + Math.random().toString(36).substring(2, 9)
        const newNotif: DemoNotification = {
          ...notif,
          id,
          timestamp: new Date().toISOString(),
          read: false,
        }
        set((state) => ({ notifications: [newNotif, ...state.notifications] }))
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }))
      },

      markAllNotificationsRead: (role) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            !role || n.recipientRole === role ? { ...n, read: true } : n
          ),
        }))
      },

      setBookingDraft: (incoming) => {
        if (incoming === null) {
          set({ bookingDraft: null })
          return
        }
        set((state) => {
          const current = state.bookingDraft || {
            retreatId: '',
            packageId: '',
            startDate: '',
            endDate: '',
            guestsCount: 1,
            selectedAddonIds: [],
            guestName: state.guest.name,
            guestEmail: state.guest.email,
            guestPhone: state.guest.phone || '',
            specialRequests: '',
            agreedToTerms: false,
            currentStep: 1,
          }
          return { bookingDraft: { ...current, ...incoming } }
        })
      },

      clearBookingDraft: () => set({ bookingDraft: null }),

      createBooking: ({ booking, payment }) => {
        const state = get()

        // 1. Duplicate check: prevent creating same booking reference twice
        const existing = state.bookings.find(
          (b) => b.bookingReference === booking.bookingReference || b.id === booking.id
        )
        if (existing) {
          return { success: false, error: 'A reservation with this booking reference has already been confirmed.' }
        }

        // 2. Decrement spots in target package
        const updatedPackages = state.packages.map((pkg) => {
          if (pkg.id === booking.packageId) {
            const nextSpots = Math.max(0, pkg.remainingSpots - booking.guestsCount)
            return {
              ...pkg,
              remainingSpots: nextSpots,
              dateRanges: pkg.dateRanges.map((dr) => {
                if (dr.startDate === booking.startDate && dr.endDate === booking.endDate) {
                  return { ...dr, availableSpots: Math.max(0, dr.availableSpots - booking.guestsCount) }
                }
                return dr
              }),
            }
          }
          return pkg
        })

        // 3. Update organizer booking counts
        const updatedOrganizers = state.organizers.map((org) => {
          if (org.id === booking.organizerId) {
            return { ...org, totalBookingsCount: org.totalBookingsCount + 1 }
          }
          return org
        })

        // 4. Update store state
        set({
          bookings: [booking, ...state.bookings],
          payments: [payment, ...state.payments],
          packages: updatedPackages,
          organizers: updatedOrganizers,
          bookingDraft: null,
        })

        get().addNotification({
          recipientRole: 'organizer',
          title: 'New Reservation Secured',
          message: `${booking.guestName} booked ${booking.packageName} for "${booking.retreatTitle}".`,
          type: 'booking_confirmed',
          link: '/organizer/bookings',
          actorName: booking.guestName,
        })

        get().addNotification({
          recipientRole: 'guest',
          title: 'Booking Confirmed!',
          message: `Reservation #${booking.bookingReference} for "${booking.retreatTitle}" confirmed with deposit.`,
          type: 'booking_confirmed',
          link: '/account/bookings',
          actorName: booking.retreatTitle,
        })

        get().addToast({
          title: 'Deposit Confirmed & Reservation Booked!',
          description: `Booking #${booking.bookingReference} is secured. Your confirmation itinerary is ready.`,
          type: 'success',
        })

        return { success: true }
      },

      transitionBookingStatus: (bookingId, targetStatus, note) => {
        const state = get()
        const targetBooking = state.bookings.find((b) => b.id === bookingId)
        if (!targetBooking) {
          return { success: false, error: 'Booking record not found.' }
        }

        const validation = validateBookingTransition(targetBooking.bookingStatus, targetStatus)
        if (!validation.valid) {
          get().addToast({
            title: 'Action Not Permitted',
            description: validation.error || 'Transition not allowed.',
            type: 'error',
          })
          return { success: false, error: validation.error }
        }

        const nowIso = new Date().toISOString()
        const historyEntry = {
          status: targetStatus,
          timestamp: nowIso,
          note: note || `Status changed to ${targetStatus}`,
          actorRole: state.demoRole,
        }

        const updatedBookings = state.bookings.map((b) => {
          if (b.id === bookingId) {
            return {
              ...b,
              bookingStatus: targetStatus,
              history: [...(b.history || []), historyEntry],
              checkedInAt: targetStatus === 'checked_in' ? nowIso : b.checkedInAt,
              completedAt: targetStatus === 'completed' ? nowIso : b.completedAt,
              rejectedAt: targetStatus === 'rejected' ? nowIso : b.rejectedAt,
            }
          }
          return b
        })

        // If rejected, restore package spots
        let updatedPackages = state.packages
        if (targetStatus === 'rejected') {
          updatedPackages = state.packages.map((pkg) => {
            if (pkg.id === targetBooking.packageId) {
              return {
                ...pkg,
                remainingSpots: pkg.remainingSpots + targetBooking.guestsCount,
                dateRanges: pkg.dateRanges.map((dr) => {
                  if (dr.startDate === targetBooking.startDate && dr.endDate === targetBooking.endDate) {
                    return { ...dr, availableSpots: dr.availableSpots + targetBooking.guestsCount }
                  }
                  return dr
                }),
              }
            }
            return pkg
          })
        }

        set({
          bookings: updatedBookings,
          packages: updatedPackages,
        })

        const label =
          targetStatus === 'confirmed'
            ? 'Accepted'
            : targetStatus === 'checked_in'
            ? 'Checked In'
            : targetStatus === 'completed'
            ? 'Completed'
            : targetStatus === 'rejected'
            ? 'Rejected'
            : targetStatus.toUpperCase()

        get().addToast({
          title: `Booking #${targetBooking.bookingReference} ${label}`,
          description: `Reservation status transitioned to ${targetStatus}.`,
          type: targetStatus === 'rejected' ? 'warning' : 'success',
        })

        return { success: true }
      },

      cancelBookingWithRefund: (bookingId, reason, asOfDateStr) => {
        const state = get()
        const targetBooking = state.bookings.find((b) => b.id === bookingId)
        if (!targetBooking) {
          return { success: false, error: 'Booking record not found.' }
        }

        const quote = calculateCancellationQuote(targetBooking, asOfDateStr)
        if (!quote.canCancel) {
          get().addToast({
            title: 'Cancellation Not Allowed',
            description: quote.rejectionReason || 'This booking cannot be cancelled.',
            type: 'error',
          })
          return { success: false, error: quote.rejectionReason }
        }

        const nowIso = new Date().toISOString()
        const refundRef = 'REF-' + Math.floor(10000 + Math.random() * 90000)
        let newRefund: Refund | undefined

        if (quote.refundableAmount > 0) {
          newRefund = {
            id: 'ref-' + Math.random().toString(36).substring(2, 9),
            refundReference: refundRef,
            bookingId: targetBooking.id,
            bookingReference: targetBooking.bookingReference,
            paymentId: targetBooking.transactionReference || 'PAY-ONLINE',
            guestId: targetBooking.guestId,
            guestName: targetBooking.guestName,
            retreatTitle: targetBooking.retreatTitle,
            organizerId: targetBooking.organizerId,
            amount: quote.refundableAmount,
            currency: targetBooking.currency,
            reason,
            policyApplied: quote.policyRule,
            percentage: quote.refundPercentage,
            status: 'completed',
            processedAt: nowIso,
          }
        }

        // Update payment status
        const nextPaymentStatus =
          quote.refundPercentage === 100
            ? 'refunded'
            : quote.refundPercentage > 0
            ? 'partially_refunded'
            : targetBooking.paymentStatus

        const updatedPayments = state.payments.map((p) => {
          if (p.bookingId === targetBooking.id || p.bookingReference === targetBooking.bookingReference) {
            return {
              ...p,
              status: quote.refundPercentage === 100 ? ('refunded' as const) : p.status,
            }
          }
          return p
        })

        const historyEntry = {
          status: 'cancelled' as const,
          timestamp: nowIso,
          note: `Cancelled by ${state.demoRole}. Reason: "${reason}". Refund: ${formatINR(
            quote.refundableAmount
          )} (${quote.policyRule})`,
          actorRole: state.demoRole,
        }

        const updatedBookings = state.bookings.map((b) => {
          if (b.id === bookingId) {
            return {
              ...b,
              bookingStatus: 'cancelled' as const,
              paymentStatus: nextPaymentStatus,
              cancellationReason: reason,
              cancelledAt: nowIso,
              refundAmount: quote.refundableAmount,
              refundReference: newRefund ? newRefund.refundReference : undefined,
              history: [...(b.history || []), historyEntry],
            }
          }
          return b
        })

        // Restore package remaining spots
        const updatedPackages = state.packages.map((pkg) => {
          if (pkg.id === targetBooking.packageId) {
            return {
              ...pkg,
              remainingSpots: pkg.remainingSpots + targetBooking.guestsCount,
              dateRanges: pkg.dateRanges.map((dr) => {
                if (dr.startDate === targetBooking.startDate && dr.endDate === targetBooking.endDate) {
                  return { ...dr, availableSpots: dr.availableSpots + targetBooking.guestsCount }
                }
                return dr
              }),
            }
          }
          return pkg
        })

        set({
          bookings: updatedBookings,
          payments: updatedPayments,
          packages: updatedPackages,
          refunds: newRefund ? [newRefund, ...state.refunds] : state.refunds,
        })

        get().addNotification({
          recipientRole: 'organizer',
          title: 'Booking Cancelled',
          message: `Booking #${targetBooking.bookingReference} was cancelled. Reason: "${reason}".`,
          type: 'booking_cancelled',
          link: '/organizer/bookings',
          actorName: targetBooking.guestName,
        })

        get().addNotification({
          recipientRole: 'guest',
          title: 'Cancellation & Refund Processed',
          message: `Booking #${targetBooking.bookingReference} cancelled. ${
            quote.refundableAmount > 0
              ? `Refund of ${formatINR(quote.refundableAmount)} scheduled.`
              : 'Zero deposit refund per policy.'
          }`,
          type: 'booking_cancelled',
          link: '/account/bookings',
          actorName: 'The Yoga Treats',
        })

        get().addToast({
          title: 'Booking Cancelled',
          description: `Booking #${targetBooking.bookingReference} has been cancelled. ${
            quote.refundableAmount > 0
              ? `Refund of ${formatINR(quote.refundableAmount)} recorded (${quote.policyRule}).`
              : 'Deposit is non-refundable according to policy.'
          }`,
          type: quote.refundableAmount > 0 ? 'info' : 'warning',
        })

        return { success: true, refund: newRefund }
      },

      createCustomOffer: (offerInput) => {
        const offerRef = 'OFF-' + Math.floor(1000 + Math.random() * 9000)
        const newOffer: CustomOffer = {
          ...offerInput,
          id: 'off-' + Math.random().toString(36).substring(2, 9),
          offerReference: offerRef,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }

        const messageText = `🏷️ Custom Offer Sent: ${newOffer.packageName} (${newOffer.nightsCount} nights, ${
          newOffer.guestsCount
        } guest). Total: ${formatINR(newOffer.pricing.totalAmount)} (Deposit: ${formatINR(
          newOffer.pricing.depositAmount
        )}). Note: "${newOffer.message}"`

        set((state) => ({
          offers: [newOffer, ...state.offers],
          inquiries: state.inquiries.map((inq) =>
            inq.id === newOffer.inquiryId
              ? {
                  ...inq,
                  customOfferId: newOffer.id,
                  lastMessageSnippet: messageText.slice(0, 100),
                  status: 'replied',
                  updatedAt: new Date().toISOString(),
                }
              : inq
          ),
        }))

        get().addInquiryMessage(newOffer.inquiryId, messageText, 'organizer')

        get().addToast({
          title: 'Custom Offer Dispatched',
          description: `Offer #${offerRef} sent to ${newOffer.guestName}.`,
          type: 'success',
        })

        return { success: true, offer: newOffer }
      },

      acceptCustomOffer: (offerId) => {
        const state = get()
        const offer = state.offers.find((o) => o.id === offerId)
        if (!offer) {
          return { success: false, error: 'Custom offer not found.' }
        }

        if (offer.status !== 'pending') {
          return {
            success: false,
            error: `This offer is already marked as ${offer.status}. Duplicate bookings cannot be generated.`,
          }
        }

        const now = Date.now()
        if (new Date(offer.expiresAt).getTime() < now) {
          set((s) => ({
            offers: s.offers.map((o) => (o.id === offerId ? { ...o, status: 'expired' as const } : o)),
          }))
          return { success: false, error: 'This custom offer has expired.' }
        }

        // Idempotency check: verify if booking already linked
        const existingBooking = state.bookings.find(
          (b) => b.id === offer.bookingId || (offer.bookingId && b.bookingReference === offer.bookingId)
        )
        if (existingBooking) {
          return { success: false, error: 'A booking has already been established from this offer.' }
        }

        const bookingRef = 'YTR-' + Math.floor(10000 + Math.random() * 90000)
        const txRef = 'PAY-SIM-' + Math.random().toString(36).substring(2, 8).toUpperCase()
        const nowIso = new Date().toISOString()

        const newBooking: Booking = {
          id: 'bk-' + Math.random().toString(36).substring(2, 9),
          bookingReference: bookingRef,
          retreatId: offer.retreatId,
          retreatTitle: offer.retreatTitle,
          retreatImage: offer.retreatImage,
          retreatLocation: offer.retreatLocation,
          packageId: offer.packageId,
          packageName: offer.packageName,
          accommodationType: offer.accommodationType,
          organizerId: offer.organizerId,
          organizerName: offer.organizerName,
          guestId: offer.guestId,
          guestName: offer.guestName,
          guestEmail: state.guest.email,
          guestPhone: state.guest.phone,
          startDate: offer.startDate,
          endDate: offer.endDate,
          nightsCount: offer.nightsCount,
          guestsCount: offer.guestsCount,
          totalAmount: offer.pricing.totalAmount,
          currency: offer.pricing.currency,
          paymentStatus: 'deposit_paid',
          bookingStatus: 'confirmed',
          createdAt: nowIso.split('T')[0],
          selectedAddons: offer.selectedAddons,
          pricing: offer.pricing,
          transactionReference: txRef,
          depositPaidAmount: offer.pricing.depositAmount,
          remainingBalance: offer.pricing.remainingBalance,
          history: [
            {
              status: 'confirmed',
              timestamp: nowIso,
              note: `Confirmed from accepted custom offer #${offer.offerReference}`,
              actorRole: 'guest',
            },
          ],
        }

        const newPayment: Payment = {
          id: 'pay-' + Math.random().toString(36).substring(2, 9),
          paymentReference: txRef,
          bookingId: newBooking.id,
          bookingReference: bookingRef,
          guestId: newBooking.guestId,
          guestName: newBooking.guestName,
          retreatTitle: newBooking.retreatTitle,
          amount: offer.pricing.depositAmount,
          currency: offer.pricing.currency,
          paymentMethod: 'credit_card',
          status: 'completed',
          processedAt: nowIso,
        }

        // Decrement package spots
        const updatedPackages = state.packages.map((pkg) => {
          if (pkg.id === offer.packageId) {
            return {
              ...pkg,
              remainingSpots: Math.max(0, pkg.remainingSpots - offer.guestsCount),
              dateRanges: pkg.dateRanges.map((dr) => {
                if (dr.startDate === offer.startDate && dr.endDate === offer.endDate) {
                  return { ...dr, availableSpots: Math.max(0, dr.availableSpots - offer.guestsCount) }
                }
                return dr
              }),
            }
          }
          return pkg
        })

        // Update offer status to accepted
        const updatedOffers = state.offers.map((o) =>
          o.id === offerId ? { ...o, status: 'accepted' as const, bookingId: newBooking.id } : o
        )

        set({
          bookings: [newBooking, ...state.bookings],
          payments: [newPayment, ...state.payments],
          packages: updatedPackages,
          offers: updatedOffers,
        })

        get().addInquiryMessage(
          offer.inquiryId,
          `🎉 Offer Accepted! Reservation #${bookingRef} confirmed with deposit of ${formatINR(
            offer.pricing.depositAmount
          )}.`,
          'guest'
        )

        get().addToast({
          title: 'Custom Offer Accepted & Booked!',
          description: `Reservation #${bookingRef} is confirmed. Deposit payment verified.`,
          type: 'success',
        })

        return { success: true, booking: newBooking }
      },

      declineCustomOffer: (offerId) => {
        const state = get()
        const offer = state.offers.find((o) => o.id === offerId)
        if (!offer) {
          return { success: false, error: 'Offer not found.' }
        }

        set((s) => ({
          offers: s.offers.map((o) => (o.id === offerId ? { ...o, status: 'declined' as const } : o)),
        }))

        get().addInquiryMessage(
          offer.inquiryId,
          `The customized offer #${offer.offerReference} was respectfully declined by the guest.`,
          'guest'
        )

        get().addToast({
          title: 'Offer Declined',
          description: `Offer #${offer.offerReference} has been declined.`,
          type: 'info',
        })

        return { success: true }
      },

      saveRetreatListingDraft: (draft) => {
        set({ retreatListingDraft: draft })
        if (draft) {
          get().addToast({
            title: 'Listing Draft Saved',
            description: 'Your listing progress has been stored in local storage.',
            type: 'info',
          })
        }
      },

      clearRetreatListingDraft: () => set({ retreatListingDraft: null }),

      publishRetreatListing: (retreatData, packagesData) => {
        const state = get()
        const existingRetreatIndex = state.retreats.findIndex((r) => r.id === retreatData.id)
        const targetStatus = retreatData.status || 'published'

        let updatedRetreats: Retreat[]
        if (existingRetreatIndex >= 0) {
          updatedRetreats = state.retreats.map((r) =>
            r.id === retreatData.id
              ? { ...retreatData, status: targetStatus, updatedAt: new Date().toISOString().split('T')[0] }
              : r
          )
        } else {
          updatedRetreats = [{ ...retreatData, status: targetStatus }, ...state.retreats]
        }

        // Merge packages
        const existingPkgIds = new Set(packagesData.map((p) => p.id))
        const cleanPackages = state.packages.filter(
          (p) => !existingPkgIds.has(p.id) && p.retreatId !== retreatData.id
        )
        const updatedPackages = [...packagesData, ...cleanPackages]

        set({
          retreats: updatedRetreats,
          packages: updatedPackages,
          retreatListingDraft: null,
        })

        const isDraft = targetStatus === 'draft'
        get().addToast({
          title: isDraft ? 'Listing Saved as Draft' : 'Retreat Published Successfully!',
          description: isDraft
            ? `"${retreatData.title}" saved to drafts. It will not appear in public search.`
            : `"${retreatData.title}" is now active in guest marketplace search.`,
          type: 'success',
        })

        return { success: true }
      },

      processPayoutsBatch: () => {
        const state = get()
        const pendingCount = state.payouts.filter((p) => p.status === 'pending').length
        if (pendingCount === 0) {
          get().addToast({
            title: 'No Pending Disbursements',
            description: 'All organizer settlements are currently up to date.',
            type: 'info',
          })
          return { success: true, count: 0 }
        }

        const todayStr = new Date().toISOString().split('T')[0]
        const updatedPayouts = state.payouts.map((p) =>
          p.status === 'pending'
            ? { ...p, status: 'paid' as const, processedDate: todayStr }
            : p
        )

        set({ payouts: updatedPayouts })

        get().addNotification({
          recipientRole: 'admin',
          title: 'Payout Batch Disbursed',
          message: `Successfully processed ${pendingCount} school settlement payouts.`,
          type: 'booking_confirmed',
          link: '/admin/finance',
        })

        get().addToast({
          title: 'Batch Payout Completed',
          description: `Disbursed ${pendingCount} pending school settlements via simulated clearing.`,
          type: 'success',
        })

        return { success: true, count: pendingCount }
      },

      updateRetreat: (retreatData) => {
        set((state) => ({
          retreats: state.retreats.map((r) => (r.id === retreatData.id ? retreatData : r)),
        }))
        get().addToast({
          title: 'Retreat Updated',
          description: `"${retreatData.title}" details updated.`,
          type: 'success',
        })
      },

      resetDemoData: () => {
        set({
          retreats: INITIAL_RETREATS,
          packages: INITIAL_PACKAGES,
          organizers: INITIAL_ORGANIZERS,
          guest: INITIAL_GUEST,
          bookings: INITIAL_BOOKINGS,
          inquiries: INITIAL_INQUIRIES,
          messages: INITIAL_MESSAGES,
          reviews: INITIAL_REVIEWS,
          payments: INITIAL_PAYMENTS,
          payouts: INITIAL_PAYOUTS,
          refunds: INITIAL_REFUNDS,
          offers: INITIAL_OFFERS,
          availableAddons: AVAILABLE_BOOKING_ADDONS,
          notifications: INITIAL_NOTIFICATIONS,
          bookingDraft: null,
          retreatListingDraft: null,
        })
        get().addToast({
          title: 'Demo Data Reset',
          description: 'All retreat listings, bookings, inquiries, and moderation statuses restored to factory seed state.',
          type: 'success',
        })
      },

      updateRetreatStatus: (retreatId, status) => {
        set((state) => ({
          retreats: state.retreats.map((r) =>
            r.id === retreatId ? { ...r, status, updatedAt: new Date().toISOString().split('T')[0] } : r
          ),
        }))
        get().addToast({
          title: 'Listing Status Updated',
          description: `Retreat ${retreatId} marked as ${status}.`,
          type: 'success',
        })
      },

      updateOrganizerVerification: (organizerId, status) => {
        set((state) => ({
          organizers: state.organizers.map((o) =>
            o.id === organizerId ? { ...o, verificationStatus: status } : o
          ),
        }))
        get().addToast({
          title: 'Verification Updated',
          description: `Organizer status changed to ${status}.`,
          type: 'info',
        })
      },

      updateBookingStatus: (bookingId, status) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, bookingStatus: status } : b
          ),
        }))
        get().addToast({
          title: 'Booking Status Updated',
          description: `Booking #${bookingId} is now ${status}.`,
          type: 'success',
        })
      },

      submitReview: (reviewData) => {
        const state = get()
        // Eligibility check: guest must have completed or attended this retreat
        const hasStayed = state.bookings.some(
          (b) =>
            b.retreatId === reviewData.retreatId &&
            b.guestId === state.guest.id &&
            (b.bookingStatus === 'completed' || b.bookingStatus === 'checked_in')
        )

        if (!hasStayed) {
          get().addToast({
            title: 'Review Ineligible',
            description: 'You may only submit verified reflections for retreats you have attended or completed.',
            type: 'error',
          })
          return {
            success: false,
            error: 'Only completed or attended retreat stays are eligible for guest reviews.',
          }
        }

        const newReview: Review = {
          id: 'rev-' + Math.random().toString(36).substring(2, 9),
          retreatId: reviewData.retreatId,
          retreatTitle: reviewData.retreatTitle,
          bookingId: reviewData.bookingId,
          guestId: state.guest.id,
          guestName: state.guest.name,
          guestAvatar: state.guest.avatarUrl,
          rating: Math.max(1, Math.min(5, Math.round(reviewData.rating))),
          teacherRating: reviewData.teacherRating,
          venueRating: reviewData.venueRating,
          title: reviewData.title,
          comment: reviewData.comment,
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
        }

        set({ reviews: [newReview, ...state.reviews] })

        get().addNotification({
          recipientRole: 'admin',
          title: 'New Guest Review Pending Moderation',
          message: `${state.guest.name} left a ${newReview.rating}-star review for "${newReview.retreatTitle}".`,
          type: 'review_submitted',
          link: '/admin/listings',
          actorName: state.guest.name,
        })

        get().addToast({
          title: 'Review Submitted for Moderation',
          description: 'Thank you for your mindful feedback! Your review is pending moderator approval.',
          type: 'success',
        })

        return { success: true, review: newReview }
      },

      moderateReview: (reviewId, status, moderationNote) => {
        const state = get()
        const targetReview = state.reviews.find((r) => r.id === reviewId)
        if (!targetReview) {
          return { success: false, error: 'Review record not found.' }
        }

        const nowIso = new Date().toISOString().split('T')[0]
        const nextStatus = status === 'approved' ? ('published' as const) : ('rejected' as const)

        const updatedReviews = state.reviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                status: nextStatus,
                moderationNote,
                moderatedAt: nowIso,
              }
            : r
        )

        // Only approved reviews increment reviewCount and adjust average rating
        let updatedRetreats = state.retreats
        if (status === 'approved') {
          updatedRetreats = state.retreats.map((ret) => {
            if (ret.id === targetReview.retreatId) {
              const prevCount = ret.reviewCount || 0
              const prevRating = ret.rating || 5.0
              const newCount = prevCount + 1
              const newAvg = Number(
                ((prevRating * prevCount + targetReview.rating) / newCount).toFixed(2)
              )
              return {
                ...ret,
                rating: newAvg,
                reviewCount: newCount,
              }
            }
            return ret
          })
        }

        set({
          reviews: updatedReviews,
          retreats: updatedRetreats,
        })

        get().addNotification({
          recipientRole: 'guest',
          title: status === 'approved' ? 'Review Published!' : 'Review Status Update',
          message:
            status === 'approved'
              ? `Your review for "${targetReview.retreatTitle}" has been approved and published.`
              : `Your review for "${targetReview.retreatTitle}" was not approved: ${
                  moderationNote || 'Community standards'
                }.`,
          type: 'review_moderated',
          link: `/retreats/${targetReview.retreatId}`,
          actorName: 'Platform Moderator',
        })

        get().addToast({
          title: status === 'approved' ? 'Review Approved' : 'Review Rejected',
          description:
            status === 'approved'
              ? `Review by ${targetReview.guestName} published. Sanctuary rating recalculated.`
              : `Review marked as rejected.`,
          type: status === 'approved' ? 'success' : 'info',
        })

        return { success: true }
      },

      addInquiryMessage: (inquiryId, content, senderRole = 'organizer') => {
        const msgId = 'msg-' + Date.now()
        const newMsg: Message = {
          id: msgId,
          inquiryId,
          senderId: senderRole === 'guest' ? 'guest-01' : 'org-bali-prana',
          senderRole,
          senderName: senderRole === 'guest' ? 'Maya Lin' : 'Prana Veda Sanctuary',
          content,
          createdAt: new Date().toISOString(),
          read: true,
        }

        set((state) => ({
          messages: [...state.messages, newMsg],
          inquiries: state.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  lastMessageSnippet: content.slice(0, 100),
                  messageCount: inq.messageCount + 1,
                  status: senderRole === 'organizer' ? 'replied' : 'open',
                  unreadByGuest: senderRole === 'organizer',
                  unreadByOrganizer: senderRole === 'guest',
                  updatedAt: new Date().toISOString(),
                }
              : inq
          ),
        }))

        get().addToast({
          title: 'Message Sent',
          description: 'Your reply has been added to the inquiry conversation.',
          type: 'success',
        })
      },

      createInquiry: ({ retreatId, subject, message }) => {
        const state = get()
        const inqId = 'inq-' + Math.floor(1000 + Math.random() * 9000)
        const inqNumber = 'INQ-' + Math.floor(1000 + Math.random() * 9000)
        const targetRetreat = retreatId ? state.retreats.find((r) => r.id === retreatId) : null
        const organizer = targetRetreat
          ? state.organizers.find((o) => o.id === targetRetreat.organizerId) || state.organizers[0]
          : state.organizers[0]

        const nowIso = new Date().toISOString()
        const newInquiry: Inquiry = {
          id: inqId,
          inquiryNumber: inqNumber,
          retreatId: targetRetreat?.id,
          retreatTitle: targetRetreat?.title || 'General Inquiries',
          guestId: state.guest.id,
          guestName: state.guest.name,
          guestEmail: state.guest.email,
          guestAvatar: state.guest.avatarUrl,
          organizerId: organizer.id,
          organizerName: organizer.name,
          subject,
          lastMessageSnippet: message.slice(0, 100),
          status: 'open',
          unreadByOrganizer: true,
          unreadByGuest: false,
          messageCount: 2,
          createdAt: nowIso,
          updatedAt: nowIso,
        }

        const guestMsg: Message = {
          id: 'msg-' + Date.now(),
          inquiryId: inqId,
          senderId: state.guest.id,
          senderRole: 'guest',
          senderName: state.guest.name,
          senderAvatar: state.guest.avatarUrl,
          content: message,
          createdAt: nowIso,
          read: true,
        }

        const autoReplyMsg: Message = {
          id: 'msg-' + (Date.now() + 1),
          inquiryId: inqId,
          senderId: organizer.id,
          senderRole: 'organizer',
          senderName: organizer.name,
          senderAvatar: organizer.logoUrl,
          content: `🙏 Namaste ${state.guest.name}! Thank you for your inquiry regarding "${subject}". Our retreat coordinator has received your message and will provide personalized guidance within 24 hours.`,
          createdAt: new Date(Date.now() + 500).toISOString(),
          read: false,
          isAutoReply: true,
        }

        set({
          inquiries: [newInquiry, ...state.inquiries],
          messages: [...state.messages, guestMsg, autoReplyMsg],
        })

        get().addNotification({
          recipientRole: 'organizer',
          title: 'New Student Enquiry',
          message: `${state.guest.name} sent an inquiry regarding "${subject}".`,
          type: 'inquiry',
          link: '/organizer/inquiries',
          actorName: state.guest.name,
        })

        get().addNotification({
          recipientRole: 'guest',
          title: 'Enquiry Received',
          message: `Simulated auto-acknowledgement received from ${organizer.name}.`,
          type: 'inquiry',
          link: '/account/bookings',
          actorName: organizer.name,
        })

        get().addToast({
          title: 'Inquiry Sent to Host',
          description: `Your question has been dispatched to ${organizer.name}. An automated greeting was posted.`,
          type: 'success',
        })

        return { success: true, inquiryId: inqId }
      },

      markInquiryRead: (inquiryId, role) => {
        set((state) => ({
          inquiries: state.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  unreadByGuest: role === 'guest' ? false : inq.unreadByGuest,
                  unreadByOrganizer: role === 'organizer' ? false : inq.unreadByOrganizer,
                }
              : inq
          ),
        }))
      },
    }),
    {
      name: 'the-yoga-treats-demo-v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage
        }
        const memoryStore: Record<string, string> = {}
        return {
          getItem: (key: string) => memoryStore[key] ?? null,
          setItem: (key: string, value: string) => {
            memoryStore[key] = value
          },
          removeItem: (key: string) => {
            delete memoryStore[key]
          },
          clear: () => {
            for (const key of Object.keys(memoryStore)) {
              delete memoryStore[key]
            }
          },
          key: (index: number) => Object.keys(memoryStore)[index] ?? null,
          length: Object.keys(memoryStore).length,
        }
      }),
      partialize: (state) => ({
        demoRole: state.demoRole,
        activeOrganizerId: state.activeOrganizerId,
        retreats: state.retreats,
        packages: state.packages,
        organizers: state.organizers,
        guest: state.guest,
        bookings: state.bookings,
        inquiries: state.inquiries,
        messages: state.messages,
        reviews: state.reviews,
        payments: state.payments,
        payouts: state.payouts,
        refunds: state.refunds,
        offers: state.offers,
        availableAddons: state.availableAddons,
        notifications: state.notifications,
        bookingDraft: state.bookingDraft,
        retreatListingDraft: state.retreatListingDraft,
      }),
    }
  )
)
