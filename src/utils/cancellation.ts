import type { Booking, CancellationQuote } from '@/types'

export interface CancellationPolicyRule {
  minDaysBeforeArrival: number // strictly greater than this
  maxDaysBeforeArrival: number | null // less than or equal to this (or null for infinity)
  refundPercentage: number
  description: string
}

/**
 * Configurable synthetic cancellation policy tiers:
 * - More than 30 days before arrival (> 30 days): 100% refund of eligible deposit.
 * - More than 14 days and up to 30 days before arrival (> 14 and <= 30 days): 50% refund of eligible deposit.
 * - 14 days or fewer before arrival (<= 14 days): 0% deposit refund.
 */
export const CANCELLATION_POLICY_RULES: CancellationPolicyRule[] = [
  {
    minDaysBeforeArrival: 30,
    maxDaysBeforeArrival: null,
    refundPercentage: 100,
    description: '100% deposit refund (more than 30 days before arrival)',
  },
  {
    minDaysBeforeArrival: 14,
    maxDaysBeforeArrival: 30,
    refundPercentage: 50,
    description: '50% deposit refund (15 to 30 days before arrival)',
  },
  {
    minDaysBeforeArrival: -Infinity,
    maxDaysBeforeArrival: 14,
    refundPercentage: 0,
    description: 'Non-refundable deposit (14 days or fewer before arrival)',
  },
]

// Current default simulation date (synchronized with demo local time: 2026-10-21)
export const DEFAULT_DEMO_SYSTEM_DATE = '2026-10-21'

/**
 * Calculates calendar days between two ISO date strings (targetDate - fromDate).
 */
export function calculateDaysBetween(fromDateStr: string, targetDateStr: string): number {
  const from = new Date(fromDateStr)
  const target = new Date(targetDateStr)
  from.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - from.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Derives the cancellation refund quote for a given booking based on arrival date and collected deposit.
 */
export function calculateCancellationQuote(
  booking: Booking,
  asOfDateStr: string = DEFAULT_DEMO_SYSTEM_DATE
): CancellationQuote {
  // 1. Eligibility validation
  if (booking.bookingStatus === 'cancelled') {
    return {
      daysUntilArrival: 0,
      refundPercentage: 0,
      refundableAmount: 0,
      policyRule: 'Booking is already cancelled.',
      canCancel: false,
      rejectionReason: 'This booking has already been cancelled and processed.',
    }
  }

  if (booking.bookingStatus === 'rejected') {
    return {
      daysUntilArrival: 0,
      refundPercentage: 0,
      refundableAmount: 0,
      policyRule: 'Booking has been rejected.',
      canCancel: false,
      rejectionReason: 'This booking was rejected by the sanctuary organizer.',
    }
  }

  if (booking.bookingStatus === 'completed') {
    return {
      daysUntilArrival: 0,
      refundPercentage: 0,
      refundableAmount: 0,
      policyRule: 'Stay already completed.',
      canCancel: false,
      rejectionReason: 'Completed retreat immersions cannot be cancelled.',
    }
  }

  if (booking.bookingStatus === 'checked_in') {
    return {
      daysUntilArrival: 0,
      refundPercentage: 0,
      refundableAmount: 0,
      policyRule: 'Guest has already checked in.',
      canCancel: false,
      rejectionReason: 'Active on-site stays cannot be cancelled online.',
    }
  }

  // 2. Days calculation
  const daysUntilArrival = calculateDaysBetween(asOfDateStr, booking.startDate)

  // 3. Deposit base identification
  const eligibleDeposit =
    booking.depositPaidAmount ??
    booking.pricing?.depositAmount ??
    Math.round(booking.totalAmount * 0.25)

  // 4. Determine policy rule tier
  let matchedRule = CANCELLATION_POLICY_RULES[CANCELLATION_POLICY_RULES.length - 1] // default <= 14 days

  for (const rule of CANCELLATION_POLICY_RULES) {
    const isAboveMin = daysUntilArrival > rule.minDaysBeforeArrival
    const isBelowMax = rule.maxDaysBeforeArrival === null || daysUntilArrival <= rule.maxDaysBeforeArrival
    if (isAboveMin && isBelowMax) {
      matchedRule = rule
      break
    }
  }

  // 5. Calculate integer refund (capped at eligible deposit actually collected)
  const refundableAmount = Math.min(
    eligibleDeposit,
    Math.round((eligibleDeposit * matchedRule.refundPercentage) / 100)
  )

  return {
    daysUntilArrival,
    refundPercentage: matchedRule.refundPercentage,
    refundableAmount,
    policyRule: matchedRule.description,
    canCancel: true,
  }
}
