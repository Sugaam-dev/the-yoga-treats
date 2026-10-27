import { describe, it, expect, beforeEach } from 'vitest'
import { useDemoStore } from './useDemoStore'
import { INITIAL_BOOKINGS, INITIAL_OFFERS, INITIAL_REFUNDS, INITIAL_RETREATS } from '@/data/seedData'
import type { CustomOffer, Package, Retreat } from '@/types'

describe('useDemoStore - Phase 2B Operations, Offers & Refunds', () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemoData()
  })

  describe('Organizer Booking Lifecycle Transitions', () => {
    it('successfully accepts a pending booking (pending -> confirmed)', () => {
      const store = useDemoStore.getState()
      const pendingBooking = store.bookings.find((b) => b.bookingStatus === 'pending')
      expect(pendingBooking).toBeDefined()

      const result = store.transitionBookingStatus(
        pendingBooking!.id,
        'confirmed',
        'Teacher accepted enrollment'
      )
      expect(result.success).toBe(true)

      const updated = useDemoStore.getState().bookings.find((b) => b.id === pendingBooking!.id)
      expect(updated?.bookingStatus).toBe('confirmed')
      expect(updated?.history).toBeDefined()
      expect(updated?.history?.some((h) => h.status === 'confirmed')).toBe(true)
    })

    it('successfully checks in a confirmed booking and then marks it completed', () => {
      const store = useDemoStore.getState()
      const confirmedBooking = store.bookings.find((b) => b.bookingStatus === 'confirmed')
      expect(confirmedBooking).toBeDefined()

      // 1. Check in
      const checkInResult = store.transitionBookingStatus(
        confirmedBooking!.id,
        'checked_in',
        'Student arrived on campus'
      )
      expect(checkInResult.success).toBe(true)

      let updated = useDemoStore.getState().bookings.find((b) => b.id === confirmedBooking!.id)
      expect(updated?.bookingStatus).toBe('checked_in')
      expect(updated?.checkedInAt).toBeDefined()

      // 2. Complete stay
      const completeResult = useDemoStore
        .getState()
        .transitionBookingStatus(confirmedBooking!.id, 'completed', 'Immersion concluded')
      expect(completeResult.success).toBe(true)

      updated = useDemoStore.getState().bookings.find((b) => b.id === confirmedBooking!.id)
      expect(updated?.bookingStatus).toBe('completed')
      expect(updated?.completedAt).toBeDefined()
    })

    it('rejects forbidden transitions (e.g., checking in an already completed or cancelled booking)', () => {
      const store = useDemoStore.getState()
      const confirmedBooking = store.bookings.find((b) => b.bookingStatus === 'confirmed')!

      // Complete the booking lifecycle
      store.transitionBookingStatus(confirmedBooking.id, 'checked_in')
      store.transitionBookingStatus(confirmedBooking.id, 'completed')

      // Attempt forbidden transition: completed -> checked_in
      const invalidResult = useDemoStore
        .getState()
        .transitionBookingStatus(confirmedBooking.id, 'checked_in')
      expect(invalidResult.success).toBe(false)
      expect(invalidResult.error).toContain('already')
    })
  })

  describe('Cancellation and Refund Workflow', () => {
    it('cancels an eligible booking more than 30 days out with a 100% refund record', () => {
      const store = useDemoStore.getState()
      // Use bk-10822 which starts 2026-12-05 (>30 days from 2026-10-21)
      const booking = store.bookings.find((b) => b.id === 'bk-10822')!
      expect(booking.bookingStatus).toBe('confirmed')

      const initialRefundsCount = store.refunds.length
      const initialDeposit = booking.depositPaidAmount!

      const cancelResult = store.cancelBookingWithRefund(
        booking.id,
        'Scheduling conflict with work project',
        '2026-10-21'
      )

      expect(cancelResult.success).toBe(true)
      expect(cancelResult.refund).toBeDefined()
      expect(cancelResult.refund?.amount).toBe(initialDeposit)
      expect(cancelResult.refund?.percentage).toBe(100)

      const stateAfter = useDemoStore.getState()
      const updatedBooking = stateAfter.bookings.find((b) => b.id === booking.id)!
      expect(updatedBooking.bookingStatus).toBe('cancelled')
      expect(updatedBooking.paymentStatus).toBe('refunded')
      expect(updatedBooking.refundAmount).toBe(initialDeposit)
      expect(stateAfter.refunds.length).toBe(initialRefundsCount + 1)
    })

    it('cancels a booking between 15 and 30 days out with a 50% partial refund', () => {
      const store = useDemoStore.getState()
      // bk-10821 starts 2026-11-15 (25 days from 2026-10-21, so 50% refund)
      const booking = store.bookings.find((b) => b.id === 'bk-10821')!
      const initialDeposit = booking.depositPaidAmount!

      const cancelResult = store.cancelBookingWithRefund(
        booking.id,
        'Personal travel postponement',
        '2026-10-21'
      )

      expect(cancelResult.success).toBe(true)
      expect(cancelResult.refund).toBeDefined()
      expect(cancelResult.refund?.percentage).toBe(50)
      expect(cancelResult.refund?.amount).toBe(Math.round(initialDeposit * 0.5))

      const updatedBooking = useDemoStore.getState().bookings.find((b) => b.id === booking.id)!
      expect(updatedBooking.bookingStatus).toBe('cancelled')
      expect(updatedBooking.paymentStatus).toBe('partially_refunded')
    })

    it('forbids cancelling an already cancelled booking', () => {
      const store = useDemoStore.getState()
      const booking = store.bookings.find((b) => b.id === 'bk-10821')!

      store.cancelBookingWithRefund(booking.id, 'First cancellation', '2026-10-21')

      // Second cancellation attempt
      const secondResult = useDemoStore
        .getState()
        .cancelBookingWithRefund(booking.id, 'Second attempt', '2026-10-21')
      expect(secondResult.success).toBe(false)
      expect(secondResult.error).toContain('already been cancelled')
    })
  })

  describe('Inquiry-to-Booking Custom Offers', () => {
    it('creates a custom offer and appends it to offers and inquiry conversation', () => {
      const store = useDemoStore.getState()
      const initialOffersCount = store.offers.length

      const offerInput: Omit<CustomOffer, 'id' | 'offerReference' | 'createdAt' | 'status'> = {
        inquiryId: 'inq-901',
        organizerId: 'org-bali-prana',
        organizerName: 'Prana Veda Sanctuary',
        guestId: 'guest-01',
        guestName: 'Maya Lin',
        retreatId: 'ret-bali-01',
        retreatTitle: 'Oceanic Breath & Vedic Flow Sanctuary',
        retreatImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
        retreatLocation: 'Uluwatu, Bali',
        packageId: 'pkg-bali-villa',
        packageName: 'Private Ocean-Cliff Eco Villa',
        accommodationType: 'eco_villa',
        startDate: '2026-12-10',
        endDate: '2026-12-16',
        nightsCount: 6,
        guestsCount: 1,
        selectedAddons: [],
        pricing: {
          nightsCount: 6,
          guestsCount: 1,
          packagePricePerPerson: 180000,
          basePackageTotal: 180000,
          addonsTotal: 0,
          taxRate: 0.12,
          taxAmount: 21600,
          totalAmount: 201600,
          depositPercentage: 25,
          depositAmount: 50400,
          remainingBalance: 151200,
          currency: 'INR',
        },
        message: 'Special holiday rate with complimentary sunrise sound bath included.',
        expiresAt: '2026-11-01T23:59:59Z',
      }

      const result = store.createCustomOffer(offerInput)
      expect(result.success).toBe(true)
      expect(result.offer.offerReference).toMatch(/^OFF-\d+$/)

      const stateAfter = useDemoStore.getState()
      expect(stateAfter.offers.length).toBe(initialOffersCount + 1)
      expect(stateAfter.offers[0].status).toBe('pending')

      // Inquiry conversation has message
      const inquiryMessages = stateAfter.messages.filter((m) => m.inquiryId === 'inq-901')
      expect(inquiryMessages[inquiryMessages.length - 1].content).toContain('Custom Offer Sent')
    })

    it('allows guest to accept custom offer, creating exactly one confirmed booking and payment', () => {
      const store = useDemoStore.getState()
      // Use INITIAL_OFFERS[0] which is off-8801 for inq-902 / guest-03 Elena Rostova
      const offer = store.offers.find((o) => o.id === 'off-8801')!
      expect(offer.status).toBe('pending')

      const initialBookingsCount = store.bookings.length
      const initialPaymentsCount = store.payments.length

      const acceptResult = store.acceptCustomOffer(offer.id)
      expect(acceptResult.success).toBe(true)
      expect(acceptResult.booking).toBeDefined()
      expect(acceptResult.booking?.totalAmount).toBe(offer.pricing.totalAmount)

      const stateAfter = useDemoStore.getState()
      expect(stateAfter.bookings.length).toBe(initialBookingsCount + 1)
      expect(stateAfter.payments.length).toBe(initialPaymentsCount + 1)

      // Offer marked as accepted and linked
      const updatedOffer = stateAfter.offers.find((o) => o.id === offer.id)
      expect(updatedOffer?.status).toBe('accepted')
      expect(updatedOffer?.bookingId).toBe(acceptResult.booking?.id)

      // Repeated acceptance MUST be rejected
      const duplicateAccept = useDemoStore.getState().acceptCustomOffer(offer.id)
      expect(duplicateAccept.success).toBe(false)
      expect(duplicateAccept.error).toContain('already marked as accepted')
      expect(useDemoStore.getState().bookings.length).toBe(initialBookingsCount + 1)
    })

    it('rejects expired custom offers upon acceptance attempt', () => {
      const store = useDemoStore.getState()
      // Create an already-expired offer
      const expiredOffer = store.createCustomOffer({
        inquiryId: 'inq-901',
        organizerId: 'org-bali-prana',
        organizerName: 'Prana Veda Sanctuary',
        guestId: 'guest-01',
        guestName: 'Maya Lin',
        retreatId: 'ret-bali-01',
        retreatTitle: 'Oceanic Breath & Vedic Flow Sanctuary',
        retreatImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
        retreatLocation: 'Bali',
        packageId: 'pkg-bali-villa',
        packageName: 'Villa',
        startDate: '2026-12-10',
        endDate: '2026-12-16',
        nightsCount: 6,
        guestsCount: 1,
        selectedAddons: [],
        pricing: {
          nightsCount: 6,
          guestsCount: 1,
          packagePricePerPerson: 100000,
          basePackageTotal: 100000,
          addonsTotal: 0,
          taxRate: 0.12,
          taxAmount: 12000,
          totalAmount: 112000,
          depositPercentage: 25,
          depositAmount: 28000,
          remainingBalance: 84000,
          currency: 'INR',
        },
        message: 'Expired offer',
        expiresAt: '2020-01-01T00:00:00Z', // Past date
      }).offer

      const acceptResult = useDemoStore.getState().acceptCustomOffer(expiredOffer.id)
      expect(acceptResult.success).toBe(false)
      expect(acceptResult.error).toContain('expired')
    })
  })

  describe('Listing Builder: Draft & Publish Flows', () => {
    it('saves retreat listing draft and preserves it in store', () => {
      const store = useDemoStore.getState()
      expect(store.retreatListingDraft).toBeNull()

      store.saveRetreatListingDraft({
        title: 'Himalayan High Altitude Kundalini',
        tagline: '7 days of breath of fire in Rishikesh',
        startingPrice: 85000,
      })

      expect(useDemoStore.getState().retreatListingDraft?.title).toBe(
        'Himalayan High Altitude Kundalini'
      )

      store.clearRetreatListingDraft()
      expect(useDemoStore.getState().retreatListingDraft).toBeNull()
    })

    it('publishes a valid listing and makes it available in public discovery', () => {
      const store = useDemoStore.getState()
      const newRetreat: Retreat = {
        id: 'ret-rishikesh-99',
        title: 'Sacred Ganges Silent Meditation Immersion',
        slug: 'sacred-ganges-silent-meditation-immersion',
        tagline: 'Deep meditation on the banks of the holy Ganges.',
        description: 'Immerse in ancient Vedic chanting and restorative silence.',
        location: {
          city: 'Rishikesh',
          region: 'Uttarakhand',
          country: 'India',
          fullAddress: 'Tapovan, Rishikesh, 249192',
        },
        heroImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597',
        galleryImages: [],
        styles: ['Meditation', 'Hatha'],
        skillLevels: ['All Levels'],
        durationDays: 7,
        durationNights: 6,
        groupSizeMax: 12,
        languages: ['English', 'Hindi'],
        highlights: ['Ganga Aarti private access'],
        included: ['All sattvic meals'],
        notIncluded: ['Airfare'],
        dailySchedule: [{ time: '06:00 AM', activity: 'Morning Sadhana' }],
        organizerId: 'org-bali-prana',
        organizerName: 'Prana Veda Sanctuary',
        organizerAvatar: 'https://example.com/avatar.jpg',
        organizerVerified: true,
        rating: 5.0,
        reviewCount: 0,
        startingPrice: 95000,
        currency: 'INR',
        status: 'published',
        featured: false,
        createdAt: '2026-10-21',
        updatedAt: '2026-10-21',
      }

      const newPackage: Package = {
        id: 'pkg-rishikesh-cottage',
        retreatId: 'ret-rishikesh-99',
        name: 'Riverside Stone Cottage',
        description: 'Private cottage facing the holy river',
        accommodationType: 'private_room',
        pricePerPerson: 95000,
        currency: 'INR',
        maxOccupancy: 2,
        remainingSpots: 6,
        includesMeals: true,
        dateRanges: [
          {
            id: 'dr-rishi-1',
            startDate: '2026-12-01',
            endDate: '2026-12-07',
            availableSpots: 6,
          },
        ],
        features: ['River view balcony'],
      }

      const publishResult = store.publishRetreatListing(newRetreat, [newPackage])
      expect(publishResult.success).toBe(true)

      const stateAfter = useDemoStore.getState()
      const published = stateAfter.retreats.find((r) => r.id === 'ret-rishikesh-99')
      expect(published).toBeDefined()
      expect(published?.status).toBe('published')

      // Package registered
      const pkg = stateAfter.packages.find((p) => p.id === 'pkg-rishikesh-cottage')
      expect(pkg).toBeDefined()
    })
  })

  describe('Factory Reset Demo State', () => {
    it('restores initial seed state including refunds and offers', () => {
      const store = useDemoStore.getState()

      // Mutate state
      store.transitionBookingStatus(INITIAL_BOOKINGS[0].id, 'cancelled')
      store.saveRetreatListingDraft({ title: 'Temporary Draft' })

      expect(useDemoStore.getState().retreatListingDraft).not.toBeNull()

      // Reset
      store.resetDemoData()

      const resetState = useDemoStore.getState()
      expect(resetState.retreatListingDraft).toBeNull()
      expect(resetState.refunds.length).toBe(INITIAL_REFUNDS.length)
      expect(resetState.offers.length).toBe(INITIAL_OFFERS.length)
      expect(resetState.retreats.length).toBe(INITIAL_RETREATS.length)
    })
  })
})
