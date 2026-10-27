import { describe, it, expect, beforeEach } from 'vitest'
import { useDemoStore } from './useDemoStore'
import type { Booking, Payment } from '@/types'
import { INITIAL_BOOKINGS, INITIAL_PACKAGES, INITIAL_PAYMENTS } from '@/data/seedData'

describe('useDemoStore - Booking Lifecycle and Shared State', () => {
  beforeEach(() => {
    // Reset store before each test
    useDemoStore.getState().resetDemoData()
  })

  describe('Draft State Management', () => {
    it('sets and updates booking draft state across multiple steps', () => {
      const store = useDemoStore.getState()
      expect(store.bookingDraft).toBeNull()

      // Step 1: Initialize draft
      store.setBookingDraft({
        retreatId: 'ret-bali-01',
        packageId: 'pkg-bali-villa',
        startDate: '2026-11-15',
        endDate: '2026-11-21',
        guestsCount: 2,
        currentStep: 1,
      })

      let updated = useDemoStore.getState().bookingDraft
      expect(updated).not.toBeNull()
      expect(updated?.retreatId).toBe('ret-bali-01')
      expect(updated?.guestsCount).toBe(2)
      expect(updated?.currentStep).toBe(1)

      // Step 2: Merge contact & add-on details into existing draft
      store.setBookingDraft({
        selectedAddonIds: ['addon-massage'],
        guestPhone: '+91 98765 43210',
        currentStep: 2,
      })

      updated = useDemoStore.getState().bookingDraft
      expect(updated?.retreatId).toBe('ret-bali-01')
      expect(updated?.selectedAddonIds).toEqual(['addon-massage'])
      expect(updated?.guestPhone).toBe('+91 98765 43210')
      expect(updated?.currentStep).toBe(2)

      // Clear draft
      store.clearBookingDraft()
      expect(useDemoStore.getState().bookingDraft).toBeNull()
    })
  })

  describe('createBooking (Simulated Checkout)', () => {
    const mockNewBooking: Booking = {
      id: 'booking-test-999',
      bookingReference: 'YTR-TEST-999',
      retreatId: 'ret-bali-01',
      retreatTitle: 'Sacred Prana Flow & Breathwork Immersion',
      retreatImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      retreatLocation: 'Ubud, Bali, Indonesia',
      packageId: 'pkg-bali-villa',
      packageName: 'Private Ocean-Cliff Eco Villa',
      organizerId: 'org-bali-prana',
      organizerName: 'Prana Veda Sanctuary',
      guestId: 'guest-maya',
      guestName: 'Maya Chen',
      guestEmail: 'maya.chen@example.com',
      guestPhone: '+91 98765 43210',
      startDate: '2026-11-15',
      endDate: '2026-11-21',
      nightsCount: 6,
      guestsCount: 1,
      totalAmount: 302400,
      currency: 'INR',
      paymentStatus: 'deposit_paid',
      bookingStatus: 'confirmed',
      createdAt: '2026-10-21',
      depositPaidAmount: 75600,
      remainingBalance: 226800,
      transactionReference: 'PAY-SIM-TEST999',
    }

    const mockNewPayment: Payment = {
      id: 'pay-test-999',
      paymentReference: 'PAY-SIM-TEST999',
      bookingId: 'booking-test-999',
      bookingReference: 'YTR-TEST-999',
      guestId: 'guest-maya',
      guestName: 'Maya Chen',
      retreatTitle: 'Sacred Prana Flow & Breathwork Immersion',
      amount: 75600,
      currency: 'INR',
      paymentMethod: 'credit_card',
      status: 'completed',
      processedAt: '2026-10-21T11:00:00Z',
    }

    it('successfully processes checkout and creates consistent booking + payment records', () => {
      const store = useDemoStore.getState()
      const initialSpots = store.packages.find((p) => p.id === 'pkg-bali-villa')?.remainingSpots || 0
      const initialBookingsCount = store.bookings.length
      const initialPaymentsCount = store.payments.length

      const result = store.createBooking({
        booking: mockNewBooking,
        payment: mockNewPayment,
      })

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()

      const stateAfter = useDemoStore.getState()

      // Bookings & Payments length incremented
      expect(stateAfter.bookings.length).toBe(initialBookingsCount + 1)
      expect(stateAfter.payments.length).toBe(initialPaymentsCount + 1)

      // Verified prepended items
      expect(stateAfter.bookings[0].bookingReference).toBe('YTR-TEST-999')
      expect(stateAfter.payments[0].paymentReference).toBe('PAY-SIM-TEST999')

      // Package remaining spots decremented
      const updatedPkg = stateAfter.packages.find((p) => p.id === 'pkg-bali-villa')
      expect(updatedPkg?.remainingSpots).toBe(initialSpots - mockNewBooking.guestsCount)

      // Booking draft cleared upon successful booking
      expect(stateAfter.bookingDraft).toBeNull()
    })

    it('rejects duplicate booking submissions with the same booking reference', () => {
      const store = useDemoStore.getState()

      // First submission succeeds
      const firstResult = store.createBooking({
        booking: mockNewBooking,
        payment: mockNewPayment,
      })
      expect(firstResult.success).toBe(true)

      const countAfterFirst = useDemoStore.getState().bookings.length

      // Duplicate submission with same booking reference must be rejected
      const duplicateResult = useDemoStore.getState().createBooking({
        booking: mockNewBooking,
        payment: mockNewPayment,
      })

      expect(duplicateResult.success).toBe(false)
      expect(duplicateResult.error).toContain('already been confirmed')
      expect(useDemoStore.getState().bookings.length).toBe(countAfterFirst)
    })

    it('ensures booking visibility across Guest, Organizer, and Admin views', () => {
      useDemoStore.getState().createBooking({
        booking: mockNewBooking,
        payment: mockNewPayment,
      })

      const state = useDemoStore.getState()

      // 1. Guest Portal Visibility: appears in guest's personal booking list
      const guestBookings = state.bookings.filter((b) => b.guestId === 'guest-maya')
      const guestFound = guestBookings.find((b) => b.bookingReference === 'YTR-TEST-999')
      expect(guestFound).toBeDefined()
      expect(guestFound?.totalAmount).toBe(302400)
      expect(guestFound?.depositPaidAmount).toBe(75600)
      expect(guestFound?.remainingBalance).toBe(226800)

      // 2. Organizer Portal Visibility: appears under the specific retreat school/organizer
      const organizerBookings = state.bookings.filter((b) => b.organizerId === 'org-bali-prana')
      const organizerFound = organizerBookings.find((b) => b.bookingReference === 'YTR-TEST-999')
      expect(organizerFound).toBeDefined()
      expect(organizerFound?.packageName).toBe('Private Ocean-Cliff Eco Villa')

      // 3. Admin Financial Operations Visibility: payment record is tracked in global payments ledger
      const adminPayments = state.payments
      const paymentFound = adminPayments.find((p) => p.paymentReference === 'PAY-SIM-TEST999')
      expect(paymentFound).toBeDefined()
      expect(paymentFound?.amount).toBe(75600)
      expect(paymentFound?.status).toBe('completed')
    })
  })

  describe('resetDemoData', () => {
    it('restores initial seed data and clears any ongoing drafts', () => {
      const store = useDemoStore.getState()

      // Mutate store state
      store.setBookingDraft({ retreatId: 'some-retreat', guestsCount: 5 })
      store.updateBookingStatus(INITIAL_BOOKINGS[0].id, 'cancelled')

      expect(useDemoStore.getState().bookingDraft).not.toBeNull()
      expect(useDemoStore.getState().bookings[0].bookingStatus).toBe('cancelled')

      // Trigger reset
      store.resetDemoData()

      const resetState = useDemoStore.getState()
      expect(resetState.bookingDraft).toBeNull()
      expect(resetState.bookings.length).toBe(INITIAL_BOOKINGS.length)
      expect(resetState.packages.length).toBe(INITIAL_PACKAGES.length)
      expect(resetState.payments.length).toBe(INITIAL_PAYMENTS.length)
      expect(resetState.bookings[0].bookingStatus).toBe(INITIAL_BOOKINGS[0].bookingStatus)
    })
  })
})
