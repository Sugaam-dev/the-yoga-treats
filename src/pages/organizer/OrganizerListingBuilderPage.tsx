import { useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { useDemoStore } from '@/store/useDemoStore'
import type {
  Package,
  Retreat,
  RetreatStatus,
  SkillLevel,
  YogaStyle,
} from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatINR } from '@/utils/pricing'
import { cn } from '@/lib/utils'

const ALL_YOGA_STYLES: YogaStyle[] = [
  'Vinyasa',
  'Hatha',
  'Yin',
  'Ashtanga',
  'Kundalini',
  'Restorative',
  'Sound Healing',
  'Meditation',
  'Ayurveda',
]

const ALL_SKILL_LEVELS: SkillLevel[] = [
  'All Levels',
  'Beginner',
  'Intermediate',
  'Advanced',
]

const STEPS = [
  { id: 1, label: 'Basics & Philosophy' },
  { id: 2, label: 'Sanctuary Location' },
  { id: 3, label: 'Teachers & Schedule' },
  { id: 4, label: 'Room Packages' },
  { id: 5, label: 'Cohorts & Dates' },
  { id: 6, label: 'Atmosphere & Imagery' },
  { id: 7, label: 'Review & Publish' },
]

export function OrganizerListingBuilderPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const {
    retreats,
    packages,
    organizers,
    activeOrganizerId,
    retreatListingDraft,
    saveRetreatListingDraft,
    publishRetreatListing,
  } = useDemoStore()

  const existingRetreat = useMemo(
    () => (id ? retreats.find((r) => r.id === id) : null),
    [id, retreats]
  )

  const currentOrg = useMemo(
    () => organizers.find((o) => o.id === activeOrganizerId) || organizers[0],
    [organizers, activeOrganizerId]
  )

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Step 1: Basics
  const [title, setTitle] = useState(
    existingRetreat?.title || retreatListingDraft?.title || ''
  )
  const [tagline, setTagline] = useState(
    existingRetreat?.tagline || retreatListingDraft?.tagline || ''
  )
  const [description, setDescription] = useState(
    existingRetreat?.description || retreatListingDraft?.description || ''
  )
  const [selectedStyles, setSelectedStyles] = useState<YogaStyle[]>(
    existingRetreat?.styles || retreatListingDraft?.styles || ['Vinyasa', 'Meditation']
  )
  const [selectedLevels, setSelectedLevels] = useState<SkillLevel[]>(
    existingRetreat?.skillLevels || retreatListingDraft?.skillLevels || ['All Levels']
  )
  const [groupSizeMax, setGroupSizeMax] = useState<number>(
    existingRetreat?.groupSizeMax || retreatListingDraft?.groupSizeMax || 14
  )
  const [languages, setLanguages] = useState<string>(
    existingRetreat?.languages?.join(', ') || retreatListingDraft?.languages?.join(', ') || 'English'
  )

  // Step 2: Location
  const [city, setCity] = useState(
    existingRetreat?.location.city || retreatListingDraft?.location?.city || ''
  )
  const [region, setRegion] = useState(
    existingRetreat?.location.region || retreatListingDraft?.location?.region || ''
  )
  const [country, setCountry] = useState(
    existingRetreat?.location.country || retreatListingDraft?.location?.country || ''
  )
  const [fullAddress, setFullAddress] = useState(
    existingRetreat?.location.fullAddress || retreatListingDraft?.location?.fullAddress || ''
  )

  // Step 3: Teachers & Daily Itinerary
  const [teacherName, setTeacherName] = useState(
    existingRetreat?.organizerName || currentOrg.name
  )
  const [highlights, setHighlights] = useState<string>(
    existingRetreat?.highlights.join('\n') ||
      'Twice-daily open-air yoga shala sessions\nPrivate 90-minute Ayurvedic consultation\nSunset Tibetan singing bowl ceremonies\nChef-prepared organic farm-to-table cuisine'
  )
  const [included, setIncluded] = useState<string>(
    existingRetreat?.included.join('\n') ||
      'Luxury accommodation\nAll daily nourishing sattvic meals\nAll yoga props and mats provided\nRoundtrip airport transfers'
  )
  const [dailySchedule, setDailySchedule] = useState<{ time: string; activity: string }[]>(
    existingRetreat?.dailySchedule || [
      { time: '06:30 AM', activity: 'Herbal tea ritual & sunrise meditation' },
      { time: '07:00 AM', activity: 'Solar Vinyasa flow & pranayama' },
      { time: '09:00 AM', activity: 'Nourishing botanical breakfast' },
      { time: '04:30 PM', activity: 'Lunar restorative Yin practice' },
      { time: '07:00 PM', activity: 'Communal candlelit dinner' },
    ]
  )

  // Step 4: Packages & Accommodation
  const existingPkgs = useMemo(
    () => (existingRetreat ? packages.filter((p) => p.retreatId === existingRetreat.id) : []),
    [existingRetreat, packages]
  )

  const [packageName, setPackageName] = useState(
    existingPkgs[0]?.name || 'Standard Sanctuary Room'
  )
  const [accommodationType, setAccommodationType] = useState<
    'shared_room' | 'private_room' | 'luxury_suite' | 'eco_villa'
  >(existingPkgs[0]?.accommodationType || 'private_room')
  const [pricePerPerson, setPricePerPerson] = useState<number>(
    existingPkgs[0]?.pricePerPerson || 125000
  )
  const [earlyBirdPrice, setEarlyBirdPrice] = useState<number>(
    existingPkgs[0]?.earlyBirdPrice || 112500
  )

  // Step 5: Cohort Dates
  const [startDate, setStartDate] = useState(
    existingPkgs[0]?.dateRanges[0]?.startDate || '2026-12-10'
  )
  const [endDate, setEndDate] = useState(
    existingPkgs[0]?.dateRanges[0]?.endDate || '2026-12-16'
  )
  const [availableSpots, setAvailableSpots] = useState<number>(
    existingPkgs[0]?.dateRanges[0]?.availableSpots || 8
  )

  // Step 6: Atmosphere & Imagery
  const [heroImage, setHeroImage] = useState(
    existingRetreat?.heroImage ||
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80'
  )

  // Draft persistence on step changes
  const saveCurrentDraftState = () => {
    saveRetreatListingDraft({
      title,
      tagline,
      description,
      styles: selectedStyles,
      skillLevels: selectedLevels,
      groupSizeMax,
      location: { city, region, country, fullAddress },
      heroImage,
    })
  }

  // Schedule editor handlers
  const handleAddScheduleItem = () => {
    setDailySchedule([...dailySchedule, { time: '02:00 PM', activity: 'Holistic workshop' }])
  }

  const handleRemoveScheduleItem = (index: number) => {
    setDailySchedule(dailySchedule.filter((_, i) => i !== index))
  }

  const handleScheduleChange = (index: number, field: 'time' | 'activity', value: string) => {
    setDailySchedule(
      dailySchedule.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  // Step Validation
  const validateStep = (stepNumber: number): boolean => {
    setErrorMsg(null)
    if (stepNumber === 1) {
      if (!title.trim()) {
        setErrorMsg('Please enter a retreat title.')
        return false
      }
      if (!tagline.trim()) {
        setErrorMsg('Please provide a compelling 1-line sanctuary tagline.')
        return false
      }
      if (!description.trim() || description.length < 30) {
        setErrorMsg('Retreat description should be at least 30 characters.')
        return false
      }
      if (selectedStyles.length === 0) {
        setErrorMsg('Please select at least one yoga style.')
        return false
      }
    }

    if (stepNumber === 2) {
      if (!city.trim() || !country.trim()) {
        setErrorMsg('Please enter both sanctuary city and country.')
        return false
      }
    }

    if (stepNumber === 4) {
      if (!packageName.trim()) {
        setErrorMsg('Package accommodation name is required.')
        return false
      }
      if (pricePerPerson <= 0) {
        setErrorMsg('Price per person must be greater than zero.')
        return false
      }
    }

    if (stepNumber === 5) {
      if (!startDate || !endDate) {
        setErrorMsg('Please select cohort start and end dates.')
        return false
      }
      if (new Date(endDate) <= new Date(startDate)) {
        setErrorMsg('Cohort departure date must be strictly after arrival date.')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      saveCurrentDraftState()
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1))
    }
  }

  const handlePrev = () => {
    setErrorMsg(null)
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  // Final Publish Handler
  const handlePublish = (targetStatus: RetreatStatus = 'published') => {
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s)
        return
      }
    }

    const retreatId = existingRetreat?.id || 'ret-' + Math.random().toString(36).substring(2, 8)
    const pkgId = existingPkgs[0]?.id || 'pkg-' + Math.random().toString(36).substring(2, 8)

    const nights = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    const days = nights + 1

    const finalRetreat: Retreat = {
      id: retreatId,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: tagline.trim(),
      description: description.trim(),
      location: {
        city: city.trim(),
        region: region.trim(),
        country: country.trim(),
        fullAddress: fullAddress.trim(),
      },
      heroImage: heroImage.trim(),
      galleryImages: [heroImage.trim()],
      styles: selectedStyles,
      skillLevels: selectedLevels,
      durationDays: days,
      durationNights: nights,
      groupSizeMax,
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      highlights: highlights.split('\n').map((h) => h.trim()).filter(Boolean),
      included: included.split('\n').map((i) => i.trim()).filter(Boolean),
      notIncluded: ['International airfare', 'Travel health insurance'],
      dailySchedule,
      organizerId: currentOrg.id,
      organizerName: currentOrg.name,
      organizerAvatar: currentOrg.logoUrl,
      organizerVerified: currentOrg.verificationStatus === 'verified',
      rating: 5.0,
      reviewCount: existingRetreat?.reviewCount || 0,
      startingPrice: pricePerPerson,
      currency: 'INR',
      status: targetStatus,
      featured: false,
      createdAt: existingRetreat?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }

    const finalPackage: Package = {
      id: pkgId,
      retreatId,
      name: packageName.trim(),
      description: `Includes full immersion tuition, organic meals, and ${accommodationType.replace('_', ' ')}.`,
      accommodationType,
      pricePerPerson,
      earlyBirdPrice: earlyBirdPrice > 0 ? earlyBirdPrice : undefined,
      currency: 'INR',
      maxOccupancy: 2,
      remainingSpots: availableSpots,
      includesMeals: true,
      dateRanges: [
        {
          id: 'dr-' + Math.random().toString(36).substring(2, 6),
          startDate,
          endDate,
          availableSpots,
        },
      ],
      features: ['Organic cotton linens', 'Daily botanical housekeeping', 'Sanctuary shala access'],
    }

    publishRetreatListing(finalRetreat, [finalPackage])
    navigate('/organizer/listings')
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <Link
          to="/organizer/listings"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Listings
        </Link>
        <PageHeader
          title={existingRetreat ? `Edit Listing: ${existingRetreat.title}` : 'Create Sanctuary Immersion'}
          description="Build an immersive listing with customizable packages, yoga lineages, and cohort availability."
          badge={
            <Badge variant="gold" size="sm">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].label}
            </Badge>
          }
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePublish('draft')}
                className="gap-1.5 text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                Save as Draft
              </Button>
              <Button
                size="sm"
                onClick={() => handlePublish('published')}
                className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              >
                <Send className="h-3.5 w-3.5" />
                Publish to Marketplace
              </Button>
            </div>
          }
        />
      </div>

      {/* Step Progress Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {STEPS.map((s) => {
          const isDone = s.id < currentStep
          const isCurrent = s.id === currentStep
          return (
            <button
              key={s.id}
              onClick={() => {
                if (s.id < currentStep || validateStep(currentStep)) {
                  setCurrentStep(s.id)
                }
              }}
              className={cn(
                'p-2.5 rounded-xl border text-left transition-all',
                isCurrent
                  ? 'border-primary bg-primary/10 shadow-xs'
                  : isDone
                  ? 'border-emerald-600/30 bg-emerald-50/40'
                  : 'border-border bg-card opacity-60'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={cn(
                    'h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isDone
                      ? 'bg-emerald-700 text-white'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="h-2.5 w-2.5" /> : s.id}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Step {s.id}
                </span>
              </div>
              <span className="text-xs font-semibold text-foreground line-clamp-1">
                {s.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wizard Form Cards */}
      <Card className="p-6 border-border/80 space-y-6">
        {/* Step 1: Basics & Philosophy */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Retreat Basics & Lineage Philosophy
            </h3>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Retreat Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sacred Prana Flow & Breathwork Immersion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Tagline / Essence <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 7 days of clifftop ocean flows, Vedic pranayama, and Ayurvedic dining"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                In-Depth Philosophy & Sanctuary Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Describe the transformational journey, the natural setting, and teacher approach..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-3.5 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-2">
                  Yoga Styles Taught (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_YOGA_STYLES.map((style) => {
                    const isSelected = selectedStyles.includes(style)
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedStyles(selectedStyles.filter((s) => s !== style))
                          } else {
                            setSelectedStyles([...selectedStyles, style])
                          }
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium transition-colors border',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary/40 border-border text-foreground hover:bg-secondary/70'
                        )}
                      >
                        {style}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-2">
                  Suitable Skill Levels
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILL_LEVELS.map((level) => {
                    const isSelected = selectedLevels.includes(level)
                    return (
                      <button
                        type="button"
                        key={level}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLevels(selectedLevels.filter((l) => l !== level))
                          } else {
                            setSelectedLevels([...selectedLevels, level])
                          }
                        }}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium transition-colors border',
                          isSelected
                            ? 'bg-accent text-accent-foreground border-accent'
                            : 'bg-secondary/40 border-border text-foreground hover:bg-secondary/70'
                        )}
                      >
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Maximum Cohort Group Size
                </label>
                <input
                  type="number"
                  min={4}
                  max={40}
                  value={groupSizeMax}
                  onChange={(e) => setGroupSizeMax(parseInt(e.target.value) || 12)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Instruction Languages (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="English, Sanskrit"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Sanctuary Location */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Sanctuary Destination & Geography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  City / Town <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ubud"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Region / State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bali"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Country <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indonesia"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Full Physical Address / Arrival Guidance
              </label>
              <input
                type="text"
                placeholder="e.g. Jl. Raya Sanggingan No. 88, Kedewatan, Ubud, Bali 80571"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>
          </div>
        )}

        {/* Step 3: Teachers & Daily Itinerary */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Teachers & Typical Daily Rhythm
            </h3>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Primary Guide / Lead Teacher Name
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-foreground">
                  Typical Daily Rhythm / Schedule
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddScheduleItem}
                  className="h-6 text-[11px] gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Activity
                </Button>
              </div>

              <div className="space-y-2">
                {dailySchedule.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => handleScheduleChange(idx, 'time', e.target.value)}
                      className="w-28 text-xs px-2.5 py-1.5 rounded border border-border bg-card font-mono"
                    />
                    <input
                      type="text"
                      value={item.activity}
                      onChange={(e) => handleScheduleChange(idx, 'activity', e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 rounded border border-border bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Sanctuary Highlights (one per line)
                </label>
                <textarea
                  rows={4}
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-card"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  What is Included (one per line)
                </label>
                <textarea
                  rows={4}
                  value={included}
                  onChange={(e) => setIncluded(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-card"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Room Packages */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Accommodation Package & Tuition Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Package Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ocean View Private Shala Villa"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Accommodation Tier
                </label>
                <select
                  value={accommodationType}
                  onChange={(e) =>
                    setAccommodationType(
                      e.target.value as 'shared_room' | 'private_room' | 'luxury_suite' | 'eco_villa'
                    )
                  }
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                >
                  <option value="shared_room">Shared Room</option>
                  <option value="private_room">Private Room</option>
                  <option value="luxury_suite">Luxury Suite</option>
                  <option value="eco_villa">Eco Villa</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Standard Price Per Person (INR ₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step={1000}
                  min={10000}
                  value={pricePerPerson}
                  onChange={(e) => setPricePerPerson(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Early Bird Discount Price (Optional)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={earlyBirdPrice}
                  onChange={(e) => setEarlyBirdPrice(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Cohorts & Availability */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Cohort Schedule & Available Spots
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Cohort Check-in Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Cohort Check-out Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Available Student Spots
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={availableSpots}
                  onChange={(e) => setAvailableSpots(parseInt(e.target.value) || 4)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Atmosphere & Imagery */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Atmosphere & Imagery
            </h3>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Hero Photograph URL
              </label>
              <input
                type="url"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
              />
            </div>

            {heroImage && (
              <div className="relative h-64 rounded-xl overflow-hidden border border-border mt-3">
                <img
                  src={heroImage}
                  alt="Retreat preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded text-xs font-medium">
                  Cover Photo Preview
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 7: Review & Final Publish */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <h3 className="font-serif text-lg font-bold text-foreground">
              Final Review & Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Listing Overview
                </span>
                <p className="font-bold text-foreground text-sm">{title}</p>
                <p className="text-muted-foreground italic">{tagline}</p>
                <p className="text-muted-foreground">
                  Location: {city}, {country}
                </p>
                <p className="text-muted-foreground">
                  Styles: {selectedStyles.join(', ')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Accommodation & Schedule
                </span>
                <p className="font-bold text-foreground text-sm">{packageName}</p>
                <p className="text-foreground">
                  Price: <strong>{formatINR(pricePerPerson)}</strong> per attendee
                </p>
                <p className="text-muted-foreground">
                  Cohort: {startDate} &rarr; {endDate} ({availableSpots} spots available)
                </p>
                <p className="text-muted-foreground">
                  Host: {currentOrg.name}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block">Marketplace Ready:</span>
                <span>
                  Publishing this listing will immediately expose it to students browsing the guest marketplace at <code>/explore</code> and <code>/</code>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrev}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Step
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < STEPS.length ? (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="gap-1 text-xs"
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => handlePublish('published')}
                className="gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              >
                <Send className="h-3.5 w-3.5" />
                Publish Listing Live
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
