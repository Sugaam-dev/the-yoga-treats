import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Booking,
  BookingStatus,
  DemoRole,
  Guest,
  Inquiry,
  Message,
  Organizer,
  Package,
  Payment,
  Payout,
  Retreat,
  RetreatStatus,
  Review,
  VerificationStatus,
} from '@/types'
import {
  INITIAL_BOOKINGS,
  INITIAL_GUEST,
  INITIAL_INQUIRIES,
  INITIAL_MESSAGES,
  INITIAL_ORGANIZERS,
  INITIAL_PACKAGES,
  INITIAL_PAYMENTS,
  INITIAL_PAYOUTS,
  INITIAL_RETREATS,
  INITIAL_REVIEWS,
} from '@/data/seedData'

export interface ToastItem {
  id: string
  title: string
  description?: string
  type?: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

interface DemoState {
  // Active demo perspective
  demoRole: DemoRole
  activeOrganizerId: string

  // Domain data
  retreats: Retreat[]
  packages: Package[]
  organizers: Organizer[]
  guest: Guest
  bookings: Booking[]
  inquiries: Inquiry[]
  messages: Message[]
  reviews: Review[]
  payments: Payment[]
  payouts: Payout[]

  // Toast system
  toasts: ToastItem[]

  // Actions
  setDemoRole: (role: DemoRole) => void
  setActiveOrganizerId: (id: string) => void
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  resetDemoData: () => void

  // Moderation / mutations for interactive demo
  updateRetreatStatus: (retreatId: string, status: RetreatStatus) => void
  updateOrganizerVerification: (organizerId: string, status: VerificationStatus) => void
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void
  addInquiryMessage: (inquiryId: string, content: string, senderRole?: DemoRole) => void
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      demoRole: 'guest',
      activeOrganizerId: 'org-bali-prana',

      retreats: INITIAL_RETREATS,
      packages: INITIAL_PACKAGES,
      organizers: INITIAL_ORGANIZERS,
      guest: INITIAL_GUEST,
      bookings: INITIAL_BOOKINGS,
      inquiries: INITIAL_INQUIRIES,
      messages: INITIAL_MESSAGES,
      reviews: INITIAL_REVIEWS,
      payments: INITIAL_PAYMENTS,
      payouts: INITIAL_PAYOUTS,

      toasts: [],

      setDemoRole: (role) => {
        set({ demoRole: role })
        const label = role === 'guest' ? 'Guest Traveler' : role === 'organizer' ? 'School Organizer' : 'Team Admin'
        get().addToast({
          title: `Role Switched: ${label}`,
          description: `You are now browsing from the perspective of a ${label.toLowerCase()}.`,
          type: 'info',
        })
      },

      setActiveOrganizerId: (id) => set({ activeOrganizerId: id }),

      addToast: (toast) => {
        const id = 'toast-' + Math.random().toString(36).substring(2, 9)
        const newToast: ToastItem = { ...toast, id }
        set((state) => ({ toasts: [...state.toasts, newToast] }))

        const duration = toast.duration ?? 4500
        setTimeout(() => {
          get().removeToast(id)
        }, duration)
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      },

      resetDemoData: () => {
        set({
          retreats: INITIAL_RETREATS,
          packages: INITIAL_PACKAGES,
          organizers: INITIAL_ORGANIZERS,
          guest: INITIAL_GUEST,
          bookings: INITIAL_BOOKINGS,
          inquiries: INITIAL_INQUIRIES,
          messages: INITIAL_MESSAGES,
          reviews: INITIAL_REVIEWS,
          payments: INITIAL_PAYMENTS,
          payouts: INITIAL_PAYOUTS,
        })
        get().addToast({
          title: 'Demo Data Reset',
          description: 'All retreat listings, bookings, inquiries, and moderation statuses restored to factory seed state.',
          type: 'success',
        })
      },

      updateRetreatStatus: (retreatId, status) => {
        set((state) => ({
          retreats: state.retreats.map((r) =>
            r.id === retreatId ? { ...r, status, updatedAt: new Date().toISOString().split('T')[0] } : r
          ),
        }))
        get().addToast({
          title: 'Listing Status Updated',
          description: `Retreat ${retreatId} marked as ${status}.`,
          type: 'success',
        })
      },

      updateOrganizerVerification: (organizerId, status) => {
        set((state) => ({
          organizers: state.organizers.map((o) =>
            o.id === organizerId ? { ...o, verificationStatus: status } : o
          ),
        }))
        get().addToast({
          title: 'Verification Updated',
          description: `Organizer status changed to ${status}.`,
          type: 'info',
        })
      },

      updateBookingStatus: (bookingId, status) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, bookingStatus: status } : b
          ),
        }))
        get().addToast({
          title: 'Booking Status Updated',
          description: `Booking #${bookingId} is now ${status}.`,
          type: 'success',
        })
      },

      addInquiryMessage: (inquiryId, content, senderRole = 'organizer') => {
        const msgId = 'msg-' + Date.now()
        const newMsg: Message = {
          id: msgId,
          inquiryId,
          senderId: senderRole === 'guest' ? 'guest-01' : 'org-bali-prana',
          senderRole,
          senderName: senderRole === 'guest' ? 'Maya Lin' : 'Prana Veda Sanctuary',
          content,
          createdAt: new Date().toISOString(),
          read: true,
        }

        set((state) => ({
          messages: [...state.messages, newMsg],
          inquiries: state.inquiries.map((inq) =>
            inq.id === inquiryId
              ? {
                  ...inq,
                  lastMessageSnippet: content.slice(0, 100),
                  messageCount: inq.messageCount + 1,
                  status: senderRole === 'organizer' ? 'replied' : 'open',
                  unreadByGuest: senderRole === 'organizer',
                  unreadByOrganizer: senderRole === 'guest',
                  updatedAt: new Date().toISOString(),
                }
              : inq
          ),
        }))

        get().addToast({
          title: 'Message Sent',
          description: 'Your reply has been added to the inquiry conversation.',
          type: 'success',
        })
      },
    }),
    {
      name: 'the-yoga-treats-demo-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        demoRole: state.demoRole,
        activeOrganizerId: state.activeOrganizerId,
        retreats: state.retreats,
        packages: state.packages,
        organizers: state.organizers,
        guest: state.guest,
        bookings: state.bookings,
        inquiries: state.inquiries,
        messages: state.messages,
        reviews: state.reviews,
        payments: state.payments,
        payouts: state.payouts,
      }),
    }
  )
)
