import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { YogaStyle, SkillLevel } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

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
  const retreats = useDemoStore((s) => s.retreats)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<YogaStyle | 'all'>('all')
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | 'all'>('all')
  const [maxPrice, setMaxPrice] = useState<number>(3500)

  const filteredRetreats = useMemo(() => {
    return retreats.filter((retreat) => {
      // Must be published in guest view
      if (retreat.status !== 'published') return false

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchesTitle = retreat.title.toLowerCase().includes(query)
        const matchesLocation = `${retreat.location.city} ${retreat.location.country}`
          .toLowerCase()
          .includes(query)
        const matchesStyle = retreat.styles.some((s) => s.toLowerCase().includes(query))
        if (!matchesTitle && !matchesLocation && !matchesStyle) return false
      }

      // Style filter
      if (selectedStyle !== 'all') {
        if (!retreat.styles.includes(selectedStyle)) return false
      }

      // Skill level filter
      if (selectedSkill !== 'all') {
        if (!retreat.skillLevels.includes(selectedSkill)) return false
      }

      // Price filter
      if (retreat.startingPrice > maxPrice) return false

      return true
    })
  }, [retreats, searchTerm, selectedStyle, selectedSkill, maxPrice])

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedStyle('all')
    setSelectedSkill('all')
    setMaxPrice(3500)
  }

  const hasActiveFilters =
    searchTerm !== '' || selectedStyle !== 'all' || selectedSkill !== 'all' || maxPrice < 3500

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

      {/* Filter & Search Bar */}
      <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-xs space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by destination (e.g. Bali, Swiss Alps, Japan), retreat title, or practice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Filter chips rows */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* Style Chips */}
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

          {/* Skill Level & Reset */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Level:
              </span>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value as SkillLevel | 'all')}
                className="text-xs rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Any Level</option>
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-muted-foreground hover:text-foreground h-8 gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
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
                      ${retreat.startingPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground"> / guest</span>
                  </div>

                  <Link to={`/retreats/${retreat.id}`}>
                    <Button size="sm" variant="default" className="gap-1.5 font-medium">
                      View Retreat
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
