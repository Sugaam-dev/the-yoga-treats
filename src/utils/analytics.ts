import type {
  Booking,
  Payment,
  Payout,
  Refund,
  Retreat,
  Organizer,
  Package,
  Inquiry,
  CustomOffer,
} from '@/types'

export type AnalyticsTimeRange = 'all' | 'last_30_days' | 'next_90_days'

/**
 * Derives comprehensive SaaS metrics for an Organizer.
 */
export function computeOrganizerAnalytics(
  organizerId: string,
  bookings: Booking[],
  retreats: Retreat[],
  packages: Package[],
  inquiries: Inquiry[],
  offers: CustomOffer[],
  timeRange: AnalyticsTimeRange = 'all'
) {
  // 1. Filter relevant records for this organizer
  const orgRetreats = retreats.filter((r) => r.organizerId === organizerId)
  const orgBookings = bookings.filter((b) => b.organizerId === organizerId)
  const orgInquiries = inquiries.filter((inq) => inq.organizerId === organizerId)
  const orgOffers = offers.filter((off) => off.organizerId === organizerId)

  // 2. Filter bookings by timeRange if specified
  const filteredBookings = orgBookings.filter((b) => {
    if (timeRange === 'all') return true
    const bookingDate = new Date(b.startDate).getTime()
    const now = new Date('2026-10-21').getTime()
    if (timeRange === 'last_30_days') {
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
      return bookingDate >= thirtyDaysAgo && bookingDate <= now
    }
    if (timeRange === 'next_90_days') {
      const ninetyDaysAhead = now + 90 * 24 * 60 * 60 * 1000
      return bookingDate >= now && bookingDate <= ninetyDaysAhead
    }
    return true
  })

  // 3. Active vs cancelled bookings
  const activeBookings = filteredBookings.filter(
    (b) => b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'rejected'
  )
  const cancelledBookings = filteredBookings.filter((b) => b.bookingStatus === 'cancelled')

  // Financial metrics
  const totalBookingValue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0)
  const depositCashCollected = activeBookings.reduce((sum, b) => sum + (b.depositPaidAmount || 0), 0)
  const venueBalanceReceivable = activeBookings.reduce((sum, b) => sum + (b.remainingBalance || 0), 0)

  // 4. Booking trends (grouped by month of startDate)
  const monthlyTrendsMap: Record<string, { month: string; bookingsCount: number; grossVolume: number; deposits: number }> = {}
  
  for (const b of filteredBookings) {
    const monthKey = b.startDate.slice(0, 7) // "2026-11"
    if (!monthlyTrendsMap[monthKey]) {
      const dateObj = new Date(b.startDate + 'T00:00:00Z')
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyTrendsMap[monthKey] = { month: label, bookingsCount: 0, grossVolume: 0, deposits: 0 }
    }
    if (b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'rejected') {
      monthlyTrendsMap[monthKey].bookingsCount += 1
      monthlyTrendsMap[monthKey].grossVolume += b.totalAmount
      monthlyTrendsMap[monthKey].deposits += (b.depositPaidAmount || 0)
    }
  }

  const bookingTrends = Object.keys(monthlyTrendsMap)
    .sort()
    .map((k) => monthlyTrendsMap[k])

  // Fallback sample trend points if sparse
  const trendsData =
    bookingTrends.length > 0
      ? bookingTrends
      : [
          { month: 'Oct 2026', bookingsCount: 1, grossVolume: 125440, deposits: 31360 },
          { month: 'Nov 2026', bookingsCount: 2, grossVolume: 350000, deposits: 87500 },
          { month: 'Dec 2026', bookingsCount: 1, grossVolume: 196000, deposits: 49000 },
        ]

  // 5. Occupancy & Capacity calculation
  let totalCapacitySpots = 0
  let totalBookedSpots = 0

  const listingPerformance = orgRetreats.map((ret) => {
    const retPackages = packages.filter((p) => p.retreatId === ret.id)
    const retCapacity = retPackages.reduce((sum, p) => sum + p.maxOccupancy * 3, 0) || 12
    const retBookings = activeBookings.filter((b) => b.retreatId === ret.id)
    const retBookedGuests = retBookings.reduce((sum, b) => sum + b.guestsCount, 0)
    const retRevenue = retBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const occupancyRate = retCapacity > 0 ? Math.min(100, Math.round((retBookedGuests / retCapacity) * 100)) : 0

    totalCapacitySpots += retCapacity
    totalBookedSpots += retBookedGuests

    return {
      retreatId: ret.id,
      title: ret.title,
      capacity: retCapacity,
      bookedSpots: retBookedGuests,
      occupancyRate,
      grossRevenue: retRevenue,
      rating: ret.rating,
      bookingsCount: retBookings.length,
    }
  })

  const overallOccupancyRate =
    totalCapacitySpots > 0 ? Math.round((totalBookedSpots / totalCapacitySpots) * 100) : 0

  // 6. Inquiry & Offer Funnel
  const totalInquiries = orgInquiries.length
  const totalOffersSent = orgOffers.length
  const offersAccepted = orgOffers.filter((o) => o.status === 'accepted').length
  const conversionRate = totalInquiries > 0 ? Math.round((offersAccepted / totalInquiries) * 100) : 0

  return {
    totalBookingValue,
    depositCashCollected,
    venueBalanceReceivable,
    activeBookingsCount: activeBookings.length,
    cancelledBookingsCount: cancelledBookings.length,
    overallOccupancyRate,
    totalCapacitySpots,
    totalBookedSpots,
    totalInquiries,
    totalOffersSent,
    offersAccepted,
    conversionRate,
    trendsData,
    listingPerformance,
  }
}

