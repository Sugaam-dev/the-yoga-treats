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
  fullAddress?: string
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

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
export type PaymentStatus = 'paid' | 'deposit_paid' | 'pending' | 'refunded'

export interface Booking {
  id: string
  bookingReference: string
  retreatId: string
  retreatTitle: string
  retreatImage: string
  retreatLocation: string
  packageId: string
  packageName: string
  organizerId: string
  organizerName: string
  guestId: string
  guestName: string
  guestEmail: string
  startDate: string
  endDate: string
  guestsCount: number
  totalAmount: number
  currency: string
  paymentStatus: PaymentStatus
  bookingStatus: BookingStatus
  specialRequests?: string
  createdAt: string
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
}

export type ReviewStatus = 'published' | 'flagged' | 'hidden'

export interface Review {
  id: string
  retreatId: string
  retreatTitle: string
  guestId: string
  guestName: string
  guestAvatar: string
  rating: number
  title: string
  comment: string
  date: string
  status: ReviewStatus
  organizerResponse?: {
    response: string
    respondedAt: string
  }
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
