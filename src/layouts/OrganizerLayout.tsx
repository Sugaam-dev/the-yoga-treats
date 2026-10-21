import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  CalendarCheck,
  MessageSquareText,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  BadgeCheck,
  MapPin,
  ArrowLeft,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { DemoRoleSwitcher } from '@/components/navigation/DemoRoleSwitcher'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function OrganizerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { organizers, activeOrganizerId, inquiries, bookings } = useDemoStore()

  const currentOrg =
    organizers.find((o) => o.id === activeOrganizerId) || organizers[0]

  const orgInquiries = inquiries.filter((inq) => inq.organizerId === currentOrg.id)
  const unreadInquiriesCount = orgInquiries.filter((inq) => inq.unreadByOrganizer).length
  const orgBookingsCount = bookings.filter((b) => b.organizerId === currentOrg.id).length

  const navItems = [
    {
      title: 'Dashboard Overview',
      href: '/organizer',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Retreat Listings',
      href: '/organizer/listings',
      icon: Layers,
      badge: currentOrg.activeListingsCount.toString(),
    },
    {
      title: 'Guest Bookings',
      href: '/organizer/bookings',
      icon: CalendarCheck,
      badge: orgBookingsCount > 0 ? orgBookingsCount.toString() : undefined,
    },
    {
      title: 'Inquiry Inbox',
      href: '/organizer/inquiries',
      icon: MessageSquareText,
      badge: unreadInquiriesCount > 0 ? `${unreadInquiriesCount} new` : undefined,
      badgeVariant: unreadInquiriesCount > 0 ? ('gold' as const) : ('secondary' as const),
    },
  ]

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.href
    return location.pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen flex bg-[#f8f7f4] text-foreground">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Portal Header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-primary block leading-tight">
                The Yoga Treats
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                School Organizer SaaS
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organizer Sanctuary Profile Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-secondary/50 border border-border/60">
          <div className="flex items-center gap-3">
            <img
              src={currentOrg.logoUrl}
              alt={currentOrg.name}
              className="h-10 w-10 rounded-lg object-cover border border-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground truncate">
                  {currentOrg.name}
                </span>
                {currentOrg.verificationStatus === 'verified' && (
                  <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </div>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {currentOrg.location}
              </span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
            <Badge variant="success" size="sm">
              {currentOrg.verificationStatus.toUpperCase()}
            </Badge>
            <span className="text-muted-foreground font-medium">
              &starf; {currentOrg.rating} ({currentOrg.reviewCount})
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <div className="px-3 py-2 flex-1 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Management Modules
          </div>
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all',
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-secondary/70'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4', active ? 'text-primary-foreground' : 'text-primary')} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || (active ? 'forest' : 'secondary')}
                    size="sm"
                    className={cn(active && 'bg-white/20 text-white border-transparent')}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        {/* Bottom Hub Actions */}
        <div className="p-4 border-t border-border/80 space-y-2">
          <Link
            to="/explore"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Marketplace
            </span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-foreground hover:bg-secondary"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-primary">Organizer Portal</span>
              <span>/</span>
              <span className="capitalize">
                {location.pathname.split('/')[2] || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DemoRoleSwitcher />
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
