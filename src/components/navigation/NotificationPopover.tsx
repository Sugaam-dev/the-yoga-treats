import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle,
  CalendarCheck,
  Tag,
  RotateCcw,
  Star,
  MessageSquare,
  Layers,
  Info,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { NotificationType } from '@/types'
import { Badge } from '@/components/ui/Badge'

export function NotificationPopover() {
  const { demoRole, notifications, markNotificationRead, markAllNotificationsRead } =
    useDemoStore()

  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Filter notifications for active perspective
  const roleNotifs = notifications.filter((n) => n.recipientRole === demoRole)
  const unreadCount = roleNotifs.filter((n) => !n.read).length

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_checkin':
        return <CalendarCheck className="h-4 w-4 text-emerald-600" />
      case 'custom_offer':
        return <Tag className="h-4 w-4 text-amber-600" />
      case 'booking_cancelled':
        return <RotateCcw className="h-4 w-4 text-rose-600" />
      case 'review_submitted':
      case 'review_moderated':
        return <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
      case 'inquiry':
        return <MessageSquare className="h-4 w-4 text-primary" />
      case 'listing_moderated':
        return <Layers className="h-4 w-4 text-blue-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-primary" />
    }
  }

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Recent'
    }
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-border/80 hover:bg-secondary/60 text-foreground transition-colors"
        aria-label="View demo notifications"
      >
        <Bell className="h-4.5 w-4.5 text-foreground/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Notifications
              </h4>
              <Badge variant="gold" size="sm">
                {demoRole.toUpperCase()}
              </Badge>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead(demoRole)}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Simulated Disclaimer Banner */}
          <div className="px-3.5 py-1.5 bg-sand-100 dark:bg-sand-900/30 border-b border-border/60 text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3 w-3 text-primary shrink-0" />
            <span>Simulated demo alerts &bull; No real-time server push</span>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {roleNotifs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                <p>No notifications yet for this role.</p>
                <p className="text-[10px]">Actions like bookings and offers will appear here.</p>
              </div>
            ) : (
              roleNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 text-xs transition-colors hover:bg-secondary/40 flex items-start gap-3 cursor-pointer ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-full bg-secondary shrink-0 mt-0.5">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-foreground line-clamp-1">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-block text-[11px] font-semibold text-primary hover:underline pt-0.5"
                      >
                        View details &rarr;
                      </Link>
                    )}
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
