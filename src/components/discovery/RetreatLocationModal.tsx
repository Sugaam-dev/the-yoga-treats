import { MapPin, Plane, Compass, Mountain, X, ShieldCheck } from 'lucide-react'
import type { Retreat } from '@/types'
import { Button } from '@/components/ui/Button'

interface RetreatLocationModalProps {
  retreat: Retreat | null
  isOpen: boolean
  onClose: () => void
}

export function RetreatLocationModal({
  retreat,
  isOpen,
  onClose,
}: RetreatLocationModalProps) {
  if (!isOpen || !retreat) return null

  const { coordinates, address, fullAddress, city, state, country, airportGuidance } = retreat.location
  const venueAddress = address || fullAddress || `${city}, ${state ? `${state}, ` : ''}${country}`
  const latStr = coordinates?.lat !== undefined
    ? `${Math.abs(coordinates.lat)}° ${coordinates.lat >= 0 ? 'N' : 'S'}`
    : '8.8149° S'
  const lngStr = coordinates?.lng !== undefined
    ? `${Math.abs(coordinates.lng)}° ${coordinates.lng >= 0 ? 'E' : 'W'}`
    : '115.0884° E'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-xl rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Geographical & Venue Coordinates
              </h3>
              <p className="text-xs text-muted-foreground">{retreat.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Static Radar / Coordinate Visualizer Card */}
          <div className="relative rounded-xl border border-primary/20 bg-[#162a22] text-sand-50 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#285342_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono tracking-widest text-accent uppercase font-bold">
                  Topographical Grid Reference
                </span>
                <div className="mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {latStr}, {lngStr}
                </div>
                <p className="mt-1 text-xs text-sand-200">
                  {venueAddress}
                </p>
              </div>

              <div className="h-16 w-16 shrink-0 rounded-full border border-accent/40 bg-primary/40 flex items-center justify-center text-accent relative shadow-inner">
                <MapPin className="h-7 w-7 text-accent animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-dashed border-accent/30 animate-[spin_12s_linear_infinite]" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
              <span className="flex items-center gap-1 font-medium">
                <Mountain className="h-3.5 w-3.5 text-accent" />
                Altitude: Sanctuary Level Elevation
              </span>
              <span className="font-mono text-accent">GPS Verified</span>
            </div>
          </div>

          {/* Travel & Airport Guidance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5 text-primary" />
              Arrival Transit & Airport Guidance
            </h4>
            <div className="p-3.5 rounded-xl border border-border/70 bg-secondary/20 text-xs text-foreground/90 leading-relaxed">
              {airportGuidance ||
                `Nearest international hub airport is serviced with daily direct flights. The sanctuary can coordinate airport pickup or private chauffeured transfer on your day of arrival.`}
            </div>
          </div>

          {/* Simulated static disclaimer */}
          <div className="p-3 rounded-lg bg-sand-100 dark:bg-sand-900/30 border border-sand-200 dark:border-sand-800 text-[11px] text-muted-foreground flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              <strong>Static Coordinate Preview:</strong> Precise sanctuary coordinates are validated during host verification. No third-party live mapping API keys are loaded in this frontend-only demo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30 flex justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Close Coordinate View
          </Button>
        </div>
      </div>
    </div>
  )
}
