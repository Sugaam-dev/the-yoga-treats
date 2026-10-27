import type { BookingStatus } from '@/types'

export interface TransitionValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valid transitions graph for Yoga Retreat Bookings:
 * - 'pending'    -> 'confirmed' (organizer accepts), 'rejected' (organizer rejects), 'cancelled' (guest cancels)
 * - 'confirmed'  -> 'checked_in' (guest arrives & checks in), 'cancelled' (cancelled per refund policy)
 * - 'checked_in' -> 'completed' (stay finished successfully)
 * - 'completed'  -> terminal (cannot transition)
 * - 'cancelled'  -> terminal (cannot transition)
 * - 'rejected'   -> terminal (cannot transition)
 */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'rejected', 'cancelled'],
  confirmed: ['checked_in', 'cancelled'],
  checked_in: ['completed'],
  completed: [],
  cancelled: [],
  rejected: [],
}

/**
 * Validates whether a booking can transition from currentStatus to targetStatus.
 */
export function validateBookingTransition(
  currentStatus: BookingStatus,
  targetStatus: BookingStatus
): TransitionValidationResult {
  if (currentStatus === targetStatus) {
    return {
      valid: false,
      error: `Booking is already in '${currentStatus}' status.`,
    }
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(targetStatus)) {
    if (['completed', 'cancelled', 'rejected'].includes(currentStatus)) {
      return {
        valid: false,
        error: `Cannot modify a booking that is already '${currentStatus}'. This is a terminal state.`,
      }
    }
    if (currentStatus === 'confirmed' && targetStatus === 'rejected') {
      return {
        valid: false,
        error: `Confirmed bookings cannot be rejected directly; they must undergo formal cancellation and refund processing.`,
      }
    }
    if (currentStatus === 'checked_in' && targetStatus === 'cancelled') {
      return {
        valid: false,
        error: `A guest who has already checked in cannot cancel their booking.`,
      }
    }
    return {
      valid: false,
      error: `Transition from '${currentStatus}' to '${targetStatus}' is not permitted by booking lifecycle rules.`,
    }
  }

  return { valid: true }
}