/**
 * Derives platform-wide marketplace and operations metrics for Team Admin.
 */
export function computeAdminAnalytics(
  bookings: Booking[],
  _payments: Payment[],
  payouts: Payout[],
  refunds: Refund[],
  retreats: Retreat[],
  organizers: Organizer[]
) {
  // 1. Active bookings (excluding cancelled / rejected)
  const activeBookings = bookings.filter(
    (b) => b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'rejected'
  )

  // 2. Gross Merchandise Value (GMV)
  const grossBookingValue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0)

  // 3. Deposits Actually Collected (Platform Escrow Cash)
  const depositsCollected = activeBookings.reduce((sum, b) => sum + (b.depositPaidAmount || 0), 0)

  // 4. Venue-Paid Balances (Payable at venue directly - NOT platform cash)
  const venuePaidBalances = activeBookings.reduce((sum, b) => sum + (b.remainingBalance || 0), 0)

  // 5. Platform Commission (10% standard platform take rate on GMV)
  const platformCommissionRate = 0.10
  const grossPlatformCommission = Math.round(grossBookingValue * platformCommissionRate)

  // 6. Refunds and Reversals
  const totalRefundsValue = refunds.reduce((sum, r) => sum + r.amount, 0)

  // 7. Net Amounts Retained by Platform
  // Platform retains its fee minus applicable refund reversals
  const netRetainedPlatformRevenue = Math.max(0, grossPlatformCommission - Math.round(totalRefundsValue * 0.1))

  // 8. Payout Liabilities
  const pendingPayouts = payouts.filter((p) => p.status === 'pending' || p.status === 'in_transit')
  const completedPayouts = payouts.filter((p) => p.status === 'paid')

  const pendingPayoutsAmount = pendingPayouts.reduce((sum, p) => sum + p.netAmount, 0)
  const completedPayoutsAmount = completedPayouts.reduce((sum, p) => sum + p.netAmount, 0)

  // 9. Booking Funnel Distribution
  const funnel = {
    pending: bookings.filter((b) => b.bookingStatus === 'pending').length,
    confirmed: bookings.filter((b) => b.bookingStatus === 'confirmed').length,
    checked_in: bookings.filter((b) => b.bookingStatus === 'checked_in').length,
    completed: bookings.filter((b) => b.bookingStatus === 'completed').length,
    cancelled: bookings.filter((b) => b.bookingStatus === 'cancelled').length,
    rejected: bookings.filter((b) => b.bookingStatus === 'rejected').length,
  }

  // 10. Moderation Distribution
  const listingsModeration = {
    published: retreats.filter((r) => r.status === 'published').length,
    pending_review: retreats.filter((r) => r.status === 'pending_review').length,
    draft: retreats.filter((r) => r.status === 'draft').length,
  }

  const organizersVerification = {
    verified: organizers.filter((o) => o.verificationStatus === 'verified').length,
    pending: organizers.filter((o) => o.verificationStatus === 'pending').length,
    rejected: organizers.filter((o) => o.verificationStatus === 'rejected').length,
  }

  // Financial Breakdown Data for Recharts
  const financeBreakdownData = [
    { name: 'Deposits (Cash)', amount: depositsCollected, fill: '#1b4332' },
    { name: 'Venue Balances', amount: venuePaidBalances, fill: '#b08968' },
    { name: 'Platform Take', amount: grossPlatformCommission, fill: '#2d6a4f' },
    { name: 'Refunds', amount: totalRefundsValue, fill: '#e63946' },
  ]

  const bookingStatusData = [
    { name: 'Confirmed', count: funnel.confirmed, fill: '#1b4332' },
    { name: 'Checked In', count: funnel.checked_in, fill: '#2d6a4f' },
    { name: 'Completed', count: funnel.completed, fill: '#52b788' },
    { name: 'Pending', count: funnel.pending, fill: '#d4a373' },
    { name: 'Cancelled', count: funnel.cancelled, fill: '#e63946' },
  ]

  return {
    grossBookingValue,
    depositsCollected,
    venuePaidBalances,
    grossPlatformCommission,
    totalRefundsValue,
    netRetainedPlatformRevenue,
    pendingPayoutsAmount,
    completedPayoutsAmount,
    funnel,
    listingsModeration,
    organizersVerification,
    financeBreakdownData,
    bookingStatusData,
  }
}
