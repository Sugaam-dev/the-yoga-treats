import { describe, it, expect, beforeEach } from 'vitest'
import { useDemoStore } from './useDemoStore'

describe('Final Phase State: Reviews, Notifications & Inquiries', () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemoData()
  })

  it('rejects review submission when guest has no completed stay for the retreat', () => {
    const res = useDemoStore.getState().submitReview({
      retreatId: 'ret-swiss-02', // Guest has only confirmed (not completed) booking for swiss
      retreatTitle: 'Alpine Stillness',
      rating: 5,
      title: 'Amazing stay',
      comment: 'Loved the snow.',
    })

    expect(res.success).toBe(false)
    expect(res.error).toBeDefined()
  })

  it('allows review submission when guest has completed stay, setting status to pending', () => {
    // bk-10819 is completed for ret-goa-04
    const res = useDemoStore.getState().submitReview({
      retreatId: 'ret-goa-04',
      retreatTitle: 'Ashtanga Mysore & Coastal Detox Retreat',
      bookingId: 'bk-10819',
      rating: 5,
      teacherRating: 5,
      venueRating: 5,
      title: 'Profoundly grounding experience',
      comment: 'Deep Mysore practice with sunrise meditation.',
    })

    expect(res.success).toBe(true)
    expect(res.review).toBeDefined()
    expect(res.review?.status).toBe('pending')

    // Verify it added a pending review to reviews state
    const created = useDemoStore.getState().reviews.find((r) => r.id === res.review?.id)
    expect(created).toBeDefined()
    expect(created?.status).toBe('pending')

    // Admin should have a notification for moderation
    const adminNotifs = useDemoStore
      .getState()
      .notifications.filter((n) => n.recipientRole === 'admin')
    expect(adminNotifs.some((n) => n.type === 'review_submitted')).toBe(true)
  })

  it('moderating a review updates status and recalculates retreat average rating when approved', () => {
    // rev-03 is pending in initial seed for ret-bali-01 with rating 4
    const initialRetreat = useDemoStore.getState().retreats.find((r) => r.id === 'ret-bali-01')
    expect(initialRetreat).toBeDefined()

    const modRes = useDemoStore.getState().moderateReview('rev-03', 'approved')
    expect(modRes.success).toBe(true)

    const updatedReview = useDemoStore.getState().reviews.find((r) => r.id === 'rev-03')
    expect(updatedReview?.status).toBe('published')

    // Retreat rating and reviewCount should be recalculated
    const updatedRetreat = useDemoStore.getState().retreats.find((r) => r.id === 'ret-bali-01')
    expect(updatedRetreat?.reviewCount).toBeGreaterThanOrEqual(2)
  })

  it('creates an inquiry with simulated auto-reply and unread markers', () => {
    const res = useDemoStore.getState().createInquiry({
      retreatId: 'ret-bali-01',
      subject: 'Gluten-free dining inquiry',
      message: 'Can you accommodate celiac dietary needs during daily meals?',
    })

    expect(res.success).toBe(true)
    expect(res.inquiryId).toBeDefined()

    const inq = useDemoStore.getState().inquiries.find((i) => i.id === res.inquiryId)
    expect(inq).toBeDefined()
    expect(inq?.unreadByOrganizer).toBe(true)

    const inqMessages = useDemoStore.getState().messages.filter((m) => m.inquiryId === res.inquiryId)
    expect(inqMessages.length).toBe(2) // 1 guest message + 1 simulated auto-reply
    expect(inqMessages.some((m) => m.isAutoReply)).toBe(true)
  })

  it('manages notifications read states and role filtering', () => {
    const notifs = useDemoStore.getState().notifications
    expect(notifs.length).toBeGreaterThan(0)

    const firstId = notifs[0].id
    useDemoStore.getState().markNotificationRead(firstId)
    expect(useDemoStore.getState().notifications.find((n) => n.id === firstId)?.read).toBe(true)

    useDemoStore.getState().markAllNotificationsRead('admin')
    const adminNotifs = useDemoStore
      .getState()
      .notifications.filter((n) => n.recipientRole === 'admin')
    expect(adminNotifs.every((n) => n.read)).toBe(true)
  })
})
