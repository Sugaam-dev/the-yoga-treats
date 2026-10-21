import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  ShieldAlert,
  BarChart3,
  CheckSquare,
  UserCheck,
  Coins,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { DemoRoleSwitcher } from '@/components/navigation/DemoRoleSwitcher'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { retreats, organizers } = useDemoStore()

  const pendingListingsCount = retreats.filter((r) => r.status === 'pending_review').length
  const pendingOrganizersCount = organizers.filter((o) => o.verificationStatus === 'pending').length

  const navItems = [
    {
      title: 'Operations Overview',
      href: '/admin',
      icon: BarChart3,
      exact: true,
    },
    {
      title: 'Listing Moderation',
      href: '/admin/listings',
      icon: CheckSquare,
      badge: pendingListingsCount > 0 ? `${pendingListingsCount} Pending` : undefined,
      badgeVariant: pendingListingsCount > 0 ? ('warning' as const) : undefined,
    },
    {
      title: 'Organizer Verification',
      href: '/admin/organizers',
      icon: UserCheck,
      badge: pendingOrganizersCount > 0 ? `${pendingOrganizersCount} Review` : undefined,
      badgeVariant: pendingOrganizersCount > 0 ? ('gold' as const) : undefined,
    },
    {
      title: 'Financial Operations',
      href: '/admin/finance',
      icon: Coins,
    },
  ]

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.href
    return location.pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen flex bg-[#f6f5f2] text-foreground">
      {/* Mobile Sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[#12211b] text-white border-r border-[#1f372d] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Admin Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-white block leading-tight">
                The Yoga Treats
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                Team Admin Center
              </span>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-white/10 text-white/70"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Security / System Status bar */}
        <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-white/60">System Security</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Healthy
            </span>
          </div>
          <div className="text-[11px] text-white/50">
            Internal Operations &bull; Staff Access
          </div>
        </div>

        {/* Nav list */}
        <div className="px-3 py-2 flex-1 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40">
            Control Center
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
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4', active ? 'text-white' : 'text-emerald-400/80')} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || 'secondary'}
                    size="sm"
                    className={cn(
                      active && 'bg-white/20 text-white border-transparent'
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/organizer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>School Organizer View</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            to="/explore"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeft className="h-3 w-3" />
              Public Marketplace
            </span>
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
              <span className="font-semibold text-emerald-800">Admin Operations</span>
              <span>/</span>
              <span className="capitalize font-medium text-foreground">
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
