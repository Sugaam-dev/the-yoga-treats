import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  MapPin,
  Star,
  Layers,
  AlertCircle,
  X,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { RetreatStatus, ReviewStatus, Review } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatINR } from '@/utils/pricing'

export function AdminListingsPage() {
  const { retreats, updateRetreatStatus, reviews, moderateReview, addToast } = useDemoStore()

  // Top Section Tab: 'listings' | 'reviews'
  const [activeSection, setActiveSection] = useState<'listings' | 'reviews'>('listings')

  // Listing filter
  const [listingFilter, setListingFilter] = useState<'all' | RetreatStatus>('all')

  // Review filter
  const [reviewFilter, setReviewFilter] = useState<'all' | ReviewStatus>('all')

  // Rejection modal state
  const [rejectingReview, setRejectingReview] = useState<Review | null>(null)
  const [rejectionReason, setRejectionReason] = useState('Does not meet community reflection guidelines.')

  const filteredRetreats = retreats.filter((r) => {
    if (listingFilter === 'all') return true
    return r.status === listingFilter
  })

  const filteredReviews = reviews.filter((rev) => {
    if (reviewFilter === 'all') return true
    if (reviewFilter === 'published') return rev.status === 'published' || rev.status === 'approved'
    return rev.status === reviewFilter
  })

  const pendingListingsCount = retreats.filter((r) => r.status === 'pending_review').length
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length

  const handleApproveListing = (retreatId: string, title: string) => {
    updateRetreatStatus(retreatId, 'published')
    addToast({
      title: 'Retreat Approved & Published',
      description: `"${title}" is now visible on the public marketplace.`,
      type: 'success',
    })
  }

  const handleRejectListing = (retreatId: string, title: string, isPublished: boolean) => {
    updateRetreatStatus(retreatId, 'draft')
    addToast({
      title: isPublished ? 'Retreat Unlisted' : 'Retreat Returned to Draft',
      description: `"${title}" status changed to draft. Organizer notified.`,
      type: 'info',
    })
  }

  const handleApproveReview = (reviewId: string) => {
    moderateReview(reviewId, 'approved')
    addToast({
      title: 'Review Approved',
      description: 'The guest review has been published to the sanctuary page.',
      type: 'success',
    })
  }

  const handleConfirmRejectReview = () => {
    if (!rejectingReview) return
    moderateReview(rejectingReview.id, 'rejected', rejectionReason.trim())
    addToast({
      title: 'Review Rejected',
      description: 'The review was archived with moderation feedback.',
      type: 'info',
    })
    setRejectingReview(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation & Quality Center"
        description="Inspect submitted yoga retreat curricula, safety guidelines, and imagery before approving them for marketplace discovery."
        badge={
          <Badge variant="gold" size="sm">
            {pendingListingsCount + pendingReviewsCount} Pending Ops
          </Badge>
        }
      />

      {/* Main Switcher: Listings vs Reviews */}
      <div className="flex items-center gap-3 border-b border-border">
        <button
          onClick={() => setActiveSection('listings')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSection === 'listings'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Retreat Listings ({retreats.length})</span>
          {pendingListingsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
              {pendingListingsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('reviews')}
          className={`flex items-center gap-2 pb-3 px-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSection === 'reviews'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className="h-4 w-4" />
          <span>Guest Reviews ({reviews.length})</span>
          {pendingReviewsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
              {pendingReviewsCount}
            </span>
          )}
        </button>
      </div>

      {activeSection === 'listings' ? (
        <div className="space-y-4">
          {/* Filter Sub-Tabs for Listings */}
          <div className="flex items-center gap-2 text-xs">
            {(['all', 'pending_review', 'published', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setListingFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  listingFilter === tab
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {tab.replace('_', ' ')}
                {tab === 'pending_review' && pendingListingsCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                    {pendingListingsCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Listings Table */}
          <Card className="overflow-hidden border-border/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider border-b border-border/80">
                  <tr>
                    <th className="p-3.5">Sanctuary</th>
                    <th className="p-3.5">School Organizer</th>
                    <th className="p-3.5">Starting Price</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRetreats.map((ret) => (
                    <tr key={ret.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3.5 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <img
                            src={ret.heroImage}
                            alt={ret.title}
                            className="h-10 w-14 rounded-lg object-cover border border-border"
                          />
                          <div>
                            <span className="font-semibold text-xs block">{ret.title}</span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {ret.location.city}, {ret.location.country}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        <span className="font-medium text-foreground block">{ret.organizerName}</span>
                        <span className="text-[10px]">{ret.organizerId}</span>
                      </td>
                      <td className="p-3.5 font-bold text-foreground">
                        {formatINR(ret.startingPrice)}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {ret.durationDays} Days / {ret.durationNights} Nights
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            ret.status === 'published'
                              ? 'success'
                              : ret.status === 'pending_review'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {ret.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/retreats/${ret.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-primary px-2">
                              Inspect <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>

                          {ret.status !== 'published' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveListing(ret.id, ret.title)}
                              className="h-7 text-xs gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                          )}

                          {ret.status !== 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectListing(ret.id, ret.title, ret.status === 'published')}
                              className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="h-3 w-3" />
                              {ret.status === 'published' ? 'Unlist' : 'Reject'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Sub-Tabs for Reviews */}
          <div className="flex items-center gap-2 text-xs">
            {(['all', 'pending', 'published', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setReviewFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  reviewFilter === tab
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {tab === 'published' ? 'Approved / Published' : tab}
                {tab === 'pending' && pendingReviewsCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Reviews Table */}
          <Card className="overflow-hidden border-border/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider border-b border-border/80">
                  <tr>
                    <th className="p-3.5">Guest & Rating</th>
                    <th className="p-3.5">Retreat Sanctuary</th>
                    <th className="p-3.5">Reflection Content</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Moderation State</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No guest reviews match this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((rev) => {
                      const isApproved = rev.status === 'published' || rev.status === 'approved'
                      return (
                        <tr key={rev.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={rev.guestAvatar}
                                alt={rev.guestName}
                                className="h-7 w-7 rounded-full object-cover border border-border"
                              />
                              <div>
                                <span className="font-semibold block text-foreground">
                                  {rev.guestName}
                                </span>
                                <div className="flex items-center gap-0.5 text-amber-600 font-semibold">
                                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                  <span>{rev.rating} / 5</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-foreground">
                            <span className="block font-semibold line-clamp-1">{rev.retreatTitle}</span>
                            <span className="text-[10px] text-muted-foreground">ID: {rev.retreatId}</span>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <div className="font-semibold text-foreground text-[11px] mb-0.5">
                              {rev.title}
                            </div>
                            <p className="text-muted-foreground text-[11px] line-clamp-2 leading-relaxed">
                              &ldquo;{rev.comment}&rdquo;
                            </p>
                            {rev.moderationNote && (
                              <span className="block mt-1 text-[10px] text-rose-600 italic">
                                Note: {rev.moderationNote}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                            {rev.date}
                          </td>
                          <td className="p-3.5">
                            <Badge
                              variant={
                                isApproved
                                  ? 'success'
                                  : rev.status === 'pending'
                                  ? 'warning'
                                  : 'destructive'
                              }
                              size="sm"
                            >
                              {rev.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isApproved && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveReview(rev.id)}
                                  className="h-7 text-xs gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Approve & Publish
                                </Button>
                              )}
                              {rev.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRejectingReview(rev)
                                    setRejectionReason('Does not meet community reflection guidelines.')
                                  }}
                                  className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* In-page Review Rejection Modal */}
      {rejectingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Reject Guest Review
                </h3>
              </div>
              <button
                onClick={() => setRejectingReview(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Provide an internal explanation or feedback note for archiving review by{' '}
                <strong className="text-foreground">{rejectingReview.guestName}</strong>.
              </p>

              <div className="p-3 rounded-xl bg-secondary/50 border border-border italic text-foreground">
                &ldquo;{rejectingReview.comment}&rdquo;
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Rejection Feedback Note
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingReview(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleConfirmRejectReview}
                className="font-semibold"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
