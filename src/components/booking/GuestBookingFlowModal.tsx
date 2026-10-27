import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Check,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { Booking, Package, Payment, Retreat } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  calculateBookingPricing,
  calculateNights,
  formatINR,
  validateBookingDates,
} from '@/utils/pricing'
import { cn } from '@/lib/utils'

const TODAY_ISO_DATE = new Date().toISOString().split('T')[0]

interface GuestBookingFlowModalProps {
  retreat: Retreat
  initialPackageId?: string
  isOpen: boolean
  onClose: () => void
}

export function GuestBookingFlowModal({
  retreat,
  initialPackageId,
  isOpen,
  onClose,
}: GuestBookingFlowModalProps) {
  const navigate = useNavigate()
  const {
    packages,
    availableAddons,
    guest,
    bookingDraft,
    setBookingDraft,
    clearBookingDraft,
    createBooking,
    addToast,
  } = useDemoStore()

  const retreatPackages = useMemo(
    () => packages.filter((p) => p.retreatId === retreat.id),
    [packages, retreat.id]
  )

  const matchingDraft = bookingDraft && bookingDraft.retreatId === retreat.id ? bookingDraft : null
  const defaultPkg = retreatPackages.find((p) => p.id === (matchingDraft?.packageId || initialPackageId)) || retreatPackages[0]
  const defaultDates = defaultPkg?.dateRanges[0]

  // Step state (1: Dates & Package, 2: Add-ons & Details, 3: Review & Deposit Payment, 4: Confirmed)
  const [currentStep, setCurrentStep] = useState<number>(() =>
    matchingDraft?.currentStep && matchingDraft.currentStep < 4 ? matchingDraft.currentStep : 1
  )

  // Form states initialized with draft or sensible defaults
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    () => matchingDraft?.packageId || initialPackageId || retreatPackages[0]?.id || ''
  )
  const [startDate, setStartDate] = useState<string>(() => matchingDraft?.startDate || defaultDates?.startDate || '')
  const [endDate, setEndDate] = useState<string>(() => matchingDraft?.endDate || defaultDates?.endDate || '')
  const [guestsCount, setGuestsCount] = useState<number>(() => matchingDraft?.guestsCount ?? 1)
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(() => matchingDraft?.selectedAddonIds ?? [])
  const [guestName, setGuestName] = useState<string>(() => matchingDraft?.guestName || guest.name || '')
  const [guestEmail, setGuestEmail] = useState<string>(() => matchingDraft?.guestEmail || guest.email || '')
  const [guestPhone, setGuestPhone] = useState<string>(() => matchingDraft?.guestPhone || guest.phone || '+91 98201 44820')
  const [specialRequests, setSpecialRequests] = useState<string>(() => matchingDraft?.specialRequests || '')
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(() => matchingDraft?.agreedToTerms || false)

  // Processing & Confirmation state
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)
  const [confirmedPayment, setConfirmedPayment] = useState<Payment | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Selected package object
  const currentPackage: Package | undefined = useMemo(
    () => retreatPackages.find((p) => p.id === selectedPkgId) || retreatPackages[0],
    [retreatPackages, selectedPkgId]
  )

  // Calculate nights
  const nightsCount = useMemo(
    () => calculateNights(startDate, endDate),
    [startDate, endDate]
  )

  // Calculate pricing breakdown
  const pricingResult = useMemo(() => {
    if (!currentPackage) return null

    const addons = selectedAddonIds
      .map((id) => {
        const addon = availableAddons.find((a) => a.id === id)
        return addon ? { addon, quantity: 1 } : null
      })
      .filter((x): x is { addon: (typeof availableAddons)[0]; quantity: number } => x !== null)

    return calculateBookingPricing({
      packagePricePerPerson: currentPackage.pricePerPerson,
      guestsCount,
      nightsCount,
      selectedAddons: addons,
      taxRate: 0.12,
      depositPercentage: 25,
    })
  }, [currentPackage, guestsCount, nightsCount, selectedAddonIds, availableAddons])

  // Persist draft on user modifications
  const saveDraft = (stepOverride?: number) => {
    setBookingDraft({
      retreatId: retreat.id,
      packageId: selectedPkgId,
      startDate,
      endDate,
      guestsCount,
      selectedAddonIds,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      agreedToTerms,
      currentStep: stepOverride ?? currentStep,
    })
  }

  // Handle Preset Date Range click
  const handleSelectDateRange = (s: string, e: string) => {
    setStartDate(s)
    setEndDate(e)
    setValidationError(null)
  }

  // Validate Step 1
  const handleProceedToStep2 = () => {
    setValidationError(null)
    if (!currentPackage) {
      setValidationError('Please select a package tier.')
      return
    }

    if (currentPackage.remainingSpots < guestsCount) {
      setValidationError(
        `Only ${currentPackage.remainingSpots} spot(s) remaining for ${currentPackage.name}. Please reduce guest count.`
      )
      return
    }

    if (guestsCount > currentPackage.maxOccupancy) {
      setValidationError(
        `This room allows a maximum of ${currentPackage.maxOccupancy} guest(s).`
      )
      return
    }

    const dateVal = validateBookingDates(startDate, endDate)
    if (!dateVal.isValid) {
      setValidationError(dateVal.error || 'Invalid date range.')
      return
    }

    setCurrentStep(2)
    saveDraft(2)
  }

  // Validate Step 2
  const handleProceedToStep3 = () => {
    setValidationError(null)
    if (!guestName.trim()) {
      setValidationError('Please enter your full name.')
      return
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setValidationError('Please enter a valid contact email address.')
      return
    }
    if (!guestPhone.trim()) {
      setValidationError('Please enter a contact phone number.')
      return
    }

    setCurrentStep(3)
    saveDraft(3)
  }

  // Toggle addon checkbox
  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Handle Simulated Deposit Checkout
  const handleConfirmBooking = () => {
    setValidationError(null)
    if (!agreedToTerms) {
      setValidationError('Please review and agree to the booking policies and cancellation terms.')
      return
    }

    if (!pricingResult || !currentPackage) {
      setValidationError('Unable to calculate pricing breakdown.')
      return
    }

    setIsProcessing(true)

    // Generate stable references
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const bookingReference = `YTR-${randomSuffix}`
    const transactionReference = `PAY-SIM-${Date.now().toString().slice(-6)}`
    const bookingId = `bk-${Date.now()}`
    const paymentId = `pay-${Date.now()}`

    const newBooking: Booking = {
      id: bookingId,
      bookingReference,
      retreatId: retreat.id,
      retreatTitle: retreat.title,
      retreatImage: retreat.heroImage,
      retreatLocation: `${retreat.location.city}, ${retreat.location.country}`,
      packageId: currentPackage.id,
      packageName: currentPackage.name,
      accommodationType: currentPackage.accommodationType,
      organizerId: retreat.organizerId,
      organizerName: retreat.organizerName,
      guestId: guest.id,
      guestName,
      guestEmail,
      guestPhone,
      startDate,
      endDate,
      nightsCount,
      guestsCount,
      totalAmount: pricingResult.breakdown.totalAmount,
      currency: 'INR',
      paymentStatus: 'deposit_paid',
      bookingStatus: 'confirmed',
      specialRequests: specialRequests.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      selectedAddons: pricingResult.selectedAddonsList,
      pricing: pricingResult.breakdown,
      transactionReference,
      depositPaidAmount: pricingResult.breakdown.depositAmount,
      remainingBalance: pricingResult.breakdown.remainingBalance,
    }

    const newPayment: Payment = {
      id: paymentId,
      paymentReference: transactionReference,
      bookingId,
      bookingReference,
      guestId: guest.id,
      guestName,
      retreatTitle: retreat.title,
      amount: pricingResult.breakdown.depositAmount,
      currency: 'INR',
      paymentMethod: 'credit_card',
      status: 'completed',
      processedAt: new Date().toISOString(),
    }

    // Simulate gateway roundtrip
    setTimeout(() => {
      const result = createBooking({ booking: newBooking, payment: newPayment })
      setIsProcessing(false)

      if (result.success) {
        setConfirmedBooking(newBooking)
        setConfirmedPayment(newPayment)
        setCurrentStep(4)
      } else {
        setValidationError(result.error || 'Booking submission failed.')
      }
    }, 850)
  }

  // Handle Download Voucher Simulation
  const handleDownloadSummary = () => {
    addToast({
      title: 'Itinerary Voucher Ready',
      description: `Downloaded retreat booking voucher for ${confirmedBooking?.bookingReference}.`,
      type: 'info',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (currentStep !== 4) saveDraft()
          onClose()
        }}
      />

      <div
        className="relative w-full max-w-3xl max-h-[92vh] bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border/80 bg-secondary/40 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">
                Reserve Sanctuary
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground truncate">
                {retreat.title}
              </span>
            </div>
            <h2 id="booking-modal-title" className="font-serif text-lg font-semibold text-foreground">
              {currentStep === 1 && '1. Choose Package & Dates'}
              {currentStep === 2 && '2. Custom Add-ons & Guest Details'}
              {currentStep === 3 && '3. Review Summary & Deposit Payment'}
              {currentStep === 4 && 'Reservation Confirmed!'}
            </h2>
          </div>

          <button
            onClick={() => {
              if (currentStep !== 4) saveDraft()
              onClose()
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close booking modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-2.5 bg-background border-b border-border/60">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { num: 1, label: 'Dates' },
              { num: 2, label: 'Add-ons' },
              { num: 3, label: 'Checkout' },
              { num: 4, label: 'Confirmed' },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center h-6 w-6 rounded-full text-xs font-semibold transition-colors',
                    currentStep === step.num
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                      : currentStep > step.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {currentStep > step.num ? <Check className="h-3.5 w-3.5" /> : step.num}
                </div>
                <span
                  className={cn(
                    'hidden sm:inline text-xs ml-1.5 font-medium',
                    currentStep === step.num
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
                {idx < 3 && (
                  <div
                    className={cn(
                      'h-0.5 w-8 sm:w-12 mx-1.5 transition-colors',
                      currentStep > step.num ? 'bg-emerald-500' : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">{validationError}</div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Dates, Package & Guest Count */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Package Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Accommodation Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {retreatPackages.map((pkg) => {
                    const isSelected = selectedPkgId === pkg.id
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          setSelectedPkgId(pkg.id)
                          setValidationError(null)
                        }}
                        className={cn(
                          'p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2',
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-secondary/40'
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-foreground">
                              {pkg.name}
                            </span>
                            <Badge
                              variant={pkg.remainingSpots > 1 ? 'forest' : 'warning'}
                              size="sm"
                            >
                              {pkg.remainingSpots} spot(s)
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground capitalize">
                            {pkg.accommodationType.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {formatINR(pkg.pricePerPerson)}
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {' '}/ guest
                            </span>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Guest Count */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Number of Attendees
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg bg-secondary/40 overflow-hidden">
                    <button
                      type="button"
                      disabled={guestsCount <= 1}
                      onClick={() => setGuestsCount((c) => Math.max(1, c - 1))}
                      className="px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-40"
                    >
                      &minus;
                    </button>
                    <span className="px-4 text-sm font-semibold text-foreground">
                      {guestsCount}
                    </span>
                    <button
                      type="button"
                      disabled={
                        guestsCount >= (currentPackage?.maxOccupancy || 2) ||
                        guestsCount >= (currentPackage?.remainingSpots || 4)
                      }
                      onClick={() => setGuestsCount((c) => c + 1)}
                      className="px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary disabled:opacity-40"
                    >
                      &#43;
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Max {currentPackage?.maxOccupancy || 2} guest(s) for this accommodation
                  </span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Retreat Schedule / Dates ({retreat.durationDays} Days &bull; {retreat.durationNights} Nights)
                </label>

                {/* Quick Date Presets from Package */}
                {currentPackage && currentPackage.dateRanges.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-muted-foreground">
                      Upcoming Cohort Schedules:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentPackage.dateRanges.map((dr) => {
                        const isMatch = startDate === dr.startDate && endDate === dr.endDate
                        return (
                          <button
                            key={dr.id}
                            type="button"
                            onClick={() => handleSelectDateRange(dr.startDate, dr.endDate)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5',
                              isMatch
                                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                : 'bg-secondary/60 text-foreground border-border hover:bg-secondary'
                            )}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>
                              {dr.startDate} &rarr; {dr.endDate}
                            </span>
                            <span className="text-[10px] opacity-80">
                              ({dr.availableSpots} left)
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Date Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Check-in Arrival Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        setValidationError(null)
                      }}
                      min={TODAY_ISO_DATE}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Check-out Departure Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        setValidationError(null)
                      }}
                      min={startDate || TODAY_ISO_DATE}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/60 text-xs flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Calculated duration: <strong className="text-foreground">{nightsCount} nights</strong>
                    </span>
                    <span className="font-medium text-primary">
                      {formatINR(currentPackage?.pricePerPerson || 0)} &times; {guestsCount} guest(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Optional Add-ons & Guest Contact */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Addons Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mindful Add-on Experiences (Optional)
                  </label>
                  <span className="text-[11px] text-accent font-medium">
                    {selectedAddonIds.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableAddons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id)
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={cn(
                          'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2',
                          isChecked
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-secondary/40'
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-foreground">
                              {addon.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded accent-primary text-primary"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {addon.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                          <span className="text-[10px] uppercase text-muted-foreground">
                            {addon.unit === 'per_guest' ? 'Per Guest' : 'Per Booking'}
                          </span>
                          <span className="font-bold text-foreground">
                            {formatINR(addon.pricePerUnit)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Guest Details Form */}
              <div className="space-y-3 pt-2 border-t border-border/80">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Attendee Contact Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Lead Guest Full Name *
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. maya@example.com"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Phone Number (for airport arrival & sanctuary coordination) *
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98201 44820"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Special Dietary Needs, Medical Considerations or Requests (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Plant-based menu, quiet room away from common pavilion, knee injury adjustment..."
                      className="w-full text-xs p-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review Itemized Summary & Deposit Checkout */}
          {currentStep === 3 && pricingResult && (
            <div className="space-y-6">
              {/* Itemized Invoice Card */}
              <Card className="p-5 border-border/80 bg-secondary/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-foreground">
                      {retreat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {currentPackage?.name} &bull; {startDate} &rarr; {endDate} ({nightsCount} nights)
                    </p>
                  </div>
                  <Badge variant="gold" size="sm">
                    {guestsCount} Guest(s)
                  </Badge>
                </div>

                {/* Line Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Base Package: {currentPackage?.name} ({formatINR(currentPackage?.pricePerPerson || 0)} &times; {guestsCount})
                    </span>
                    <span className="font-medium text-foreground">
                      {formatINR(pricingResult.breakdown.basePackageTotal)}
                    </span>
                  </div>

                  {/* Addons breakdown */}
                  {pricingResult.selectedAddonsList.map((addon) => (
                    <div key={addon.addonId} className="flex items-center justify-between pl-3 border-l-2 border-primary/30 text-muted-foreground">
                      <span>&bull; {addon.name} ({addon.quantity}x)</span>
                      <span className="font-medium text-foreground">{formatINR(addon.totalPrice)}</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatINR(pricingResult.breakdown.basePackageTotal + pricingResult.breakdown.addonsTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Applicable GST Tax (12%)</span>
                    <span className="font-medium text-foreground">
                      {formatINR(pricingResult.breakdown.taxAmount)}
                    </span>
                  </div>

                  {/* Total Value */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/80 text-sm font-bold text-foreground">
                    <span>Total Booking Value</span>
                    <span className="text-base text-primary">
                      {formatINR(pricingResult.breakdown.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Deposit Highlight Banner */}
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="font-semibold text-xs text-primary">
                        Deposit Due Today (25% Advance)
                      </span>
                    </div>
                    <span className="text-base font-bold text-primary">
                      {formatINR(pricingResult.breakdown.depositAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Remaining Balance (Due at Sanctuary Arrival):</span>
                    <span className="font-medium text-foreground">
                      {formatINR(pricingResult.breakdown.remainingBalance)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Demo Payment Method Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Simulated Demo Payment Gateway
                </label>
                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-foreground block">
                        Instant Mock Deposit Authorization
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Simulates instant 25% deposit transaction. No real financial credentials collected.
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Sandbox Active
                  </Badge>
                </div>
              </div>

              {/* Terms and Policies */}
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked)
                      setValidationError(null)
                    }}
                    className="h-4 w-4 rounded accent-primary mt-0.5 shrink-0"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the retreat sanctuary guidelines, acknowledge the flexible 14-day cancellation policy, and understand the remaining balance of {formatINR(pricingResult.breakdown.remainingBalance)} is payable upon arrival.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Booking Confirmation Receipt */}
          {currentStep === 4 && confirmedBooking && (
            <div className="space-y-6 text-center py-2">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-1">
                <Badge variant="gold" size="md">
                  Reservation Confirmed
                </Badge>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Your Journey Awaits, {confirmedBooking.guestName}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  A deposit of <strong>{formatINR(confirmedBooking.depositPaidAmount || 0)}</strong> has been simulated. Your spot has been secured with {confirmedBooking.organizerName}.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <Card className="p-5 border-border/80 bg-secondary/30 text-left space-y-3 max-w-lg mx-auto text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-muted-foreground">Booking Reference:</span>
                  <span className="font-mono font-bold text-accent">
                    {confirmedBooking.bookingReference}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-muted-foreground">
                    {confirmedBooking.transactionReference || confirmedPayment?.paymentReference}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Retreat Sanctuary:</span>
                  <span className="font-semibold text-foreground">
                    {confirmedBooking.retreatTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dates & Duration:</span>
                  <span>{confirmedBooking.startDate} &rarr; {confirmedBooking.endDate} ({confirmedBooking.nightsCount} nights)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Package & Guests:</span>
                  <span>{confirmedBooking.packageName} ({confirmedBooking.guestsCount} guest)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-muted-foreground">Deposit Paid Today:</span>
                  <span className="font-bold text-emerald-700">
                    {formatINR(confirmedBooking.depositPaidAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Remaining Balance at Check-in:</span>
                  <span className="font-bold text-foreground">
                    {formatINR(confirmedBooking.remainingBalance || 0)}
                  </span>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    clearBookingDraft()
                    onClose()
                    navigate('/account/bookings')
                  }}
                  className="w-full sm:w-auto gap-2"
                >
                  <span>Go to My Bookings</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadSummary}
                  className="w-full sm:w-auto gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Voucher</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1-3) */}
        {currentStep < 4 && (
          <div className="px-6 py-4 border-t border-border/80 bg-secondary/30 flex items-center justify-between gap-3">
            <div>
              {currentStep > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStep((s) => s - 1)
                    setValidationError(null)
                  }}
                >
                  &larr; Previous Step
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    saveDraft()
                    onClose()
                  }}
                >
                  Save & Exit
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep === 1 && (
                <Button size="sm" onClick={handleProceedToStep2} className="font-semibold">
                  Next: Add-ons & Details &rarr;
                </Button>
              )}

              {currentStep === 2 && (
                <Button size="sm" onClick={handleProceedToStep3} className="font-semibold">
                  Next: Review & Payment &rarr;
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  size="sm"
                  variant="gold"
                  isLoading={isProcessing}
                  onClick={handleConfirmBooking}
                  className="font-semibold shadow-sm"
                >
                  Confirm & Pay Deposit ({formatINR(pricingResult?.breakdown.depositAmount || 0)})
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
