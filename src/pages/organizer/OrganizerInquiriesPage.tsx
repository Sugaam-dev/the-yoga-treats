import { useState, useMemo } from 'react'
import {
  Send,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type { BookingAddon, SelectedAddon } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { calculateBookingPricing, calculateNights, formatINR } from '@/utils/pricing'
import { maskEmail } from '@/utils/masking'
import { cn } from '@/lib/utils'

export function OrganizerInquiriesPage() {
  const {
    inquiries,
    messages,
    retreats,
    packages,
    availableAddons,
    activeOrganizerId,
    offers,
    addInquiryMessage,
    createCustomOffer,
  } = useDemoStore()

  const [selectedInquiryId, setSelectedInquiryId] = useState<string>(
    inquiries[0]?.id || ''
  )
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Custom Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [selectedRetreatId, setSelectedRetreatId] = useState<string>('')
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [offerStartDate, setOfferStartDate] = useState<string>('')
  const [offerEndDate, setOfferEndDate] = useState<string>('')
  const [offerGuestsCount, setOfferGuestsCount] = useState<number>(1)
  const [customPricePerPerson, setCustomPricePerPerson] = useState<number>(0)
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [offerExpiryDate, setOfferExpiryDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })
  const [offerMessage, setOfferMessage] = useState('')
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

  // Active Inquiry & Thread
  const activeInquiry = inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0]
  const threadMessages = messages.filter((m) => m.inquiryId === activeInquiry?.id)

  // Organizer Retreats & Packages
  const orgRetreats = useMemo(
    () => retreats.filter((r) => r.organizerId === activeOrganizerId),
    [retreats, activeOrganizerId]
  )

  const activeRetreat = useMemo(
    () => orgRetreats.find((r) => r.id === selectedRetreatId) || orgRetreats[0],
    [orgRetreats, selectedRetreatId]
  )

  const retreatPackages = useMemo(
    () => (activeRetreat ? packages.filter((p) => p.retreatId === activeRetreat.id) : []),
    [packages, activeRetreat]
  )

  const activePackage = useMemo(
    () => retreatPackages.find((p) => p.id === selectedPackageId) || retreatPackages[0],
    [retreatPackages, selectedPackageId]
  )

  // Handle opening Custom Offer Modal
  const handleOpenOfferModal = () => {
    const initialRet = orgRetreats.find((r) => r.id === activeInquiry?.retreatId) || orgRetreats[0]
    const initialPkgs = initialRet ? packages.filter((p) => p.retreatId === initialRet.id) : []
    const firstPkg = initialPkgs[0]
    const firstDates = firstPkg?.dateRanges[0]

    setSelectedRetreatId(initialRet?.id || '')
    setSelectedPackageId(firstPkg?.id || '')
    setOfferStartDate(firstDates?.startDate || '2026-11-20')
    setOfferEndDate(firstDates?.endDate || '2026-11-26')
    setOfferGuestsCount(1)
    setCustomPricePerPerson(firstPkg?.earlyBirdPrice || firstPkg?.pricePerPerson || 150000)
    setSelectedAddonIds([])
    setOfferMessage(`Hello ${activeInquiry?.guestName}, we are delighted to offer you this tailored reservation package with flexible arrival dates.`)
    setIsOfferModalOpen(true)
  }

  // Calculate nights and pricing for offer
  const calculatedNights = useMemo(
    () => calculateNights(offerStartDate, offerEndDate) || 6,
    [offerStartDate, offerEndDate]
  )

  const selectedAddonsData: { addon: BookingAddon; quantity: number }[] = useMemo(() => {
    return selectedAddonIds
      .map((id) => {
        const found = availableAddons.find((a) => a.id === id)
        return found ? { addon: found, quantity: 1 } : null
      })
      .filter((x): x is { addon: BookingAddon; quantity: number } => x !== null)
  }, [selectedAddonIds, availableAddons])

  const calculatedOfferPricing = useMemo(() => {
    return calculateBookingPricing({
      packagePricePerPerson: customPricePerPerson > 0 ? customPricePerPerson : (activePackage?.pricePerPerson || 150000),
      guestsCount: offerGuestsCount,
      nightsCount: calculatedNights,
      selectedAddons: selectedAddonsData,
    })
  }, [customPricePerPerson, activePackage, offerGuestsCount, calculatedNights, selectedAddonsData])

  // Submit custom offer
  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInquiry || !activeRetreat || !activePackage) return

    setIsSubmittingOffer(true)
    const selectedAddonsForOffer: SelectedAddon[] = calculatedOfferPricing.selectedAddonsList

    createCustomOffer({
      inquiryId: activeInquiry.id,
      organizerId: activeRetreat.organizerId,
      organizerName: activeRetreat.organizerName,
      guestId: activeInquiry.guestId,
      guestName: activeInquiry.guestName,
      guestEmail: activeInquiry.guestEmail,
      retreatId: activeRetreat.id,
      retreatTitle: activeRetreat.title,
      retreatImage: activeRetreat.heroImage,
      retreatLocation: `${activeRetreat.location.city}, ${activeRetreat.location.country}`,
      packageId: activePackage.id,
      packageName: activePackage.name,
      accommodationType: activePackage.accommodationType,
      startDate: offerStartDate,
      endDate: offerEndDate,
      nightsCount: calculatedNights,
      guestsCount: offerGuestsCount,
      selectedAddons: selectedAddonsForOffer,
      pricing: calculatedOfferPricing.breakdown,
      message: offerMessage.trim() || 'Tailored immersion offer created specially for you.',
      expiresAt: `${offerExpiryDate}T23:59:59Z`,
    })

    setIsSubmittingOffer(false)
    setIsOfferModalOpen(false)
  }

  // Send regular reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !activeInquiry) return

    setIsSending(true)
    setTimeout(() => {
      addInquiryMessage(activeInquiry.id, replyText, 'organizer')
      setReplyText('')
      setIsSending(false)
    }, 300)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Inquiry Inbox & Direct Offers"
        description="Communicate with prospective attendees, answer schedule questions, and issue custom proposals."
        badge={
          <Badge variant="gold" size="sm">
            {inquiries.length} Conversations
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[660px] items-stretch">
        {/* Inquiries Thread List */}
        <Card className="overflow-hidden flex flex-col border-border/80">
          <div className="p-3.5 border-b border-border/80 bg-secondary/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Conversations</span>
            <span className="text-[11px] text-muted-foreground">{inquiries.length} Threads</span>
          </div>

          <div className="divide-y divide-border/60 overflow-y-auto flex-1">
            {inquiries.map((inq) => {
              const isSelected = inq.id === activeInquiry?.id
              const hasOffer = offers.some((o) => o.inquiryId === inq.id)
              return (
                <button
                  key={inq.id}
                  onClick={() => setSelectedInquiryId(inq.id)}
                  className={cn(
                    'w-full p-4 text-left transition-colors flex flex-col gap-1.5',
                    isSelected
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-secondary/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {inq.guestName}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasOffer && (
                        <Badge variant="forest" size="sm" className="text-[9px]">
                          Offer Active
                        </Badge>
                      )}
                      <Badge
                        variant={inq.unreadByOrganizer ? 'gold' : 'secondary'}
                        size="sm"
                      >
                        {inq.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {inq.subject}
                  </p>

                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {inq.lastMessageSnippet}
                  </p>

                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {inq.retreatTitle || 'General Sanctuary Inquiry'}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Message Thread Detail & Offer Action */}
        <Card className="md:col-span-2 overflow-hidden flex flex-col border-border/80">
          {activeInquiry ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-border/80 bg-secondary/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {activeInquiry.subject}
                    </h4>
                    <Badge variant="outline" size="sm">
                      {activeInquiry.inquiryNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Attendee: <strong className="text-foreground">{activeInquiry.guestName}</strong> &bull; Contact:{' '}
                    <span className="font-mono text-[11px] bg-secondary/80 px-1.5 py-0.5 rounded text-foreground">
                      {maskEmail(activeInquiry.guestEmail)}
                    </span>{' '}
                    <span className="text-[10px] text-muted-foreground">(Masked for Privacy)</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleOpenOfferModal}
                    className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Create Custom Offer
                  </Button>
                </div>
              </div>

              {/* Message History */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-background/50">
                {threadMessages.map((msg) => {
                  const isOrganizer = msg.senderRole === 'organizer'
                  const isOfferMsg = msg.content.includes('Custom Offer Sent')
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col max-w-lg',
                        isOrganizer ? 'ml-auto items-end' : 'mr-auto items-start'
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{msg.senderName}</span>
                        {msg.isAutoReply && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">
                            Auto-Reply
                          </span>
                        )}
                        <span>&bull;</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs',
                          isOfferMsg
                            ? 'bg-emerald-950 text-emerald-50 border border-emerald-700 rounded-tr-none'
                            : isOrganizer
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-card border border-border text-foreground rounded-tl-none'
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply Input Bar */}
              <form
                onSubmit={handleSendReply}
                className="p-3 border-t border-border/80 bg-card flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your response to the attendee..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  isLoading={isSending}
                  disabled={!replyText.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground my-auto">
              Select an inquiry thread to view conversation history.
            </div>
          )}
        </Card>
      </div>

      {/* Create Custom Offer Dialog Modal */}
      {isOfferModalOpen && activeInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-accent" />
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Create Custom Proposal Offer
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Prepare a tailored offer for <strong>{activeInquiry.guestName}</strong> ({activeInquiry.guestEmail}).
                </p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4 text-xs">
              {/* Select Retreat and Package */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Retreat Sanctuary
                  </label>
                  <select
                    value={selectedRetreatId}
                    onChange={(e) => {
                      setSelectedRetreatId(e.target.value)
                      const ret = orgRetreats.find((r) => r.id === e.target.value)
                      const pkgs = ret ? packages.filter((p) => p.retreatId === ret.id) : []
                      if (pkgs.length > 0) {
                        setSelectedPackageId(pkgs[0].id)
                        setCustomPricePerPerson(pkgs[0].pricePerPerson)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {orgRetreats.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Room / Accommodation Package
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => {
                      setSelectedPackageId(e.target.value)
                      const pkg = retreatPackages.find((p) => p.id === e.target.value)
                      if (pkg) setCustomPricePerPerson(pkg.pricePerPerson)
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {retreatPackages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatINR(p.pricePerPerson)}/person)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates & Guest Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Arrival Check-in
                  </label>
                  <input
                    type="date"
                    required
                    value={offerStartDate}
                    onChange={(e) => setOfferStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Departure Check-out
                  </label>
                  <input
                    type="date"
                    required
                    value={offerEndDate}
                    onChange={(e) => setOfferEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={offerGuestsCount}
                    onChange={(e) => setOfferGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>
              </div>

              {/* Custom Price & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Offered Base Price Per Person (INR)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    min={10000}
                    value={customPricePerPerson}
                    onChange={(e) => setCustomPricePerPerson(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    You can discount the package rate specifically for this student.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Offer Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={offerExpiryDate}
                    onChange={(e) => setOfferExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    Offer automatically expires after this date.
                  </span>
                </div>
              </div>

              {/* Optional Add-ons */}
              <div>
                <label className="block font-medium text-foreground mb-1.5">
                  Include Optional Wellness & Transport Add-ons:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAddons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id)
                    return (
                      <label
                        key={addon.id}
                        className={cn(
                          'flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors',
                          isChecked ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-secondary/40'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddonIds([...selectedAddonIds, addon.id])
                            } else {
                              setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addon.id))
                            }
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold block truncate text-[11px]">{addon.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatINR(addon.pricePerUnit)} ({addon.unit.replace('_', ' ')})
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Offer Note */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Personal Message / Terms Note to Guest
                </label>
                <textarea
                  rows={2}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Special inclusions, arrival recommendations, or dietary confirmations..."
                  className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground text-xs"
                />
              </div>

              {/* Itemized Price Summary */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Package ({offerGuestsCount} guest, {calculatedNights} nights):</span>
                  <span className="font-semibold text-foreground">
                    {formatINR(calculatedOfferPricing.breakdown.basePackageTotal)}
                  </span>
                </div>
                {calculatedOfferPricing.breakdown.addonsTotal > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Selected Add-ons:</span>
                    <span className="font-semibold text-foreground">
                      {formatINR(calculatedOfferPricing.breakdown.addonsTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>12% GST:</span>
                  <span className="font-semibold text-foreground">
                    {formatINR(calculatedOfferPricing.breakdown.taxAmount)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t text-sm font-bold text-foreground">
                  <span>Total Offer Value:</span>
                  <span>{formatINR(calculatedOfferPricing.breakdown.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-semibold pt-1">
                  <span>Required 25% Deposit Upfront:</span>
                  <span>{formatINR(calculatedOfferPricing.breakdown.depositAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-800">
                  <span>75% Balance Payable at Check-in:</span>
                  <span>{formatINR(calculatedOfferPricing.breakdown.remainingBalance)}</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOfferModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                  isLoading={isSubmittingOffer}
                >
                  Dispatch Offer to Attendee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
