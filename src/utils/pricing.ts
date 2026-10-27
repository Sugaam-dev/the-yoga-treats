import type { BookingAddon, BookingPricingBreakdown, SelectedAddon } from '@/types'

/**
 * Format any numerical currency amount as Indian Rupee (INR - ₹) with standard Indian comma grouping.
 * e.g. 135000 -> "₹1,35,000"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

/**
 * Calculate the number of nights between two date strings (YYYY-MM-DD).
 */
export function calculateNights(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate + 'T00:00:00Z')
  const end = new Date(endDate + 'T00:00:00Z')
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  const diffMs = end.getTime() - start.getTime()
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return nights > 0 ? nights : 0
}

/**
 * Validates booking arrival and departure dates.
 * Rejects past dates, invalid formats, same-day, and inverted ranges.
 */
export function validateBookingDates(
  startDate: string,
  endDate: string,
  requiredNights?: number
): { isValid: boolean; error?: string } {
  if (!startDate) {
    return { isValid: false, error: 'Please choose an arrival date.' }
  }
  if (!endDate) {
    return { isValid: false, error: 'Please choose a departure date.' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Invalid arrival date format.' }
  }
  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid departure date format.' }
  }

  // Reject past dates (allow today and future)
  if (start < today) {
    return { isValid: false, error: 'Arrival date cannot be in the past.' }
  }

  // Reject departure before or on arrival
  if (end <= start) {
    return { isValid: false, error: 'Departure date must be after arrival date.' }
  }

  const nights = calculateNights(startDate, endDate)
  if (nights < 1) {
    return { isValid: false, error: 'Retreat stay must be at least 1 night.' }
  }

  if (requiredNights && nights !== requiredNights) {
    return {
      isValid: false,
      error: `Selected dates span ${nights} night${nights === 1 ? '' : 's'}. This retreat package requires exactly ${requiredNights} nights.`,
    }
  }

  return { isValid: true }
}

export interface PricingCalculationInput {
  packagePricePerPerson: number
  guestsCount: number
  nightsCount: number
  selectedAddons: { addon: BookingAddon; quantity: number }[]
  taxRate?: number // default 0.12 (12% GST)
  depositPercentage?: number // default 25 (25%)
}

/**
 * Currency-safe calculation of booking totals using integer minor units (paise).
 * Invariant guaranteed: depositAmount + remainingBalance === totalAmount.
 */
export function calculateBookingPricing({
  packagePricePerPerson,
  guestsCount,
  nightsCount,
  selectedAddons,
  taxRate = 0.12,
  depositPercentage = 25,
}: PricingCalculationInput): {
  breakdown: BookingPricingBreakdown
  selectedAddonsList: SelectedAddon[]
} {
  const safeGuests = Math.max(1, Math.floor(guestsCount || 1))
  const safeNights = Math.max(1, Math.floor(nightsCount || 1))

  // 1. Base package total in paise (price per person * guests)
  const packagePricePaise = Math.round(packagePricePerPerson * 100)
  const basePackageTotalPaise = packagePricePaise * safeGuests

  // 2. Addons total in paise
  let addonsTotalPaise = 0
  const selectedAddonsList: SelectedAddon[] = []

  for (const { addon, quantity } of selectedAddons) {
    if (quantity <= 0) continue
    const unitPricePaise = Math.round(addon.pricePerUnit * 100)
    const effectiveQty = addon.unit === 'per_guest' ? safeGuests * quantity : quantity
    const itemTotalPaise = unitPricePaise * effectiveQty
    addonsTotalPaise += itemTotalPaise

    selectedAddonsList.push({
      addonId: addon.id,
      name: addon.name,
      quantity: effectiveQty,
      unitPrice: addon.pricePerUnit,
      totalPrice: itemTotalPaise / 100,
    })
  }

  // 3. Subtotal before taxes in paise
  const subtotalPaise = basePackageTotalPaise + addonsTotalPaise

  // 4. Tax amount in paise (12% GST for hospitality/wellness retreats)
  const taxAmountPaise = Math.round(subtotalPaise * taxRate)

  // 5. Total booking value in paise
  const totalAmountPaise = subtotalPaise + taxAmountPaise

  // 6. Deposit amount in paise (25% advance to secure spot)
  const depositAmountPaise = Math.round((totalAmountPaise * depositPercentage) / 100)

  // 7. Remaining balance in paise (guarantees deposit + remaining === total)
  const remainingBalancePaise = totalAmountPaise - depositAmountPaise

  return {
    breakdown: {
      nightsCount: safeNights,
      guestsCount: safeGuests,
      packagePricePerPerson,
      basePackageTotal: basePackageTotalPaise / 100,
      addonsTotal: addonsTotalPaise / 100,
      taxRate,
      taxAmount: taxAmountPaise / 100,
      totalAmount: totalAmountPaise / 100,
      depositPercentage,
      depositAmount: depositAmountPaise / 100,
      remainingBalance: remainingBalancePaise / 100,
      currency: 'INR',
    },
    selectedAddonsList,
  }
}
