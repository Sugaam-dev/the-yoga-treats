import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Compass,
  CalendarCheck,
  Sparkles,
  Heart,
  Globe2,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { DemoRoleSwitcher } from '@/components/navigation/DemoRoleSwitcher'
import { Button } from '@/components/ui/Button'
import { useDemoStore } from '@/store/useDemoStore'
import { cn } from '@/lib/utils'

export function GuestLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const guest = useDemoStore((s) => s.guest)
  const bookings = useDemoStore((s) => s.bookings)
  const myBookingsCount = bookings.filter((b) => b.guestId === guest.id).length

  const navLinks = [
    { label: 'Explore Retreats', href: '/explore', icon: Compass },
    {
      label: 'My Bookings',
      href: '/account/bookings',
      icon: CalendarCheck,
      badge: myBookingsCount > 0 ? myBookingsCount : undefined,
    },
  ]

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/15 selection:text-primary">
      {/* Top micro-bar */}
      <div className="bg-[#18392d] text-sand-50 text-xs py-1.5 px-4 sm:px-8 border-b border-[#285342]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="font-medium tracking-wide">
              Hand-selected yoga sanctuaries & holistic immersions worldwide
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-white/80">
            <Link
              to="/organizer"
              className="hover:text-white transition-colors underline decoration-white/40 underline-offset-4"
            >
              School Portal
            </Link>
            <span className="opacity-40">&bull;</span>
            <Link
              to="/admin"
              className="hover:text-white transition-colors underline decoration-white/40 underline-offset-4"
            >
              Admin Ops
            </Link>
          </div>
        </div>
      </div>

      {/* Main Guest Navigation */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <Sparkles className="h-4.5 w-4.5 text-accent group-hover:text-accent-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-primary">
                The Yoga Treats
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium -mt-1">
                Mindful Retreats
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive('/') && location.pathname === '/'
                  ? 'text-primary bg-secondary/80 font-semibold'
                  : 'text-foreground/80 hover:text-foreground hover:bg-secondary/50'
              )}
            >
              Home
            </Link>
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                    active
                      ? 'text-primary bg-secondary/80 font-semibold'
                      : 'text-foreground/80 hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  {link.label}
                  {link.badge && (
                    <span className="inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Demo Role Switcher */}
            <DemoRoleSwitcher />

            {/* Guest Profile pill */}
            <Link
              to="/account/bookings"
              className="hidden lg:flex items-center gap-2 p-1.5 pl-2 rounded-full border border-border/80 hover:bg-secondary/60 transition-colors"
            >
              <span className="text-xs font-medium text-foreground">{guest.name}</span>
              <img
                src={guest.avatarUrl}
                alt={guest.name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-primary/20"
              />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-secondary"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 pt-2 pb-5 space-y-2 animate-in slide-in-from-top-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-md text-sm font-medium',
                location.pathname === '/' ? 'bg-secondary font-semibold text-primary' : 'text-foreground'
              )}
            >
              Home
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium',
                  location.pathname.startsWith(link.href) ? 'bg-secondary font-semibold text-primary' : 'text-foreground'
                )}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <img
                  src={guest.avatarUrl}
                  alt={guest.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="text-xs font-medium">{guest.name}</span>
              </div>
              <Link
                to="/account/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-primary font-medium underline"
              >
                View Account
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Portal View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-[#142820] text-sand-100 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="font-serif text-lg font-bold text-white">
                  The Yoga Treats
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                A conscious marketplace dedicated to transformative retreat experiences, certified schools, and serene wellness travel.
              </p>
              <div className="flex items-center gap-2 text-xs text-accent pt-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Independently verified schools</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 mb-3">
                Sanctuary Portals
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Marketplace Home
                  </Link>
                </li>
                <li>
                  <Link to="/explore" className="hover:text-white transition-colors">
                    Retreat Discovery
                  </Link>
                </li>
                <li>
                  <Link to="/account/bookings" className="hover:text-white transition-colors">
                    Guest Bookings
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 mb-3">
                For Schools & Hosts
              </h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li>
                  <Link to="/organizer" className="hover:text-white transition-colors">
                    Organizer Portal Overview
                  </Link>
                </li>
                <li>
                  <Link to="/organizer/listings" className="hover:text-white transition-colors">
                    List Your Retreat
                  </Link>
                </li>
                <li>
                  <Link to="/organizer/bookings" className="hover:text-white transition-colors">
                    Guest Management
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/90 mb-3">
                Demo Controls
              </h4>
              <p className="text-xs text-white/60 mb-3 leading-relaxed">
                Switch perspective anytime via the role selector bar in the header or jump to the operations dashboard.
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/admin">
                  <Button variant="subtle" size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white text-xs border border-white/15">
                    Team Admin Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-3">
            <p>&copy; 2025 The Yoga Treats. Interactive frontend demo.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Globe2 className="h-3.5 w-3.5 text-accent" />
                Vite + React + Tailwind + Zustand
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                Crafted for wellness seekers
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
