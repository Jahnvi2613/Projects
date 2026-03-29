import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Event Types ───────────────────────────────────────────────
export const getEventTypes       = ()           => api.get('/events/all')
export const getActiveEventTypes = ()           => api.get('/events/')
export const getEventTypeBySlug  = (slug)       => api.get(`/events/slug/${slug}`)
export const createEventType     = (data)       => api.post('/events/', data)
export const updateEventType     = (id, data)   => api.put(`/events/${id}`, data)
export const deleteEventType     = (id)         => api.delete(`/events/${id}`)

// ── Availability ──────────────────────────────────────────────
export const getAvailability   = ()     => api.get('/availability/')
export const updateAvailability = (data) => api.put('/availability/', data)
export const getOverrides      = ()     => api.get('/availability/overrides')
export const createOverride    = (data) => api.post('/availability/overrides', data)
export const deleteOverride    = (id)   => api.delete(`/availability/overrides/${id}`)

// ── Bookings (Public) ─────────────────────────────────────────
export const getAvailableSlots = (slug, date) =>
  api.get(`/bookings/${slug}/slots`, { params: { date } })
export const bookSlot = (slug, data) => api.post(`/bookings/${slug}/book`, data)

// ── Meetings ──────────────────────────────────────────────────
export const getUpcomingMeetings = ()   => api.get('/meetings/upcoming')
export const getPastMeetings     = ()   => api.get('/meetings/past')
export const getMeeting          = (id) => api.get(`/meetings/${id}`)
export const cancelMeeting       = (id) => api.patch(`/meetings/${id}/cancel`)

export default api