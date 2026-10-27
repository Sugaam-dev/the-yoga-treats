import { describe, it, expect } from 'vitest'
import {
  calculateCancellationQuote,
  calculateDaysBetween,
} from './cancellation'
import type { Booking } from '@/types'

describe('Cancellation Policy and Refund Calculator', () => {
  const baseBooking: Booking = {
    id: 'test-booking-1',
    bookingReference: 'YTR-CANC-1',
    retreatId: 'ret-bali-01',
    retreatTitle: 'Oceanic Breath & Vedic Flow Sanctuary',
    retreatImage: 'https://example.com/img.jpg',
    retreatLocation: 'Bali, Indonesia',
    packageId: 'pkg-bali-villa',
    packageName: 'Private Eco Villa',
    organizerId: 'org-bali-prana',
    organizerName: 'Prana Veda Sanctuary',
    guestId: 'guest-01',
    guestName: 'Maya Lin',
    guestEmail: 'maya.lin@example.com',
    startDate: '2026-11-25', // 35 days from 2026-10-21
    endDate: '2026-12-01',
    guestsCount: 1,
    totalAmount: 200000,
    depositPaidAmount: 50000,
    remainingBalance: 150000,
    currency: 'INR',
    paymentStatus: 'deposit_paid',
    bookingStatus: 'confirmed',
    createdAt: '2026-10-20',
  }

  describe('calculateDaysBetween', () => {
    it('correctly calculates difference in days regardless of hour differences', () => {
      expect(calculateDaysBetween('2026-10-21', '2026-11-25')).toBe(35)
      expect(calculateDaysBetween('2026-10-21', '2026-10-22')).toBe(1)
      expect(calculateDaysBetween('2026-10-21', '2026-10-21')).toBe(0)
    })
  })

  describe('Cancellation Policy Tiers & Boundaries', () => {
    const asOf = '2026-10-21'

    it('awards 100% deposit refund for cancellations more than 30 days before arrival (e.g., 35 & 31 days)', () => {
      // 35 days
      const quote35 = calculateCancellationQuote(
        { ...baseBooking, startDate: '2026-11-25' },
        asOf
      )
      expect(quote35.daysUntilArrival).toBe(35)
      expect(quote35.canCancel).toBe(true)
      expect(quote35.refundPercentage).toBe(100)
      expect(quote35.refundableAmount).toBe(50000)
      expect(quote35.policyRule).toContain('100% deposit refund')

      // 31 days (strictly > 30)
      const quote31 = calculateCancellationQuote(
        { ...baseBooking, startDate: '2026-11-21' },
        asOf
      )
      expect(quote31.daysUntilArrival).toBe(31)
      expect(quote31.refundPercentage).toBe(100)
      expect(quote31.refundableAmount).toBe(50000)
    })

    it('awards 50% deposit refund for cancellations 15 to 30 days before arrival (boundary check: exactly 30 and 15 days)', () => {
      // Exactly 30 days: (boundary: > 14 and <= 30)
      const quote30 = calculateCancellationQuote(
        { ...baseBooking, startDate: '2026-11-20' },
        asOf
      )
      expect(quote30.daysUntilArrival).toBe(30)
      expect(quote30.refundPercentage).toBe(50)
      expect(quote30.refundableAmount).toBe(25000) // 50% of 50000
      expect(quote30.policyRule).toContain('50% deposit refund')

      // Exactly 15 days: (strictly > 14)
      const quote15 = calculateCancellationQuote(
        { ...baseBooking, startDate: '2026-11-05' },
        asOf
      )
      expect(quote15.daysUntilArrival).toBe(15)
      expect(quote15.refundPercentage).toBe(50)
      expect(quote15.refundableAmount).toBe(25000)
    })

    it('awards 0% refund for cancellations 14 days or fewer before arrival (boundary check: 14, 7, and 0 days)', () => {
      // Exactly 14 days: (<= 14)
      const quote14 = calculateCancellationQuote(
        { ...baseBooking, startDate: '2026-11-04' },
        asOf
      )
      expect(quote14.daysUntilArrival).toBe(14)
      expect(quote14.refundPercentage).toBe(0)
      expect(quote14.refundableAmount).toBe(0)
      expect(quote14.policyRule).toContain('Non-refundable deposit')

      // 7 days
      const quote7 = calculateCancellationQuote(
        { ...baseBooking, startDate: '2026-10-28' },
        asOf
      )
      expect(quote7.daysUntilArrival).toBe(7)
      expect(quote7.refundPercentage).toBe(0)
      expect(quote7.refundableAmount).toBe(0)

      // Same day (0 days)
      const quote0 = calculateCancellationQuote(
        { ...baseBooking, startDate: '2026-10-21' },
        asOf
      )
      expect(quote0.daysUntilArrival).toBe(0)
      expect(quote0.refundPercentage).toBe(0)
      expect(quote0.refundableAmount).toBe(0)
    })
  })

  describe('Deposit Cap and Integrity', () => {
    it('strictly guarantees that refundableAmount never exceeds depositPaidAmount', () => {
      const oddDepositBooking: Booking = {
        ...baseBooking,
        depositPaidAmount: 33333,
        startDate: '2026-12-01', // > 30 days -> 100%
      }
      const quote100 = calculateCancellationQuote(oddDepositBooking, '2026-10-21')
      expect(quote100.refundableAmount).toBe(33333)
      expect(quote100.refundableAmount).toBeLessThanOrEqual(33333)

      const oddDepositBooking50: Booking = {
        ...baseBooking,
        depositPaidAmount: 33333,
        startDate: '2026-11-15', // 25 days -> 50%
      }
      const quote50 = calculateCancellationQuote(oddDepositBooking50, '2026-10-21')
      expect(quote50.refundableAmount).toBe(16667) // Math.round(33333 * 0.5)
      expect(quote50.refundableAmount).toBeLessThanOrEqual(33333)
    })
  })

  describe('Eligibility and Rejection Rules', () => {
    it('rejects cancellation of already cancelled bookings', () => {
      const cancelledBooking: Booking = {
        ...baseBooking,
        bookingStatus: 'cancelled',
      }
      const quote = calculateCancellationQuote(cancelledBooking)
      expect(quote.canCancel).toBe(false)
      expect(quote.rejectionReason).toContain('already been cancelled')
    })

    it('rejects cancellation of checked-in or completed bookings', () => {
      const checkedInBooking: Booking = {
        ...baseBooking,
        bookingStatus: 'checked_in',
      }
      expect(calculateCancellationQuote(checkedInBooking).canCancel).toBe(false)

      const completedBooking: Booking = {
        ...baseBooking,
        bookingStatus: 'completed',
      }
      expect(calculateCancellationQuote(completedBooking).canCancel).toBe(false)
    })
  })
})
