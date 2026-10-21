import { Routes, Route } from 'react-router-dom'
import { GuestLayout } from '@/layouts/GuestLayout'
import { OrganizerLayout } from '@/layouts/OrganizerLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

// Guest Pages
import { HomePage } from '@/pages/guest/HomePage'
import { ExplorePage } from '@/pages/guest/ExplorePage'
import { RetreatDetailsPage } from '@/pages/guest/RetreatDetailsPage'
import { GuestBookingsPage } from '@/pages/guest/GuestBookingsPage'

// Organizer Pages
import { OrganizerOverviewPage } from '@/pages/organizer/OrganizerOverviewPage'
import { OrganizerListingsPage } from '@/pages/organizer/OrganizerListingsPage'
import { OrganizerBookingsPage } from '@/pages/organizer/OrganizerBookingsPage'
import { OrganizerInquiriesPage } from '@/pages/organizer/OrganizerInquiriesPage'

// Admin Pages
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { AdminListingsPage } from '@/pages/admin/AdminListingsPage'
import { AdminOrganizersPage } from '@/pages/admin/AdminOrganizersPage'
import { AdminFinancePage } from '@/pages/admin/AdminFinancePage'

// 404
import { NotFoundPage } from '@/pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. Guest Marketplace Routes */}
      <Route element={<GuestLayout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="retreats/:id" element={<RetreatDetailsPage />} />
        <Route path="account/bookings" element={<GuestBookingsPage />} />
      </Route>

      {/* 2. School Organizer SaaS Routes */}
      <Route path="organizer" element={<OrganizerLayout />}>
        <Route index element={<OrganizerOverviewPage />} />
        <Route path="listings" element={<OrganizerListingsPage />} />
        <Route path="bookings" element={<OrganizerBookingsPage />} />
        <Route path="inquiries" element={<OrganizerInquiriesPage />} />
      </Route>

      {/* 3. Team Admin Operations Routes */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="listings" element={<AdminListingsPage />} />
        <Route path="organizers" element={<AdminOrganizersPage />} />
        <Route path="finance" element={<AdminFinancePage />} />
      </Route>

      {/* 4. Global 404 Route */}
      <Route path="*" element={<GuestLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
