import type { Retreat, Package, YogaStyle, SkillLevel } from '@/types'

export type DurationFilter = 'all' | 'weekend' | 'week' | 'extended'
export type SortOption =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'duration_asc'
  | 'duration_desc'

export interface FilterOptions {
  searchTerm?: string
  destination?: string
  style?: YogaStyle | 'all'
  difficulty?: SkillLevel | 'all'
  minPrice?: number
  maxPrice?: number
  duration?: DurationFilter
  guestCapacity?: number
  sortBy?: SortOption
}

export function filterAndSortRetreats(
  retreats: Retreat[],
  packages: Package[],
  options: FilterOptions
): Retreat[] {
  const {
    searchTerm = '',
    style = 'all',
    difficulty = 'all',
    minPrice = 0,
    maxPrice = Infinity,
    duration = 'all',
    guestCapacity = 1,
    sortBy = 'recommended',
  } = options

  // 1. Filter only published listings for public discovery
  const filtered = retreats.filter((retreat) => {
    if (retreat.status !== 'published') return false

    // Search query: title, tagline, description, location (city, state, country, venue)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      const inTitle = retreat.title?.toLowerCase().includes(q) || false
      const inTagline = retreat.tagline?.toLowerCase().includes(q) || false
      const inDesc = retreat.description?.toLowerCase().includes(q) || false
      const inCity = retreat.location.city?.toLowerCase().includes(q) || false
      const inCountry = retreat.location.country?.toLowerCase().includes(q) || false
      const inVenue = (retreat.location.address || retreat.location.fullAddress)?.toLowerCase().includes(q) || false
      const inStyles = retreat.styles?.some((s) => s.toLowerCase().includes(q)) || false

      if (!inTitle && !inTagline && !inDesc && !inCity && !inCountry && !inVenue && !inStyles) {
        return false
      }
    }

    // Yoga style
    if (style !== 'all') {
      if (!retreat.styles.includes(style)) return false
    }

    // Difficulty / skill level
    if (difficulty !== 'all') {
      if (!retreat.skillLevels.includes(difficulty)) return false
    }

    // Price range
    if (retreat.startingPrice < minPrice) return false
    if (retreat.startingPrice > maxPrice) return false

    // Duration filter
    if (duration === 'weekend' && retreat.durationDays > 4) return false
    if (duration === 'week' && (retreat.durationDays < 5 || retreat.durationDays > 7)) return false
    if (duration === 'extended' && retreat.durationDays < 8) return false

    // Guest capacity (check retreat packages)
    if (guestCapacity > 1) {
      const retreatPkgs = packages.filter((p) => p.retreatId === retreat.id)
      const canAccommodate = retreatPkgs.some(
        (p) => p.maxOccupancy >= guestCapacity && p.remainingSpots >= guestCapacity
      )
      if (retreatPkgs.length > 0 && !canAccommodate) {
        return false
      }
    }

    return true
  })

  // 2. Sorting
  return [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.startingPrice - b.startingPrice
      case 'price_desc':
        return b.startingPrice - a.startingPrice
      case 'rating_desc':
        return b.rating - a.rating || b.reviewCount - a.reviewCount
      case 'duration_asc':
        return a.durationDays - b.durationDays
      case 'duration_desc':
        return b.durationDays - a.durationDays
      case 'recommended':
      default:
        // Featured first, then highest rating
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.rating - a.rating
    }
  })
}
