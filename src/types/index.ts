export type DemoRole = 'guest' | 'organizer' | 'admin'

export type YogaStyle = 
  | 'Vinyasa'
  | 'Hatha'
  | 'Yin'
  | 'Ashtanga'
  | 'Kundalini'
  | 'Restorative'
  | 'Sound Healing'
  | 'Meditation'
  | 'Ayurveda'

export type SkillLevel = 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced'

export type RetreatStatus = 'published' | 'pending_review' | 'draft' | 'archived'

export interface RetreatLocation {
  city: string
  region: string
  country: string
  state?: string
  address?: string
  fullAddress?: string
  airportGuidance?: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface PackageDateRange {
  id: string
  startDate: string
  endDate: string
  availableSpots: number
}

export interface Package {
  id: string
  retreatId: string
  name: string
  description: string
  accommodationType: 'shared_room' | 'private_room' | 'luxury_suite' | 'eco_villa'
  pricePerPerson: number
  earlyBirdPrice?: number
  currency: string
  maxOccupancy: number
  remainingSpots: number
  includesMeals: boolean
  dateRanges: PackageDateRange[]
  features: string[]
}

export interface Retreat {
  id: string
  title: string
  slug: string
  tagline: string
  description: string
  location: RetreatLocation
  heroImage: string
  galleryImages: string[]
  styles: YogaStyle[]
  skillLevels: SkillLevel[]
  durationDays: number
  durationNights: number
  groupSizeMax: number
  languages: string[]
  highlights: string[]
  included: string[]
  notIncluded: string[]
  dailySchedule: { time: string; activity: string }[]
  organizerId: string
  organizerName: string
  organizerAvatar: string
  organizerVerified: boolean
  rating: number
  reviewCount: number
  startingPrice: number
  currency: string
  status: RetreatStatus
  featured: boolean
  createdAt: string
  updatedAt: string
}

export type VerificationStatus = 'verified' | 'pending' | 'rejected'

export interface Organizer {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  logoUrl: string
  coverImage: string
  bio: string
  credentials: string[]
  verificationStatus: VerificationStatus
  rating: number
  reviewCount: number
  activeListingsCount: number
  totalBookingsCount: number
  location: string
  website?: string
  joinedDate: string
  bankDetails?: {
    bankName: string
    accountLast4: string
    currency: string
  }
}

export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string
  country: string
  joinedDate: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  dietaryPreferences: string[]
  yogaExperienceLevel: SkillLevel
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'rejected'
export type PaymentStatus = 'paid' | 'deposit_paid' | 'pending' | 'partially_refunded' | 'refunded'

export interface BookingHistoryEntry {
  status: BookingStatus
  timestamp: string
  note?: string
  actorRole?: DemoRole
}

export interface BookingAddon {
  id: string
  name: string
  description: string
  pricePerUnit: number
  unit: 'per_guest' | 'per_booking'
  category: 'wellness' | 'transport' | 'nutrition'
}

export interface SelectedAddon {
  addonId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface BookingPricingBreakdown {
  nightsCount: number
  guestsCount: number
  packagePricePerPerson: number
  basePackageTotal: number
  addonsTotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  depositPercentage: number
  depositAmount: number
  remainingBalance: number
  currency: string
}

export interface Booking {
  id: string
  bookingReference: string
  retreatId: string
  retreatTitle: string
  retreatImage: string
  retreatLocation: string
  packageId: string
  packageName: string
  accommodationType?: string
  organizerId: string
  organizerName: string
  guestId: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  startDate: string
  endDate: string
  nightsCount?: number
  guestsCount: number
  totalAmount: number
  currency: string
  paymentStatus: PaymentStatus
  bookingStatus: BookingStatus
  specialRequests?: string
  createdAt: string
  selectedAddons?: SelectedAddon[]
  pricing?: BookingPricingBreakdown
  transactionReference?: string
  depositPaidAmount?: number
  remainingBalance?: number
  history?: BookingHistoryEntry[]
  cancellationReason?: string
  cancelledAt?: string
  checkedInAt?: string
  completedAt?: string
  rejectedAt?: string
  refundAmount?: number
  refundReference?: string
}

export interface Refund {
  id: string
  refundReference: string
  bookingId: string
  bookingReference: string
  paymentId: string
  guestId: string
  guestName: string
  retreatTitle: string
  organizerId: string
  amount: number
  currency: string
  reason: string
  policyApplied: string
  percentage: number
  status: 'completed' | 'pending'
  processedAt: string
}

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface CustomOffer {
  id: string
  offerReference: string
  inquiryId: string
  organizerId: string
  organizerName: string
  guestId: string
  guestName: string
  guestEmail?: string
  retreatId: string
  retreatTitle: string
  retreatImage: string
  retreatLocation: string
  packageId: string
  packageName: string
  accommodationType?: string
  startDate: string
  endDate: string
  nightsCount: number
  guestsCount: number
  selectedAddons: SelectedAddon[]
  pricing: BookingPricingBreakdown
  message: string
  expiresAt: string
  status: OfferStatus
  createdAt: string
  bookingId?: string
}

export interface CancellationQuote {
  daysUntilArrival: number
  refundPercentage: number
  refundableAmount: number
  policyRule: string
  canCancel: boolean
  rejectionReason?: string
}

export interface BookingDraft {
  retreatId: string
  packageId: string
  startDate: string
  endDate: string
  guestsCount: number
  selectedAddonIds: string[]
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests: string
  agreedToTerms: boolean
  currentStep: number
}

export type InquiryStatus = 'open' | 'replied' | 'closed'

export interface Inquiry {
  id: string
  inquiryNumber: string
  retreatId?: string
  retreatTitle?: string
  guestId: string
  guestName: string
  guestEmail: string
  guestAvatar?: string
  organizerId: string
  organizerName: string
  subject: string
  lastMessageSnippet: string
  status: InquiryStatus
  unreadByOrganizer: boolean
  unreadByGuest: boolean
  messageCount: number
  createdAt: string
  updatedAt: string
  customOfferId?: string
}

export interface Message {
  id: string
  inquiryId: string
  senderId: string
  senderRole: DemoRole
  senderName: string
  senderAvatar?: string
  content: string
  createdAt: string
  read: boolean
  isAutoReply?: boolean
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'published' | 'flagged' | 'hidden'

export interface Review {
  id: string
  retreatId: string
  retreatTitle: string
  bookingId?: string
  guestId: string
  guestName: string
  guestAvatar: string
  rating: number
  teacherRating?: number
  venueRating?: number
  title: string
  comment: string
  date: string
  status: ReviewStatus
  moderationNote?: string
  moderatedAt?: string
  organizerResponse?: {
    response: string
    respondedAt: string
  }
}

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_checkin'
  | 'custom_offer'
  | 'inquiry'
  | 'review_submitted'
  | 'review_moderated'
  | 'listing_moderated'
  | 'payout'

export interface DemoNotification {
  id: string
  recipientRole: DemoRole
  title: string
  message: string
  type: NotificationType
  timestamp: string
  read: boolean
  link?: string
  actorName?: string
}

export type PaymentTransactionStatus = 'completed' | 'processing' | 'failed' | 'refunded'

export interface Payment {
  id: string
  paymentReference: string
  bookingId: string
  bookingReference: string
  guestId: string
  guestName: string
  retreatTitle: string
  amount: number
  currency: string
  paymentMethod: 'credit_card' | 'bank_transfer' | 'apple_pay'
  status: PaymentTransactionStatus
  processedAt: string
  receiptUrl?: string
}

export type PayoutStatus = 'paid' | 'pending' | 'in_transit' | 'failed'

export interface Payout {
  id: string
  payoutReference: string
  organizerId: string
  organizerName: string
  amount: number
  feeDeduction: number
  netAmount: number
  currency: string
  status: PayoutStatus
  destinationAccount: string
  scheduledDate: string
  processedDate?: string
}
