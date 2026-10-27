import { describe, it, expect } from 'vitest'
import { computeOrganizerAnalytics, computeAdminAnalytics } from './analytics'
import {
  INITIAL_BOOKINGS,
  INITIAL_RETREATS,
  INITIAL_PACKAGES,
  INITIAL_INQUIRIES,
  INITIAL_OFFERS,
  INITIAL_PAYMENTS,
  INITIAL_PAYOUTS,
  INITIAL_REFUNDS,
  INITIAL_ORGANIZERS,
} from '@/data/seedData'

describe('Analytics & Recharts Calculations Engine', () => {
  it('computes organizer metrics distinguishing booking value, deposits, and venue balance', () => {
    const orgMetrics = computeOrganizerAnalytics(
      'org-bali-prana',
      INITIAL_BOOKINGS,
      INITIAL_RETREATS,
      INITIAL_PACKAGES,
      INITIAL_INQUIRIES,
      INITIAL_OFFERS,
      'all'
    )

    expect(orgMetrics.totalBookingValue).toBeGreaterThan(0)
    expect(orgMetrics.depositCashCollected).toBeGreaterThan(0)
    expect(orgMetrics.venueBalanceReceivable).toBeGreaterThan(0)

    // Deposit + Venue Balance should reconcile with Total Booking Value (accounting for any tax)
    expect(orgMetrics.depositCashCollected + orgMetrics.venueBalanceReceivable).toBe(
      orgMetrics.totalBookingValue
    )
  })

  it('computes admin platform volume, escrow cash, commissions and refunds', () => {
    const adminMetrics = computeAdminAnalytics(
      INITIAL_BOOKINGS,
      INITIAL_PAYMENTS,
      INITIAL_PAYOUTS,
      INITIAL_REFUNDS,
      INITIAL_RETREATS,
      INITIAL_ORGANIZERS
    )

    expect(adminMetrics.grossBookingValue).toBeGreaterThan(0)
    expect(adminMetrics.depositsCollected).toBeGreaterThan(0)
    expect(adminMetrics.venuePaidBalances).toBeGreaterThan(0)
    expect(adminMetrics.grossPlatformCommission).toBe(
      Math.round(adminMetrics.grossBookingValue * 0.1)
    )
    expect(adminMetrics.funnel.confirmed).toBeGreaterThan(0)
    expect(adminMetrics.listingsModeration.published).toBeGreaterThan(0)
  })
})
