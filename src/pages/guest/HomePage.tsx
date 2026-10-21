import { Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  HeartHandshake,
  Star,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export function HomePage() {
  const navigate = useNavigate()
  const retreats = useDemoStore((s) => s.retreats)
  const publishedRetreats = retreats.filter((r) => r.status === 'published')

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/60 bg-gradient-to-b from-[#f7f4ee] to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <Badge variant="gold" size="md" className="gap-1.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Handpicked Holistic Retreats Worldwide
            </Badge>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.12]">
              Awaken your practice in the world's most peaceful sanctuaries.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Discover authentic yoga journeys led by vetted masters. From Uluwatu clifftop flows to silent Swiss alpine monasteries, reserve your place with mindful confidence.
            </p>

            {/* Quick Discovery search card */}
            <div className="pt-2">
              <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border shadow-md flex flex-col md:flex-row items-stretch gap-3">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 border border-border/60">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Destination
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate block">
                      Bali, Switzerland, Morocco, Japan...
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 border border-border/60">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Experience
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate block">
                      Vinyasa, Yin, Silence, Sound
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => navigate('/explore')}
                  className="gap-2 shadow-sm font-semibold shrink-0"
                >
                  <Compass className="h-4 w-4" />
                  <span>Discover Retreats</span>
                </Button>
              </div>
            </div>

            {/* Trust stats */}
            <div className="pt-4 flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Verified school accreditation</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Intimate cohorts (8-14 guests)</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-primary" />
                <span>Direct school messaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient subtle decorative element */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-4/5 opacity-10 pointer-events-none hidden xl:block">
          <div className="w-full h-full rounded-l-full bg-gradient-to-l from-primary/30 to-transparent blur-3xl" />
        </div>
      </section>

      {/* Featured Retreats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent block mb-1">
              Curated Selections
            </span>
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
              Featured Immersions
            </h2>
          </div>
          <Link to="/explore">
            <Button variant="ghost" className="gap-1.5 text-xs text-primary font-semibold">
              Browse all destinations <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedRetreats.map((retreat) => (
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
                      Staff Pick
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
                    <Button size="sm" variant="outline" className="gap-1.5 font-medium">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Philosophy / Value Banner */}
      <section className="bg-secondary/40 border-y border-border/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              The Conscious Standard
            </span>
            <h2 className="font-serif text-3xl font-semibold text-foreground">
              Built specifically for mindful practice
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlike generic travel booking engines, every listing on The Yoga Treats undergoes verified school inspection and curriculum review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Verified Credentials
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We independently verify teacher certifications, Yoga Alliance accreditations, and safety standards before any retreat opens for bookings.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Intimate Group Sizes
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cohorts capped at 8 to 14 participants ensure personal instructor guidance, hands-on adjustments, and genuine community bonding.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border space-y-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground">
                Direct School Communication
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chat directly with retreat hosts before reserving. Ask about dietary preferences, schedule intensity, or airport transfers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* School Organizer Invitation CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#1a382c] text-white p-8 sm:p-12 relative overflow-hidden shadow-lg">
          <div className="max-w-2xl space-y-4 relative z-10">
            <Badge variant="gold" size="sm">
              For Yoga Teachers & Sanctuaries
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Host your next immersion with The Yoga Treats
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Showcase your upcoming retreats to a dedicated global audience of wellness seekers. Manage guest packages, enquiries, and payouts in one unified SaaS portal.
            </p>
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <Link to="/organizer">
                <Button variant="gold" size="lg" className="font-semibold text-xs sm:text-sm">
                  Explore Organizer Portal
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10 text-xs sm:text-sm">
                  Browse Public Listings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
