import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Compass,
  Briefcase,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { DemoRole } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export function DemoRoleSwitcher() {
  const { demoRole, setDemoRole, resetDemoData, retreats, bookings } = useDemoStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const roles: {
    id: DemoRole
    title: string
    subtitle: string
    icon: typeof Compass
    defaultPath: string
    badge: string
  }[] = [
    {
      id: 'guest',
      title: 'Guest Traveler',
      subtitle: 'Marketplace discovery & bookings',
      icon: Compass,
      defaultPath: '/',
      badge: 'Marketplace',
    },
    {
      id: 'organizer',
      title: 'School Organizer',
      subtitle: 'Prana Veda Sanctuary portal',
      icon: Briefcase,
      defaultPath: '/organizer',
      badge: 'SaaS Portal',
    },
    {
      id: 'admin',
      title: 'Team Admin',
      subtitle: 'Moderation & verification hub',
      icon: ShieldCheck,
      defaultPath: '/admin',
      badge: 'Internal Ops',
    },
  ]

  const currentRoleConfig = roles.find((r) => r.id === demoRole) || roles[0]

  const handleRoleSelect = (role: DemoRole, targetPath: string) => {
    setDemoRole(role)
    setIsOpen(false)

    // If currently on an incompatible route, navigate to the target portal's home
    const isGuestPath = !location.pathname.startsWith('/organizer') && !location.pathname.startsWith('/admin')
    const isOrganizerPath = location.pathname.startsWith('/organizer')
    const isAdminPath = location.pathname.startsWith('/admin')

    if (
      (role === 'guest' && !isGuestPath) ||
      (role === 'organizer' && !isOrganizerPath) ||
      (role === 'admin' && !isAdminPath)
    ) {
      navigate(targetPath)
    }
  }

  const handleReset = () => {
    setIsResetting(true)
    setTimeout(() => {
      resetDemoData()
      setIsResetting(false)
      setIsOpen(false)
    }, 400)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border/70 bg-card/90 backdrop-blur-md shadow-xs">
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
          <SlidersHorizontal className="h-3 w-3 text-accent" />
          <span>Demo Role:</span>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-secondary/70 transition-colors text-xs font-medium text-foreground"
          aria-expanded={isOpen}
          aria-label="Toggle demo role switcher"
        >
          <currentRoleConfig.icon className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-primary">{currentRoleConfig.title}</span>
          <Badge variant="gold" size="sm" className="hidden md:inline-flex">
            {currentRoleConfig.badge}
          </Badge>
          <ChevronDown
            className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>

        <button
          onClick={handleReset}
          disabled={isResetting}
          title="Reset demo data to initial factory state"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors disabled:opacity-50"
          aria-label="Reset demo state"
        >
          <RotateCcw className={cn('h-3.5 w-3.5', isResetting && 'animate-spin text-primary')} />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-border/70 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Presenter Role Switcher
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Frontend Mock State
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulate role-based access control and distinct dashboard workflows.
              </p>
            </div>

            <div className="space-y-1">
              {roles.map((r) => {
                const Icon = r.icon
                const isActive = demoRole === r.id
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id, r.defaultPath)}
                    className={cn(
                      'w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all',
                      isActive
                        ? 'bg-primary/10 border border-primary/20 text-foreground'
                        : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-md shrink-0 mt-0.5',
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-foreground">
                          {r.title}
                        </span>
                        {isActive ? (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 opacity-70">
                            Jump <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {r.subtitle}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between px-2 text-[11px] text-muted-foreground">
              <span>
                {retreats.length} retreats &bull; {bookings.length} bookings
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Data
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
