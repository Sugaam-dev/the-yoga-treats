import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  MapPin,
  Award,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { VerificationStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

export function AdminOrganizersPage() {
  const { organizers, updateOrganizerVerification } = useDemoStore()
  const [filter, setFilter] = useState<'all' | VerificationStatus>('all')

  const filteredOrganizers = organizers.filter((org) => {
    if (filter === 'all') return true
    return org.verificationStatus === filter
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Organizer Verification"
        description="Verify registered yoga teachers, school accreditations (RYS 200/500), insurance documents, and banking settlement details."
        badge={
          <Badge variant="gold" size="sm">
            {organizers.length} Registered Schools
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 text-xs">
        {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              filter === tab
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            {tab}
            {tab === 'pending' && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                {organizers.filter((o) => o.verificationStatus === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Organizers List */}
      <div className="space-y-4">
        {filteredOrganizers.map((org) => (
          <Card key={org.id} className="p-5 border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-card">
            <div className="flex items-start gap-4">
              <img
                src={org.logoUrl}
                alt={org.name}
                className="h-16 w-16 rounded-xl object-cover shrink-0 border border-border"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-base font-semibold text-foreground">
                    {org.name}
                  </h3>
                  <Badge
                    variant={
                      org.verificationStatus === 'verified'
                        ? 'success'
                        : org.verificationStatus === 'pending'
                        ? 'warning'
                        : 'destructive'
                    }
                    size="sm"
                  >
                    {org.verificationStatus.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {org.location}
                  </span>
                  <span>Joined {org.joinedDate}</span>
                  <span>{org.activeListingsCount} listings</span>
                  <span>&starf; {org.rating} ({org.reviewCount})</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <Award className="h-3.5 w-3.5 text-accent shrink-0" />
                  {org.credentials.map((cred, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-secondary/80 px-2 py-0.5 rounded text-foreground/80"
                    >
                      {cred}
                    </span>
                  ))}
                </div>

                {org.bankDetails && (
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Settlement Bank: <span className="font-medium text-foreground">{org.bankDetails.bankName}</span> (****{org.bankDetails.accountLast4})
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
              {org.verificationStatus !== 'verified' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-emerald-700 hover:bg-emerald-50 h-8"
                  onClick={() => updateOrganizerVerification(org.id, 'verified')}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Approve Verification
                </Button>
              )}

              {org.verificationStatus === 'verified' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-rose-700 hover:bg-rose-50 h-8"
                  onClick={() => updateOrganizerVerification(org.id, 'rejected')}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Revoke Verification
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
