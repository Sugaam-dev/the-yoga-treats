import { describe, it, expect } from 'vitest'
import {
  calculateBookingPricing,
  calculateNights,
  formatINR,
  validateBookingDates,
} from './pricing'
import type { BookingAddon } from '@/types'

describe('Pricing and Date Utilities', () => {
  describe('formatINR', () => {
    it('formats Indian Rupee currency correctly with Indian numbering system', () => {
      const formatted = formatINR(135000)
      expect(formatted).toMatch(/₹\s?1,35,000/)
    })

    it('handles zero and negative or invalid values gracefully', () => {
      expect(formatINR(0)).toMatch(/₹\s?0/)
      expect(formatINR(NaN)).toBe('₹0')
    })
  })

  describe('calculateNights', () => {
    it('calculates the exact number of nights between two valid dates', () => {
      expect(calculateNights('2026-11-15', '2026-11-21')).toBe(6)
      expect(calculateNights('2026-12-01', '2026-12-02')).toBe(1)
    })

    it('returns 0 if departure is before or equal to arrival', () => {
      expect(calculateNights('2026-11-21', '2026-11-15')).toBe(0)
      expect(calculateNights('2026-11-15', '2026-11-15')).toBe(0)
    })

    it('returns 0 for empty or invalid date strings', () => {
      expect(calculateNights('', '2026-11-21')).toBe(0)
      expect(calculateNights('invalid', 'dates')).toBe(0)
    })
  })

  describe('validateBookingDates', () => {
    it('accepts valid future dates with check-out after check-in', () => {
      const result = validateBookingDates('2026-12-10', '2026-12-16')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects past arrival dates', () => {
      const result = validateBookingDates('2024-01-01', '2024-01-07')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('past')
    })

    it('rejects departure date before or equal to arrival date', () => {
      const sameDay = validateBookingDates('2026-12-10', '2026-12-10')
      expect(sameDay.isValid).toBe(false)
      expect(sameDay.error).toContain('after arrival date')

      const inverted = validateBookingDates('2026-12-15', '2026-12-10')
      expect(inverted.isValid).toBe(false)
      expect(inverted.error).toContain('after arrival date')
    })

    it('rejects empty or missing dates', () => {
      expect(validateBookingDates('', '2026-12-10').isValid).toBe(false)
      expect(validateBookingDates('2026-12-10', '').isValid).toBe(false)
    })

    it('validates required package duration when specified', () => {
      const mismatch = validateBookingDates('2026-12-10', '2026-12-12', 6)
      expect(mismatch.isValid).toBe(false)
      expect(mismatch.error).toContain('requires exactly 6 nights')

      const match = validateBookingDates('2026-12-10', '2026-12-16', 6)
      expect(match.isValid).toBe(true)
    })
  })

  describe('calculateBookingPricing', () => {
    const mockMassage: BookingAddon = {
      id: 'addon-massage',
      name: 'Ayurvedic Massage',
      description: 'Herbal massage',
      pricePerUnit: 4500,
      unit: 'per_guest',
      category: 'wellness',
    }

    const mockTransfer: BookingAddon = {
      id: 'addon-transfer',
      name: 'Airport Transfer',
      description: 'Private car',
      pricePerUnit: 3500,
      unit: 'per_booking',
      category: 'transport',
    }

    it('calculates base package pricing accurately for single and multiple guests', () => {
      const single = calculateBookingPricing({
        packagePricePerPerson: 100000,
        guestsCount: 1,
        nightsCount: 6,
        selectedAddons: [],
      })
      expect(single.breakdown.basePackageTotal).toBe(100000)
      expect(single.breakdown.taxAmount).toBe(12000) // 12% GST
      expect(single.breakdown.totalAmount).toBe(112000)
      expect(single.breakdown.depositAmount).toBe(28000) // 25% of 112000
      expect(single.breakdown.remainingBalance).toBe(84000)

      const double = calculateBookingPricing({
        packagePricePerPerson: 100000,
        guestsCount: 2,
        nightsCount: 6,
        selectedAddons: [],
      })
      expect(double.breakdown.basePackageTotal).toBe(200000)
      expect(double.breakdown.totalAmount).toBe(224000)
      expect(double.breakdown.depositAmount).toBe(56000)
      expect(double.breakdown.remainingBalance).toBe(168000)
    })

    it('correctly handles per_guest vs per_booking add-ons', () => {
      const result = calculateBookingPricing({
        packagePricePerPerson: 100000,
        guestsCount: 2,
        nightsCount: 5,
        selectedAddons: [
          { addon: mockMassage, quantity: 1 }, // per_guest: 2 guests * 4500 = 9000
          { addon: mockTransfer, quantity: 1 }, // per_booking: 1 booking * 3500 = 3500
        ],
      })

      // Addons total = 9000 + 3500 = 12500
      expect(result.breakdown.addonsTotal).toBe(12500)
      // Base package = 200000
      expect(result.breakdown.basePackageTotal).toBe(200000)
      // Subtotal = 212500
      // Tax (12%) = 25500
      expect(result.breakdown.taxAmount).toBe(25500)
      // Total = 238000
      expect(result.breakdown.totalAmount).toBe(238000)
      // Deposit (25%) = 59500
      expect(result.breakdown.depositAmount).toBe(59500)
      // Remaining = 178500
      expect(result.breakdown.remainingBalance).toBe(178500)
    })

    it('strictly satisfies the invariant: depositAmount + remainingBalance === totalAmount', () => {
      // Test odd numbers that cause fractional paise without integer rounding
      const testCases = [
        { price: 133333, guests: 1 },
        { price: 175999, guests: 3 },
        { price: 89450, guests: 2 },
      ]

      for (const tc of testCases) {
        const { breakdown } = calculateBookingPricing({
          packagePricePerPerson: tc.price,
          guestsCount: tc.guests,
          nightsCount: 4,
          selectedAddons: [{ addon: mockMassage, quantity: 1 }],
        })

        expect(breakdown.depositAmount + breakdown.remainingBalance).toBe(
          breakdown.totalAmount
        )
      }
    })
  })
})
