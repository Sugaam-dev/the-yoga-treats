import { describe, it, expect } from 'vitest'
import { validateBookingTransition } from './lifecycle'
import type { BookingStatus } from '@/types'

describe('Booking Lifecycle Transitions', () => {
  it('permits valid transitions from pending status', () => {
    expect(validateBookingTransition('pending', 'confirmed').valid).toBe(true)
    expect(validateBookingTransition('pending', 'rejected').valid).toBe(true)
    expect(validateBookingTransition('pending', 'cancelled').valid).toBe(true)
  })

  it('rejects invalid jumps from pending status', () => {
    const jumpToCheckIn = validateBookingTransition('pending', 'checked_in')
    expect(jumpToCheckIn.valid).toBe(false)

    const jumpToCompleted = validateBookingTransition('pending', 'completed')
    expect(jumpToCompleted.valid).toBe(false)
  })

  it('permits valid transitions from confirmed status', () => {
    expect(validateBookingTransition('confirmed', 'checked_in').valid).toBe(true)
    expect(validateBookingTransition('confirmed', 'cancelled').valid).toBe(true)
  })

  it('forbids rejecting or completing a confirmed booking directly', () => {
    const directReject = validateBookingTransition('confirmed', 'rejected')
    expect(directReject.valid).toBe(false)
    expect(directReject.error).toContain('formal cancellation')

    const directComplete = validateBookingTransition('confirmed', 'completed')
    expect(directComplete.valid).toBe(false)
  })

  it('permits check-in to completed transition only', () => {
    expect(validateBookingTransition('checked_in', 'completed').valid).toBe(true)

    const cancelCheckedIn = validateBookingTransition('checked_in', 'cancelled')
    expect(cancelCheckedIn.valid).toBe(false)
    expect(cancelCheckedIn.error).toContain('already checked in')
  })

  it('strictly forbids transitions out of terminal states (completed, cancelled, rejected)', () => {
    const terminals: BookingStatus[] = ['completed', 'cancelled', 'rejected']
    const allStatuses: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'rejected']

    for (const term of terminals) {
      for (const target of allStatuses) {
        const result = validateBookingTransition(term, target)
        expect(result.valid).toBe(false)
        expect(result.error).toBeDefined()
      }
    }
  })

  it('disallows no-op transitions to the same status', () => {
    expect(validateBookingTransition('confirmed', 'confirmed').valid).toBe(false)
    expect(validateBookingTransition('pending', 'pending').valid).toBe(false)
  })
})
