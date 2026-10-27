import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  ArrowRight,
  RotateCcw,
  Compass,
  X,
  Filter,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { YogaStyle, SkillLevel, Retreat } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatINR } from '@/utils/pricing'
import {
  filterAndSortRetreats,
  type DurationFilter,
  type SortOption,
} from '@/utils/search'
import { RetreatLocationModal } from '@/components/discovery/RetreatLocationModal'

const STYLES: YogaStyle[] = [
  'Vinyasa',
  'Hatha',
  'Yin',
  'Sound Healing',
  'Meditation',
  'Restorative',
  'Ayurveda',
]

const SKILL_LEVELS: SkillLevel[] = [
  'All Levels',
  'Beginner',
  'Intermediate',
  'Advanced',
]

export function ExplorePage() {
  const { retreats, packages } = useDemoStore()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<YogaStyle | 'all'>('all')
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | 'all'>('all')
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(500000)
  const [duration, setDuration] = useState<DurationFilter>('all')
  const [guestCapacity, setGuestCapacity] = useState<number>(1)
  const [sortBy, setSortBy] = useState<SortOption>('recommended')

  // Mobile drawer & Coordinate modal
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedRetreatForModal, setSelectedRetreatForModal] = useState<Retreat | null>(null)

  // Memoized filter and sort results
  const filteredRetreats = useMemo(() => {
    return filterAndSortRetreats(retreats, packages, {
      searchTerm,
      style: selectedStyle,
      difficulty: selectedSkill,
      minPrice,
      maxPrice,
      duration,
      guestCapacity,
      sortBy,
    })
  }, [retreats, packages, searchTerm, selectedStyle, selectedSkill, minPrice, maxPrice, duration, guestCapacity, sortBy])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedStyle('all')
    setSelectedSkill('all')
    setMinPrice(0)
    setMaxPrice(500000)
    setDuration('all')
    setGuestCapacity(1)
    setSortBy('recommended')
  }

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (selectedStyle !== 'all' ? 1 : 0) +
    (selectedSkill !== 'all' ? 1 : 0) +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < 500000 ? 1 : 0) +
    (duration !== 'all' ? 1 : 0) +
    (guestCapacity > 1 ? 1 : 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Explore Sanctuaries & Immersions"
        description="Filter through our hand-curated catalog of verified yoga retreats and holistic nature sanctuaries worldwide."
        badge={
          <Badge variant="gold" size="sm">
            {filteredRetreats.length} Sanctuaries Found
          </Badge>
        }
      />

      {/* Main Filter & Search Hub */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-xs space-y-5">
        {/* Search input + Mobile toggle + Sort */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by destination (e.g. Bali, Switzerland, Gokarna), retreat title, or practice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 text-xs rounded-xl border border-border bg-card px-3 py-2 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="recommended">Recommended & Featured</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_asc">Duration: Shortest</option>
              <option value="duration_desc">Duration: Longest</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-secondary/50 text-xs font-semibold text-foreground"
            >
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="h-4.5 w-4.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar (Visible on desktop, collapsible on mobile) */}
        <div
          className={`${
            mobileFiltersOpen ? 'block' : 'hidden'
          } lg:block space-y-4 pt-2 border-t border-border/60`}
        >
          {/* Yoga Style pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Style:
            </span>
            <button
              onClick={() => setSelectedStyle('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStyle === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-secondary/70 text-foreground hover:bg-secondary'
              }`}
            >
              All Styles
            </button>
            {STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedStyle === style
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-secondary/70 text-foreground hover:bg-secondary'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Secondary Filter Row: Level, Duration, Capacity, Max Price */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Difficulty Level */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Difficulty
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as SkillLevel | 'all')}
                className="w-full text-xs rounded-lg border border-border bg-secondary/30 px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Any Level</option>
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as DurationFilter)}
                className="w-full text-xs rounded-lg border border-border bg-secondary/30 px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Any Length</option>
                <option value="weekend">Short (≤ 4 Days)</option>
                <option value="week">Weeklong (5–7 Days)</option>
                <option value="extended">Extended (8+ Days)</option>
              </select>
            </div>

            {/* Guests Capacity */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Guest Capacity
              </label>
              <select
                value={guestCapacity}
                onChange={(e) => setGuestCapacity(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-border bg-secondary/30 px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={1}>1+ Guest</option>
                <option value={2}>2+ Guests</option>
                <option value={3}>3+ Guests</option>
              </select>
            </div>

            {/* Max Price Range */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Budget Cap
                </label>
                <span className="text-[11px] font-semibold text-primary">
                  {maxPrice >= 500000 ? 'Any' : formatINR(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={500000}
                step={25000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Clear Action */}
        {activeFilterCount > 0 && (
          <div className="pt-2 border-t border-border/40 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground text-[11px]">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px]">
                  Keyword: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')}>
                    <X className="h-3 w-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {selectedStyle !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px]">
                  Style: {selectedStyle}
                  <button onClick={() => setSelectedStyle('all')}>
                    <X className="h-3 w-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {selectedSkill !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px]">
                  Level: {selectedSkill}
                  <button onClick={() => setSelectedSkill('all')}>
                    <X className="h-3 w-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {duration !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px]">
                  Duration: {duration}
                  <button onClick={() => setDuration('all')}>
                    <X className="h-3 w-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {guestCapacity > 1 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px]">
                  Guests: {guestCapacity}+
                  <button onClick={() => setGuestCapacity(1)}>
                    <X className="h-3 w-3 hover:text-red-500" />
                  </button>
                </span>
              )}
              {maxPrice < 500000 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px]">
                  Under {formatINR(maxPrice)}
                  <button onClick={() => setMaxPrice(500000)}>
                    <X className="h-3 w-3 hover:text-red-500" />
                  </button>
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-7 gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Retreats Results Grid */}
      {filteredRetreats.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No sanctuaries matched your search"
          description="Try relaxing your filters or search keywords to view other restorative retreats across our global destinations."
          action={
            <Button onClick={handleResetFilters} variant="outline" size="sm">
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRetreats.map((retreat) => (
            <Card
              key={retreat.id}
              hoverEffect
              className="overflow-hidden flex flex-col group border-border/80"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-secondary">
                <img
                  src={retreat.heroImage}
                  alt={retreat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <Badge variant="forest" size="sm">
                    {retreat.durationDays} Days &bull; {retreat.durationNights} Nights
                  </Badge>
                  {retreat.featured && (
                    <Badge variant="gold" size="sm">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedRetreatForModal(retreat)
                    }}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] flex items-center gap-1 transition-colors border border-white/20"
                    title="View venue coordinates"
                  >
                    <Compass className="h-3.5 w-3.5 text-accent" />
                    <span className="hidden sm:inline pr-1">GPS</span>
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="flex items-center gap-1 font-medium drop-shadow-xs">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {retreat.location.city}, {retreat.location.country}
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    {retreat.rating} ({retreat.reviewCount})
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {retreat.styles.slice(0, 3).map((st) => (
                      <span
                        key={st}
                        className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md"
                      >
                        {st}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {retreat.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {retreat.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                      Starting from
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {formatINR(retreat.startingPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground"> / guest</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRetreatForModal(retreat)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                      title="Inspect coordinates"
                    >
                      <Compass className="h-3.5 w-3.5" />
                    </Button>

                    <Link to={`/retreats/${retreat.id}`}>
                      <Button size="sm" variant="default" className="gap-1.5 font-medium h-8">
                        View Sanctuary
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Coordinate & Location Modal */}
      <RetreatLocationModal
        retreat={selectedRetreatForModal}
        isOpen={selectedRetreatForModal !== null}
        onClose={() => setSelectedRetreatForModal(null)}
      />
    </div>
  )
}
