import { describe, it, expect, beforeEach } from 'vitest'
import { useDemoStore } from './useDemoStore'

describe('Public Landing Page & Demo Portal Access Integration', () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemoData()
  })

  it('provides published retreats backed by authentic seed data for landing page featured section', () => {
    const store = useDemoStore.getState()
    const published = store.retreats.filter((r) => r.status === 'published')

    expect(published.length).toBeGreaterThanOrEqual(2)
    published.forEach((retreat) => {
      expect(retreat.title).toBeTruthy()
      expect(retreat.startingPrice).toBeGreaterThan(0)
      expect(retreat.currency).toBe('INR')
      expect(retreat.location.city).toBeTruthy()
      expect(retreat.location.country).toBeTruthy()
      expect(retreat.durationDays).toBeGreaterThan(0)
      if (retreat.rating !== undefined) {
        expect(retreat.rating).toBeGreaterThanOrEqual(1)
        expect(retreat.rating).toBeLessThanOrEqual(5)
      }
    })
  })

  it('switches to Guest demo persona and preserves state', () => {
    const store = useDemoStore.getState()
    store.setDemoRole('guest')
    expect(useDemoStore.getState().demoRole).toBe('guest')
    expect(useDemoStore.getState().guest.name).toBe('Maya Lin')
  })

  it('switches to School Organizer demo persona and preserves active organizer', () => {
    const store = useDemoStore.getState()
    store.setDemoRole('organizer')
    expect(useDemoStore.getState().demoRole).toBe('organizer')

    const activeOrgId = useDemoStore.getState().activeOrganizerId
    const activeOrg = useDemoStore.getState().organizers.find((o) => o.id === activeOrgId)
    expect(activeOrg).toBeDefined()
    expect(activeOrg?.name).toBe('Prana Veda Sanctuary')
  })

  it('switches to Team Admin demo persona and provides moderation queues', () => {
    const store = useDemoStore.getState()
    store.setDemoRole('admin')
    expect(useDemoStore.getState().demoRole).toBe('admin')

    const retreats = useDemoStore.getState().retreats
    expect(retreats.length).toBeGreaterThan(0)

    const payouts = useDemoStore.getState().payouts
    expect(payouts.length).toBeGreaterThan(0)
  })

  it('supports toast feedback when entering portals', () => {
    const store = useDemoStore.getState()
    const initialToastsCount = store.toasts.length

    store.addToast({
      title: 'Switched to Guest Traveler Demo',
      description: 'You are now interacting as guest.',
      type: 'info',
    })

    const toasts = useDemoStore.getState().toasts
    expect(toasts.length).toBe(initialToastsCount + 1)
    expect(toasts.some((t) => t.title === 'Switched to Guest Traveler Demo')).toBe(true)
  })
})
