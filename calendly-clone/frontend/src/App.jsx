import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import AdminDashboard from './pages/AdminDashboard'
import AvailabilityPage from './pages/AvailabilityPage'
import MeetingsPage from './pages/MeetingsPage'
import PublicBookingPage from './pages/PublicBookingPage'
import BookingConfirmPage from './pages/BookingConfirmPage'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          style: { borderRadius: '8px', fontFamily: 'inherit' },
        }}
      />
      <Routes>
        {/* Public pages — no sidebar */}
        <Route path="/book/:slug"         element={<PublicBookingPage />} />
        <Route path="/book/:slug/confirm" element={<BookingConfirmPage />} />

        {/* Admin pages — with sidebar */}
        <Route path="/*" element={
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-60 p-8">
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard"    element={<AdminDashboard />} />
                <Route path="/availability" element={<AvailabilityPage />} />
                <Route path="/meetings"     element={<MeetingsPage />} />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </>
  )
}
