import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Star,
  ShieldCheck,
  Send,
  Sparkles,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export function RetreatDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { retreats, packages, organizers, reviews, addToast, addInquiryMessage } = useDemoStore()

  const retreat = retreats.find((r) => r.id === id)
  const retreatPackages = packages.filter((p) => p.retreatId === id)
  const organizer = organizers.find((o) => o.id === retreat?.organizerId)
  const retreatReviews = reviews.filter((r) => r.retreatId === id)

  // Booking modal / enquiry state
  const [inquirySubject, setInquirySubject] = useState('')
  const [inquiryText, setInquiryText] = useState('')
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false)

  if (!retreat) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Retreat Sanctuary Not Found"
          description="The requested retreat could not be found or may have been unlisted by the organizer."
          action={
            <Link to="/explore">
              <Button>Browse All Retreats</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const handleDemoBookPackage = (pkgName: string) => {
    addToast({
      title: 'Package Selected for Demo Reservation',
      description: `You have selected ${pkgName}. In Phase 2, this opens the complete checkout flow.`,
      type: 'success',
    })
  }

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryText.trim()) return

    setIsSubmittingInquiry(true)
    setTimeout(() => {
      addInquiryMessage('inq-901', inquiryText, 'guest')
      setInquiryText('')
      setInquirySubject('')
      setIsSubmittingInquiry(false)
      addToast({
        title: 'Enquiry Transmitted to Host',
        description: `Your question has been routed directly to ${organizer?.name || 'the retreat team'}.`,
        type: 'success',
      })
    }, 500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Header */}
      <PageHeader
        title={retreat.title}
        backHref="/explore"
        backLabel="Back to Discovery"
        description={retreat.tagline}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="forest">
              {retreat.durationDays} Days / {retreat.durationNights} Nights
            </Badge>
            {retreat.featured && <Badge variant="gold">Editor's Pick</Badge>}
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              From ${retreat.startingPrice.toLocaleString()} {retreat.currency}
            </span>
            <a href="#packages">
              <Button size="sm" variant="gold" className="font-semibold">
                View Packages
              </Button>
            </a>
          </div>
        }
      />

      {/* Imagery Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        <div className="md:col-span-2 relative aspect-16/10 md:aspect-auto">
          <img
            src={retreat.heroImage}
            alt={retreat.title}
            className="w-full h-full object-cover min-h-[340px]"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
          {retreat.galleryImages.slice(0, 2).map((img, i) => (
            <div key={i} className="aspect-16/10 relative overflow-hidden bg-secondary">
              <img
                src={img}
                alt={`${retreat.title} view ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content & Sticky Booking Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 2 Cols: Details, Highlights, Schedule, Inclusions */}
        <div className="lg:col-span-2 space-y-10">
          {/* Quick Badges Bar */}
          <div className="flex items-center gap-6 py-4 px-6 rounded-xl bg-card border border-border text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                {retreat.location.city}, {retreat.location.country}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{retreat.durationDays} Days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Max {retreat.groupSizeMax} Attendees</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold text-foreground">
                {retreat.rating} ({retreat.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Sanctuary Overview
            </h2>
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {retreat.description}
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              Immersion Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {retreat.highlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-secondary/50 border border-border/70 flex items-start gap-2.5 text-xs text-foreground/90"
                >
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              Sample Daily Rhythm
            </h3>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {retreat.dailySchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex items-center justify-between text-xs gap-4 hover:bg-secondary/30 transition-colors"
                >
                  <span className="font-semibold text-primary w-24 shrink-0">
                    {item.time}
                  </span>
                  <span className="flex-1 text-foreground/90">{item.activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Included / Not Included */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                What's Included
              </h4>
              <ul className="space-y-2 text-xs text-foreground/80">
                {retreat.included.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600">&bull;</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                Not Included
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {retreat.notIncluded.map((notInc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>&bull;</span>
                    <span>{notInc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Packages Section */}
          <div id="packages" className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  Available Accommodation Packages
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select your preferred lodging style and available retreat dates.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {retreatPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-5 rounded-xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base text-foreground">
                        {pkg.name}
                      </h4>
                      <Badge variant="secondary" size="sm">
                        {pkg.accommodationType.replace('_', ' ')}
                      </Badge>
                      <Badge variant="forest" size="sm">
                        {pkg.remainingSpots} spots left
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {pkg.description}
                    </p>
                    <div className="flex gap-2 flex-wrap text-[11px] text-primary/80 pt-1">
                      {pkg.features.map((feat, fi) => (
                        <span key={fi} className="bg-secondary/70 px-2 py-0.5 rounded-md">
                          &check; {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-xl font-bold text-foreground">
                        ${pkg.pricePerPerson.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground"> / guest</span>
                    </div>

                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => handleDemoBookPackage(pkg.name)}
                      className="font-semibold shadow-xs"
                    >
                      Reserve Package
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Guest Reviews ({retreatReviews.length})
              </h3>
              <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span>{retreat.rating} average rating</span>
              </div>
            </div>

            <div className="space-y-3">
              {retreatReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.guestAvatar}
                        alt={rev.guestName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        {rev.guestName}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                  <h5 className="text-xs font-semibold text-foreground">{rev.title}</h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Host Sanctuary & Inquiry Box */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Host Card */}
          {organizer && (
            <Card className="p-5 space-y-4 border-border/80">
              <div className="flex items-center gap-3">
                <img
                  src={organizer.logoUrl}
                  alt={organizer.name}
                  className="h-12 w-12 rounded-xl object-cover border border-border"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-serif text-sm font-semibold text-foreground">
                      {organizer.name}
                    </h4>
                    {organizer.verificationStatus === 'verified' && (
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {organizer.location}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {organizer.bio}
              </p>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Member since {organizer.joinedDate.split('-')[0]}</span>
                <span className="font-medium text-foreground">
                  &starf; {organizer.rating} ({organizer.reviewCount} reviews)
                </span>
              </div>
            </Card>
          )}

          {/* Ask Organizer an Inquiry Box */}
          <Card className="p-5 space-y-4 border-border/80 bg-secondary/30">
            <div>
              <h4 className="font-serif text-base font-semibold text-foreground">
                Have a question for the school?
              </h4>
              <p className="text-xs text-muted-foreground">
                Inquire about dietary needs, private extensions, or group rates.
              </p>
            </div>

            <form onSubmit={handleSendInquiry} className="space-y-3">
              <input
                type="text"
                placeholder="Topic / Subject (e.g. Airport Transfer)"
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                rows={3}
                placeholder="Write your mindful question here..."
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <Button
                type="submit"
                size="sm"
                className="w-full gap-1.5"
                isLoading={isSubmittingInquiry}
                disabled={!inquiryText.trim()}
              >
                <Send className="h-3.5 w-3.5" />
                Send Inquiry to Host
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
