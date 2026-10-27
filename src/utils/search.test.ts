import { describe, it, expect } from 'vitest'
import { filterAndSortRetreats } from './search'
import { INITIAL_RETREATS, INITIAL_PACKAGES } from '@/data/seedData'

describe('Discovery Search & Filtering Engine', () => {
  it('filters by destination or keyword correctly', () => {
    const results = filterAndSortRetreats(INITIAL_RETREATS, INITIAL_PACKAGES, {
      searchTerm: 'Bali',
    })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((r) => r.location.country.includes('Indonesia') || r.title.includes('Bali') || r.location.city.includes('Uluwatu'))).toBe(true)
  })

  it('filters by yoga style', () => {
    const yinResults = filterAndSortRetreats(INITIAL_RETREATS, INITIAL_PACKAGES, {
      style: 'Yin',
    })
    expect(yinResults.length).toBeGreaterThan(0)
    expect(yinResults.every((r) => r.styles.includes('Yin'))).toBe(true)
  })

  it('filters by skill level / difficulty', () => {
    const beginnerResults = filterAndSortRetreats(INITIAL_RETREATS, INITIAL_PACKAGES, {
      difficulty: 'Beginner',
    })
    expect(beginnerResults.every((r) => r.skillLevels.includes('Beginner'))).toBe(true)
  })

  it('filters by duration ranges', () => {
    const weekendResults = filterAndSortRetreats(INITIAL_RETREATS, INITIAL_PACKAGES, {
      duration: 'weekend',
    })
    expect(weekendResults.every((r) => r.durationDays <= 4)).toBe(true)

    const extendedResults = filterAndSortRetreats(INITIAL_RETREATS, INITIAL_PACKAGES, {
      duration: 'extended',
    })
    expect(extendedResults.every((r) => r.durationDays >= 8)).toBe(true)
  })

  it('sorts by price low-to-high and high-to-low', () => {
    const asc = filterAndSortRetreats(INITIAL_RETREATS, INITIAL_PACKAGES, {
      sortBy: 'price_asc',
    })
    for (let i = 0; i < asc.length - 1; i++) {
      expect(asc[i].startingPrice).toBeLessThanOrEqual(asc[i + 1].startingPrice)
    }

    const desc = filterAndSortRetreats(INITIAL_RETREATS, INITIAL_PACKAGES, {
      sortBy: 'price_desc',
    })
    for (let i = 0; i < desc.length - 1; i++) {
      expect(desc[i].startingPrice).toBeGreaterThanOrEqual(desc[i + 1].startingPrice)
    }
  })

  it('never displays unapproved or draft listings in public search', () => {
    const withDraft = [
      ...INITIAL_RETREATS,
      {
        ...INITIAL_RETREATS[0],
        id: 'ret-draft-hidden',
        title: 'Hidden Draft Retreat',
        status: 'draft' as const,
      },
    ]

    const results = filterAndSortRetreats(withDraft, INITIAL_PACKAGES, {
      searchTerm: 'Hidden Draft',
    })
    expect(results.length).toBe(0)
  })
})
