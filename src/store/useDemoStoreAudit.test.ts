import { describe, it, expect, beforeEach } from 'vitest'
import { useDemoStore } from './useDemoStore'
import { filterAndSortRetreats } from '@/utils/search'
import type { Retreat, Package } from '@/types'

describe('Final Acceptance Audit: Advanced Business Workflows', () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemoData()
  })

  describe('1. Payout Batch Processing & Settlement Reconciliation', () => {
    it('successfully processes all pending payouts, updating status to paid and setting processedDate', () => {
      const store = useDemoStore.getState()
      const initialPending = store.payouts.filter((p) => p.status === 'pending')
      expect(initialPending.length).toBeGreaterThan(0)

      const result = store.processPayoutsBatch()
      expect(result.success).toBe(true)
      expect(result.count).toBe(initialPending.length)

      const afterState = useDemoStore.getState()
      const remainingPending = afterState.payouts.filter((p) => p.status === 'pending')
      expect(remainingPending.length).toBe(0)

      // Verified processed date assigned
      const previouslyPending = afterState.payouts.filter((p) =>
        initialPending.some((init) => init.id === p.id)
      )
      expect(previouslyPending.every((p) => p.status === 'paid')).toBe(true)
      expect(previouslyPending.every((p) => Boolean(p.processedDate))).toBe(true)
    })

    it('handles idempotent payout batch calls when no pending disbursements exist', () => {
      const store = useDemoStore.getState()
      store.processPayoutsBatch()

      // Second call immediately afterwards
      const secondCall = useDemoStore.getState().processPayoutsBatch()
      expect(secondCall.success).toBe(true)
      expect(secondCall.count).toBe(0)
    })
  })

  describe('2. Listing Draft vs Publish Behavior and Public Visibility', () => {
    const draftRetreat: Retreat = {
      id: 'ret-draft-test-1',
      title: 'Himalayan Mountain Silence',
      slug: 'himalayan-mountain-silence',
      tagline: 'Private altitude meditation.',
      description: 'Quiet contemplation in the high Himalayas.',
      location: {
        city: 'Manali',
        region: 'Himachal Pradesh',
        country: 'India',
      },
      heroImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
      galleryImages: [],
      styles: ['Meditation', 'Hatha'],
      skillLevels: ['Intermediate'],
      durationDays: 5,
      durationNights: 4,
      groupSizeMax: 10,
      languages: ['English'],
      highlights: ['Mountain viewpoints'],
      included: ['Organic sattvic meals'],
      notIncluded: ['Transfers'],
      dailySchedule: [],
      organizerId: 'org-bali-prana',
      organizerName: 'Prana Veda Sanctuary',
      organizerAvatar: 'https://example.com/avatar.jpg',
      organizerVerified: true,
      rating: 5.0,
      reviewCount: 0,
      startingPrice: 65000,
      currency: 'INR',
      status: 'draft', // Explicit draft
      featured: false,
      createdAt: '2026-10-21',
      updatedAt: '2026-10-21',
    }

    const testPackage: Package = {
      id: 'pkg-draft-1',
      retreatId: 'ret-draft-test-1',
      name: 'Standard Dorm',
      description: 'Shared room',
      accommodationType: 'shared_room',
      pricePerPerson: 65000,
      currency: 'INR',
      maxOccupancy: 2,
      remainingSpots: 4,
      includesMeals: true,
      dateRanges: [
        {
          id: 'dr-draft-1',
          startDate: '2026-12-10',
          endDate: '2026-12-14',
          availableSpots: 4,
        },
      ],
      features: ['Balcony view'],
    }

    it('honors draft status when saving a listing and excludes it from public marketplace discovery', () => {
      const store = useDemoStore.getState()
      const res = store.publishRetreatListing(draftRetreat, [testPackage])
      expect(res.success).toBe(true)

      const stateAfter = useDemoStore.getState()
      const savedRetreat = stateAfter.retreats.find((r) => r.id === 'ret-draft-test-1')
      expect(savedRetreat).toBeDefined()
      expect(savedRetreat?.status).toBe('draft') // MUST remain draft

      // Verify public search strictly excludes this draft
      const searchResults = filterAndSortRetreats(
        stateAfter.retreats,
        stateAfter.packages,
        { searchTerm: 'Himalayan Mountain Silence' }
      )
      expect(searchResults.some((r) => r.id === 'ret-draft-test-1')).toBe(false)
    })
  })

  describe('3. Custom Offer Declining', () => {
    it('allows a guest to decline a custom offer and prevents subsequent acceptance', () => {
      const store = useDemoStore.getState()
      const offer = store.offers.find((o) => o.status === 'pending')!
      expect(offer).toBeDefined()

      const declineRes = store.declineCustomOffer(offer.id)
      expect(declineRes.success).toBe(true)

      const stateAfter = useDemoStore.getState()
      const updatedOffer = stateAfter.offers.find((o) => o.id === offer.id)
      expect(updatedOffer?.status).toBe('declined')

      // Acceptance of declined offer must fail
      const acceptRes = stateAfter.acceptCustomOffer(offer.id)
      expect(acceptRes.success).toBe(false)
      expect(acceptRes.error).toContain('declined')
    })
  })

  describe('4. Review Rejection and Rating Isolation', () => {
    it('moderating a review as rejected sets status to rejected and does not affect retreat average rating', () => {
      const store = useDemoStore.getState()
      const retreatBefore = store.retreats.find((r) => r.id === 'ret-bali-01')!
      const initialRating = retreatBefore.rating
      const initialReviewCount = retreatBefore.reviewCount

      // Moderate rev-03 with rejection and a moderation note
      const modRes = store.moderateReview(
        'rev-03',
        'rejected',
        'Violates community guidelines: Contains promotional third-party links.'
      )
      expect(modRes.success).toBe(true)

      const stateAfter = useDemoStore.getState()
      const rejectedReview = stateAfter.reviews.find((r) => r.id === 'rev-03')
      expect(rejectedReview?.status).toBe('rejected')
      expect(rejectedReview?.moderationNote).toContain('community guidelines')

      // Retreat rating and reviewCount must NOT be modified by rejected reviews
      const retreatAfter = stateAfter.retreats.find((r) => r.id === 'ret-bali-01')!
      expect(retreatAfter.rating).toBe(initialRating)
      expect(retreatAfter.reviewCount).toBe(initialReviewCount)
    })
  })
})
