import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  HeartHandshake,
  Star,
  CheckCircle2,
  Briefcase,
  Layers,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  MessageSquare,
  BarChart3,
  Shield,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { DemoRoleSwitcher } from '@/components/navigation/DemoRoleSwitcher'
import { formatINR } from '@/utils/pricing'
import type { DemoRole } from '@/types'

export function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { retreats, setDemoRole, addToast } = useDemoStore()

  // Seed retreats: pick published ones
  const publishedRetreats = retreats
    .filter((r) => r.status === 'published')
    .slice(0, 6)

  const handlePortalEntry = (role: DemoRole, path: string, portalName: string) => {
    setDemoRole(role)
    addToast({
      title: `Switched to ${portalName}`,
      description: `You are now interacting with the live prototype as ${role}.`,
      type: 'info',
    })
    navigate(path)
  }

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f3eb] text-[#242a27]">
      {/* Top Announcement & Quick Portal Switcher Bar */}
      <div className="bg-[#193b32] text-[#f7f3eb] text-xs py-2 px-4 sm:px-8 border-b border-[#285c4d]/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#f7f3eb]/90">
            <span className="inline-block h-2 w-2 rounded-full bg-[#d6a86c] animate-pulse" />
            <span className="font-medium tracking-wide">
              The Yoga Treats &mdash; Interactive Prototype & Presentation Demo
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#f7f3eb]/60 hidden md:inline">Quick Portals:</span>
            <button
              onClick={() => handlePortalEntry('guest', '/explore', 'Guest Traveler')}
              className="hover:text-[#d6a86c] transition-colors underline decoration-[#d6a86c]/50 underline-offset-4 cursor-pointer"
            >
              Guest Marketplace
            </button>
            <span className="text-[#f7f3eb]/40">&bull;</span>
            <button
              onClick={() => handlePortalEntry('organizer', '/organizer', 'School Organizer')}
              className="hover:text-[#d6a86c] transition-colors underline decoration-[#d6a86c]/50 underline-offset-4 cursor-pointer"
            >
              School SaaS
            </button>
            <span className="text-[#f7f3eb]/40">&bull;</span>
            <button
              onClick={() => handlePortalEntry('admin', '/admin', 'Team Admin')}
              className="hover:text-[#d6a86c] transition-colors underline decoration-[#d6a86c]/50 underline-offset-4 cursor-pointer"
            >
              Admin Ops
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#f7f3eb]/95 backdrop-blur-md border-b border-[#e3ddd1] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Wordmark & Emblem */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#285c4d] text-[#f7f3eb] flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-[#d6a86c]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold tracking-tight text-[#193b32] leading-tight">
                The Yoga Treats
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#5e6b64] font-medium">
                Curated Wellness Sanctuaries
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            <Link
              to="/explore"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:text-[#285c4d] hover:bg-[#eee9df] transition-colors"
            >
              Explore Retreats
            </Link>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:text-[#285c4d] hover:bg-[#eee9df] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('platform-capabilities')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:text-[#285c4d] hover:bg-[#eee9df] transition-colors cursor-pointer"
            >
              Platform Capabilities
            </button>
            <button
              onClick={() => scrollToSection('trust-experience')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:text-[#285c4d] hover:bg-[#eee9df] transition-colors cursor-pointer"
            >
              Our Standards
            </button>
            <button
              onClick={() => scrollToSection('demo-portals')}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#285c4d] bg-[#285c4d]/10 hover:bg-[#285c4d]/15 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Demo Portals</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#d6a86c]" />
            </button>
          </nav>

          {/* Action CTAs & Switcher */}
          <div className="hidden sm:flex items-center gap-2.5">
            <DemoRoleSwitcher />

            <button
              onClick={() => scrollToSection('demo-portals')}
              className="text-xs font-semibold text-[#193b32] hover:text-[#285c4d] px-3 py-2 rounded-lg border border-[#e3ddd1] bg-white/60 hover:bg-white transition-all cursor-pointer shadow-2xs"
            >
              Demo Access
            </button>

            <Link to="/explore">
              <Button variant="default" size="sm" className="gap-2 shadow-xs font-medium">
                <Compass className="h-4 w-4" />
                <span>Explore Retreats</span>
              </Button>
            </Link>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-[#e3ddd1] text-[#242a27] hover:bg-[#eee9df] transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e3ddd1] bg-[#f7f3eb] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-lg">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:bg-[#eee9df] flex items-center justify-between"
              >
                <span>Explore Retreats</span>
                <ChevronRight className="h-4 w-4 text-[#5e6b64]" />
              </Link>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:bg-[#eee9df] flex items-center justify-between text-left"
              >
                <span>How It Works</span>
                <ChevronRight className="h-4 w-4 text-[#5e6b64]" />
              </button>
              <button
                onClick={() => scrollToSection('platform-capabilities')}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:bg-[#eee9df] flex items-center justify-between text-left"
              >
                <span>Platform Capabilities</span>
                <ChevronRight className="h-4 w-4 text-[#5e6b64]" />
              </button>
              <button
                onClick={() => scrollToSection('trust-experience')}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#242a27] hover:bg-[#eee9df] flex items-center justify-between text-left"
              >
                <span>Our Standards</span>
                <ChevronRight className="h-4 w-4 text-[#5e6b64]" />
              </button>
              <button
                onClick={() => scrollToSection('demo-portals')}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-[#193b32] bg-[#285c4d]/10 hover:bg-[#285c4d]/15 flex items-center justify-between text-left"
              >
                <span>Demo Portals Access</span>
                <ChevronRight className="h-4 w-4 text-[#193b32]" />
              </button>
            </nav>

            <div className="pt-3 border-t border-[#e3ddd1] flex flex-col gap-2">
              <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center gap-2">
                  <Compass className="h-4 w-4" />
                  Explore All Retreats
                </Button>
              </Link>
              <div className="p-2 rounded-lg bg-white/70 border border-[#e3ddd1] text-xs text-center text-[#5e6b64]">
                Interactive Presentation Demo &bull; No login required
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#e3ddd1]">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-radial from-[#ffffff] via-[#f7f3eb] to-[#eee8dd] opacity-80 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: Editorial Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="gold" size="md" className="gap-1.5 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#8b6521]" />
                  A Mindful Marketplace for Transformative Travel
                </Badge>
                <span className="text-xs text-[#5e6b64] font-medium">
                  &bull; Simulated Live Product Demo
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#193b32] leading-[1.12]">
                Find Your Space to Breathe.
              </h1>

              <p className="text-base sm:text-lg text-[#5e6b64] leading-relaxed max-w-2xl font-normal">
                Discover inspiring yoga retreats, connect with trusted retreat hosts, and find the space to reconnect with yourself. From secluded clifftop sanctuaries to alpine valleys, experience immersive wellness with full booking clarity.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link to="/explore" className="inline-block">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2.5 font-semibold shadow-sm text-sm"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Explore Retreats</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <button
                  onClick={() => scrollToSection('demo-portals')}
                  className="w-full sm:w-auto px-5 py-3 rounded-lg border border-[#285c4d]/30 bg-white/80 hover:bg-white text-[#193b32] font-semibold text-sm transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-[#285c4d]" />
                  <span>Explore Demo Portals</span>
                </button>
              </div>

              {/* Trust & Transparency Feature Pills */}
              <div className="pt-6 border-t border-[#e3ddd1]/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#5e6b64]">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d] shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#193b32] block">Verified Host Profiles</span>
                    <span>School credentials & curriculum</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d] shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#193b32] block">Intimate Cohorts</span>
                    <span>8 to 14 guests per immersion</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d] shrink-0">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#193b32] block">Direct Host Inquiries</span>
                    <span>Custom offers & instant messaging</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Curated Hero Photography Feature */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Sanctuary Card */}
                <div className="rounded-2xl overflow-hidden bg-white border border-[#e3ddd1] shadow-lg transition-transform duration-500 hover:shadow-xl">
                  <div className="relative aspect-4/3 overflow-hidden bg-[#eee9df]">
                    <img
                      src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80"
                      alt="Uluwatu Clifftop Oceanfront Sanctuary in Bali"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-[#193b32] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                        Staff Curated
                      </span>
                      <span className="bg-[#d6a86c] text-[#193b32] text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                        7 Days &bull; 6 Nights
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-white/90 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-[#d6a86c]" />
                        <span>Uluwatu, Bali, Indonesia</span>
                      </div>
                      <h3 className="font-serif text-lg font-semibold leading-snug drop-shadow-xs">
                        Prana Veda Clifftop Sanctuary
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 bg-white">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#5e6b64]">Yoga Tradition</span>
                      <span className="font-semibold text-[#193b32] bg-[#285c4d]/10 px-2 py-0.5 rounded">
                        Vinyasa &bull; Yin &bull; Sound Healing
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#e3ddd1]">
                      <div>
                        <span className="text-[#5e6b64] block text-[10px] uppercase tracking-wider">
                          From
                        </span>
                        <span className="font-serif text-lg font-bold text-[#193b32]">
                          {formatINR(135000)}
                        </span>
                        <span className="text-[#5e6b64]"> / guest</span>
                      </div>

                      <div className="flex items-center gap-1 bg-[#f7f3eb] px-2.5 py-1 rounded-md border border-[#e3ddd1]">
                        <Star className="h-3.5 w-3.5 fill-[#d6a86c] text-[#d6a86c]" />
                        <span className="font-semibold text-xs text-[#193b32]">4.95</span>
                        <span className="text-[#5e6b64] text-[11px]">(38 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlaid Float Tag */}
                <div className="absolute -bottom-4 -left-4 bg-[#193b32] text-white p-3.5 rounded-xl shadow-lg border border-[#285c4d] hidden sm:flex items-center gap-3 max-w-xs">
                  <div className="h-9 w-9 rounded-lg bg-[#d6a86c]/20 flex items-center justify-center text-[#d6a86c] shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block leading-tight">
                      Simulated Booking Flow
                    </span>
                    <span className="text-[10px] text-white/70">
                      Step-by-step guest checkout, receipts & cancellations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Retreats Section */}
      <section className="py-20 bg-white border-b border-[#e3ddd1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-6 bg-[#d6a86c] rounded-full" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#285c4d]">
                  Curated Sanctuaries
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#193b32]">
                Featured Retreat Immersions
              </h2>
              <p className="text-sm text-[#5e6b64] mt-2 max-w-xl">
                Real listings seeded directly from our shared prototype store. Explore actual daily schedules, teacher credentials, and package tiers.
              </p>
            </div>

            <Link to="/explore">
              <Button variant="outline" className="gap-2 text-xs font-semibold text-[#193b32]">
                <span>Browse All Retreats</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedRetreats.map((retreat) => (
              <Card
                key={retreat.id}
                hoverEffect
                className="overflow-hidden flex flex-col group border-[#e3ddd1] bg-[#fdfcf9]"
              >
                {/* Retreat Image Card Header */}
                <div className="relative aspect-16/10 overflow-hidden bg-[#eee9df]">
                  <img
                    src={retreat.heroImage}
                    alt={retreat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <Badge variant="forest" size="sm">
                      {retreat.durationDays} Days &bull; {retreat.durationNights} Nights
                    </Badge>
                    {retreat.featured && (
                      <Badge variant="gold" size="sm">
                        Curated Pick
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-medium drop-shadow-xs">
                      <MapPin className="h-3.5 w-3.5 text-[#d6a86c]" />
                      {retreat.location.city}, {retreat.location.country}
                    </span>
                    {retreat.rating && (
                      <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full font-medium">
                        <Star className="h-3 w-3 fill-[#d6a86c] text-[#d6a86c]" />
                        {retreat.rating} ({retreat.reviewCount})
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex gap-1.5 flex-wrap mb-2.5">
                      {retreat.styles.slice(0, 3).map((st) => (
                        <span
                          key={st}
                          className="text-[11px] font-medium text-[#285c4d] bg-[#285c4d]/10 px-2 py-0.5 rounded-md"
                        >
                          {st}
                        </span>
                      ))}
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-[#193b32] group-hover:text-[#285c4d] transition-colors line-clamp-1">
                      {retreat.title}
                    </h3>
                    <p className="text-xs text-[#5e6b64] line-clamp-2 mt-1 leading-relaxed">
                      {retreat.tagline}
                    </p>
                  </div>

                  {/* Pricing & View Details */}
                  <div className="pt-3 border-t border-[#e3ddd1] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#5e6b64] block font-medium">
                        Starting from
                      </span>
                      <span className="text-base font-bold text-[#193b32] font-serif">
                        {formatINR(retreat.startingPrice)}
                      </span>
                      <span className="text-xs text-[#5e6b64]"> / guest</span>
                    </div>

                    <Link to={`/retreats/${retreat.id}`}>
                      <Button size="sm" variant="default" className="gap-1.5 font-medium text-xs">
                        <span>View Retreat</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#f7f3eb] border-b border-[#e3ddd1] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#285c4d]">
              <span className="h-1.5 w-6 bg-[#d6a86c] rounded-full" />
              Mindful Travel Experience
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#193b32]">
              How The Yoga Treats Works
            </h2>
            <p className="text-sm text-[#5e6b64] leading-relaxed">
              Designed to connect intentional practitioners with accredited sanctuaries through transparent, supportive workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-[#e3ddd1] shadow-2xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-[#285c4d]/10 text-[#285c4d] flex items-center justify-center font-serif text-xl font-bold">
                  01
                </div>
                <Compass className="h-6 w-6 text-[#d6a86c]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#193b32]">
                Discover Immersions
              </h3>
              <p className="text-xs sm:text-sm text-[#5e6b64] leading-relaxed">
                Filter sanctuaries worldwide by yoga lineage, difficulty, duration, room tier, and retreat dates. Inspect verified teacher credentials and daily itineraries.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#285c4d] flex items-center gap-1">
                <span>Multi-parameter filtering & maps</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-[#e3ddd1] shadow-2xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-[#285c4d]/10 text-[#285c4d] flex items-center justify-center font-serif text-xl font-bold">
                  02
                </div>
                <MessageSquare className="h-6 w-6 text-[#d6a86c]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#193b32]">
                Connect & Select Packages
              </h3>
              <p className="text-xs sm:text-sm text-[#5e6b64] leading-relaxed">
                Reach out directly to school organizers with dietary questions, request private consultations, or receive personalized custom offers tailored to your journey.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#285c4d] flex items-center gap-1">
                <span>Direct host communication</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-[#e3ddd1] shadow-2xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-[#285c4d]/10 text-[#285c4d] flex items-center justify-center font-serif text-xl font-bold">
                  03
                </div>
                <CreditCard className="h-6 w-6 text-[#d6a86c]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#193b32]">
                Simulate Your Reservation
              </h3>
              <p className="text-xs sm:text-sm text-[#5e6b64] leading-relaxed">
                Test the end-to-end checkout with transparent room deposits, wellness add-ons, installment tracking, and digital receipt generation without real charges.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#285c4d] flex items-center gap-1">
                <span>Transparent receipts & policies</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities Section */}
      <section id="platform-capabilities" className="py-20 bg-white border-b border-[#e3ddd1] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#285c4d]">
              <span className="h-1.5 w-6 bg-[#d6a86c] rounded-full" />
              End-to-End Functional Architecture
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#193b32]">
              Real Capabilities in This Live Demo
            </h2>
            <p className="text-sm text-[#5e6b64] leading-relaxed">
              Every workflow below is fully implemented in the frontend application using a persistent reactive state store. No placeholder mocks or fake screens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Capability 1 */}
            <div className="p-6 rounded-xl border border-[#e3ddd1] bg-[#fbf9f5] hover:border-[#285c4d]/50 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d]">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#193b32]">
                Discovery & Multi-parameter Filters
              </h3>
              <p className="text-xs text-[#5e6b64] leading-relaxed">
                Real-time search across 7 yoga styles, 4 difficulty levels, price thresholds, duration ranges, and guest capacity limits with interactive sorting.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="p-6 rounded-xl border border-[#e3ddd1] bg-[#fbf9f5] hover:border-[#285c4d]/50 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d]">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#193b32]">
                Package Selection & Simulated Checkout
              </h3>
              <p className="text-xs text-[#5e6b64] leading-relaxed">
                Choose single or shared room packages, configure Ayurvedic add-on treatments, review tax breakdowns, and generate simulated booking records.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="p-6 rounded-xl border border-[#e3ddd1] bg-[#fbf9f5] hover:border-[#285c4d]/50 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#193b32]">
                Custom Offers & Host Inquiries
              </h3>
              <p className="text-xs text-[#5e6b64] leading-relaxed">
                School organizers can read guest inquiries, formulate custom discount offers with expiration windows, and guests can review and accept them.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="p-6 rounded-xl border border-[#e3ddd1] bg-[#fbf9f5] hover:border-[#285c4d]/50 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d]">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#193b32]">
                Organizer Listing Builder Wizard
              </h3>
              <p className="text-xs text-[#5e6b64] leading-relaxed">
                Step-by-step retreat publishing wizard including itinerary builders, multi-tier package definitions, room photos, and instant status updates.
              </p>
            </div>

            {/* Capability 5 */}
            <div className="p-6 rounded-xl border border-[#e3ddd1] bg-[#fbf9f5] hover:border-[#285c4d]/50 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d]">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#193b32]">
                Review Moderation & Verification Hub
              </h3>
              <p className="text-xs text-[#5e6b64] leading-relaxed">
                Admin workflows for reviewing pending listings, verifying organizer teacher credentials and certifications, and approving verified reviews.
              </p>
            </div>

            {/* Capability 6 */}
            <div className="p-6 rounded-xl border border-[#e3ddd1] bg-[#fbf9f5] hover:border-[#285c4d]/50 transition-colors space-y-3">
              <div className="h-10 w-10 rounded-lg bg-[#285c4d]/10 flex items-center justify-center text-[#285c4d]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-base font-semibold text-[#193b32]">
                Financial Reporting & Payouts
              </h3>
              <p className="text-xs text-[#5e6b64] leading-relaxed">
                Inspect platform gross booking volume, commission take rates, simulated host bank payouts, refund processing, and financial transaction ledgers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Experience Section */}
      <section id="trust-experience" className="py-20 bg-[#f7f3eb] border-b border-[#e3ddd1] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#285c4d]">
                <span className="h-1.5 w-6 bg-[#d6a86c] rounded-full" />
                Ethical Wellness Principles
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#193b32]">
                Built for Clarity, Stillness, and Trust
              </h2>
              <p className="text-sm text-[#5e6b64] leading-relaxed">
                We believe wellness travel demands an elevated standard of transparency. By presenting realistic, grounded operational details, our marketplace respects both practitioners and retreat hosts.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#285c4d] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#193b32]">Clear Package Inclusions</h4>
                    <p className="text-xs text-[#5e6b64] leading-relaxed">
                      Every retreat explicitly lists meals, room categories, airport transfer availability, and yoga supplies without unexpected on-site costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#285c4d] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#193b32]">Full Booking & Policy Visibility</h4>
                    <p className="text-xs text-[#5e6b64] leading-relaxed">
                      Instant reservation tracking, step-by-step cancellation refund calculators, and transparent terms for deposits and installments.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#285c4d] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#193b32]">Operational Host Tools</h4>
                    <p className="text-xs text-[#5e6b64] leading-relaxed">
                      Sanctuaries maintain control over their guest roster, availability dates, inquiries, and payout records through a unified SaaS dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e3ddd1] shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#e3ddd1]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#285c4d]" />
                    <span className="font-serif text-lg font-semibold text-[#193b32]">
                      Transparent Demo Financial Breakdown
                    </span>
                  </div>
                  <Badge variant="gold" size="sm">
                    Simulated Ledger
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e3ddd1]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5e6b64] block mb-1">
                      Gross Retreat Value
                    </span>
                    <span className="font-serif text-xl font-bold text-[#193b32]">
                      100% Invoiced
                    </span>
                    <p className="text-[11px] text-[#5e6b64] mt-1">
                      Includes room package, taxes, and chosen wellness add-ons.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e3ddd1]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5e6b64] block mb-1">
                      Platform Take-Rate
                    </span>
                    <span className="font-serif text-xl font-bold text-[#285c4d]">
                      10% Commission
                    </span>
                    <p className="text-[11px] text-[#5e6b64] mt-1">
                      Covers guest matching, messaging infrastructure & moderation.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e3ddd1]">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5e6b64] block mb-1">
                      Organizer Payout
                    </span>
                    <span className="font-serif text-xl font-bold text-[#193b32]">
                      90% Direct Disbursal
                    </span>
                    <p className="text-[11px] text-[#5e6b64] mt-1">
                      Simulated wire transfer after guest check-in verification.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#285c4d]/5 border border-[#285c4d]/20 text-xs text-[#285c4d] leading-relaxed">
                  <strong>Demo Notice:</strong> All booking transactions, payout triggers, and refund operations executed in this prototype are processed within the reactive demo store and do not charge real payment cards.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Portal Access Section */}
      <section id="demo-portals" className="py-20 bg-[#193b32] text-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#d6a86c]">
              <Sparkles className="h-3.5 w-3.5" />
              Live Interactive Walkthrough
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Explore Demo Portals
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Step into any of the three distinct platform personas. Your actions will update live data across the shared prototype state.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Guest Marketplace */}
            <div className="rounded-2xl bg-white/5 border border-white/15 p-7 flex flex-col justify-between hover:bg-white/10 transition-all hover:border-[#d6a86c]/40 group shadow-lg">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#285c4d] border border-white/20 flex items-center justify-center text-[#d6a86c]">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d6a86c]">
                      Persona 1
                    </span>
                    <Badge variant="gold" size="sm">
                      Marketplace
                    </Badge>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    Guest Marketplace
                  </h3>
                </div>
                <p className="text-xs text-white/75 leading-relaxed">
                  Discover immersive retreats worldwide, compare multi-tier room options, send host inquiries, and test the simulated booking checkout.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>Multi-parameter retreat search & filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>Simulated booking flow with add-ons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>My Bookings dashboard & cancellation quote</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10">
                <Button
                  onClick={() => handlePortalEntry('guest', '/explore', 'Guest Traveler')}
                  className="w-full justify-center gap-2 font-semibold bg-[#285c4d] hover:bg-[#347563] text-white"
                >
                  <span>Enter Guest Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Card 2: School Organizer */}
            <div className="rounded-2xl bg-white/5 border border-white/15 p-7 flex flex-col justify-between hover:bg-white/10 transition-all hover:border-[#d6a86c]/40 group shadow-lg">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#285c4d] border border-white/20 flex items-center justify-center text-[#d6a86c]">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d6a86c]">
                      Persona 2
                    </span>
                    <Badge variant="gold" size="sm">
                      SaaS Portal
                    </Badge>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    School Organizer
                  </h3>
                </div>
                <p className="text-xs text-white/75 leading-relaxed">
                  Operate as Prana Veda Sanctuary. Manage retreat listings, respond to guest inquiries, generate custom discounted offers, and check bookings.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>Listing builder with multi-tier packages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>Inquiry inbox & custom offer generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>Guest roster & booking status management</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10">
                <Button
                  onClick={() => handlePortalEntry('organizer', '/organizer', 'School Organizer')}
                  className="w-full justify-center gap-2 font-semibold bg-[#d6a86c] hover:bg-[#c4975c] text-[#193b32]"
                >
                  <span>Enter Organizer Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Card 3: Team Admin */}
            <div className="rounded-2xl bg-white/5 border border-white/15 p-7 flex flex-col justify-between hover:bg-white/10 transition-all hover:border-[#d6a86c]/40 group shadow-lg">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#285c4d] border border-white/20 flex items-center justify-center text-[#d6a86c]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#d6a86c]">
                      Persona 3
                    </span>
                    <Badge variant="gold" size="sm">
                      Operations Hub
                    </Badge>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    Team Admin
                  </h3>
                </div>
                <p className="text-xs text-white/75 leading-relaxed">
                  Oversee marketplace operations. Moderate newly submitted retreat listings, verify organizer credentials, audit reviews, and execute payouts.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-white/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>Listing moderation & revision feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>School verification & document review</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#d6a86c] shrink-0" />
                    <span>Financial ledger & simulated payout control</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10">
                <Button
                  onClick={() => handlePortalEntry('admin', '/admin', 'Team Admin')}
                  className="w-full justify-center gap-2 font-semibold bg-white/90 hover:bg-white text-[#193b32]"
                >
                  <span>Enter Admin Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Persona Switch Notice */}
          <div className="mt-12 text-center text-xs text-white/60">
            <span>
              Tip: You can switch roles at any point from within the app using the Demo Role Switcher at the top of every page.
            </span>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="bg-[#242a27] text-white pt-16 pb-12 border-t border-[#193b32]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            {/* Brand identity column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#285c4d] text-[#f7f3eb] flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-[#d6a86c]" />
                </div>
                <span className="font-serif text-2xl font-semibold tracking-tight text-white">
                  The Yoga Treats
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed max-w-sm">
                A curated marketplace uniting wellness travelers with verified yoga sanctuaries and accredited retreat hosts worldwide. Designed for mindful practice, deep stillness, and transparent community connection.
              </p>
              <div className="text-xs text-[#d6a86c] font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#d6a86c]" />
                <span>Frontend Presentation Demo Environment</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-3">
                Marketplace
              </h4>
              <ul className="space-y-2 text-xs text-white/75">
                <li>
                  <Link to="/explore" className="hover:text-[#d6a86c] transition-colors">
                    Explore Retreats
                  </Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-[#d6a86c] transition-colors">
                    Vinyasa Immersions
                  </Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-[#d6a86c] transition-colors">
                    Alpine Yin Retreats
                  </Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-[#d6a86c] transition-colors">
                    Ayurvedic Sanctuaries
                  </Link>
                </li>
                <li>
                  <Link to="/account/bookings" className="hover:text-[#d6a86c] transition-colors">
                    Guest Booking Receipts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Platform & Tour */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-3">
                About & Tour
              </h4>
              <ul className="space-y-2 text-xs text-white/75">
                <li>
                  <button
                    onClick={() => scrollToSection('how-it-works')}
                    className="hover:text-[#d6a86c] transition-colors text-left"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('platform-capabilities')}
                    className="hover:text-[#d6a86c] transition-colors text-left"
                  >
                    Platform Capabilities
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('trust-experience')}
                    className="hover:text-[#d6a86c] transition-colors text-left"
                  >
                    Our Standards
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('demo-portals')}
                    className="hover:text-[#d6a86c] transition-colors text-left"
                  >
                    Demo Portal Access
                  </button>
                </li>
              </ul>
            </div>

            {/* Demo Portals */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-3">
                Demo Portals
              </h4>
              <ul className="space-y-2 text-xs text-white/75">
                <li>
                  <button
                    onClick={() => handlePortalEntry('guest', '/explore', 'Guest Traveler')}
                    className="hover:text-[#d6a86c] transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>Guest Marketplace</span>
                    <ArrowRight className="h-3 w-3 text-[#d6a86c]" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handlePortalEntry('organizer', '/organizer', 'School Organizer')}
                    className="hover:text-[#d6a86c] transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>School Organizer SaaS</span>
                    <ArrowRight className="h-3 w-3 text-[#d6a86c]" />
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handlePortalEntry('admin', '/admin', 'Team Admin')}
                    className="hover:text-[#d6a86c] transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>Team Admin Hub</span>
                    <ArrowRight className="h-3 w-3 text-[#d6a86c]" />
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal / Simulation Disclaimer */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <p className="max-w-2xl text-center md:text-left leading-relaxed">
              <strong>Simulated Demonstration Prototype:</strong> Bookings, payment card charges, receipts, cancellation refunds, host payouts, notifications, and school credentials presented on this platform are simulated for product demonstration purposes. No real monetary transactions or binding travel agreements are executed.
            </p>
            <div className="shrink-0 text-center md:text-right">
              &copy; 2026 The Yoga Treats. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
