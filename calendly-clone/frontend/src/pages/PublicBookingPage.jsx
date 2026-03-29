import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEventTypeBySlug, getAvailableSlots, bookSlot } from '../api'

// ── Helpers ───────────────────────────────────────────────────
const toDateStr = d =>
  `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`

const fmtTime = t => {
  const [h, m] = t.split(':').map(Number)
  return `${h%12||12}:${m.toString().padStart(2,'0')} ${h>=12?'PM':'AM'}`
}

const addMin = (t, mins) => {
  const [h, m] = t.split(':').map(Number)
  const tot = h*60 + m + mins
  return `${Math.floor(tot/60).toString().padStart(2,'0')}:${(tot%60).toString().padStart(2,'0')}`
}

const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June',
               'July','August','September','October','November','December']

function buildCalendar(year, month) {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month+1, 0)
  const cells = []
  for (let i = 0; i < first.getDay(); i++)
    cells.push({ d: new Date(year, month, -first.getDay()+i+1), cur: false })
  for (let i = 1; i <= last.getDate(); i++)
    cells.push({ d: new Date(year, month, i), cur: true })
  while (cells.length < 42)
    cells.push({ d: new Date(year, month+1, cells.length - last.getDate() - first.getDay() + 1), cur: false })
  return cells
}

// ── Page ──────────────────────────────────────────────────────
export default function PublicBookingPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [event, setEvent]     = useState(null)
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selDate, setSelDate] = useState(null)

  const [slots, setSlots]           = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selSlot, setSelSlot]       = useState(null)
  const [showForm, setShowForm]     = useState(false)

  const [form, setForm]       = useState({ name:'', email:'', notes:'' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getEventTypeBySlug(slug)
      .then(({ data }) => setEvent(data))
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!selDate) return
    setSlotsLoading(true); setSelSlot(null); setShowForm(false)
    getAvailableSlots(slug, toDateStr(selDate))
      .then(({ data }) => setSlots(data.slots))
      .catch(() => { setSlots([]); toast.error('Failed to load slots') })
      .finally(() => setSlotsLoading(false))
  }, [selDate])

  const prevMonth = () => {
    if (month === 0) { setYear(y=>y-1); setMonth(11) } else setMonth(m=>m-1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y=>y+1); setMonth(0) } else setMonth(m=>m+1)
  }

  const handleBook = async e => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return toast.error('Name and email required')
    setSubmitting(true)
    try {
      const { data } = await bookSlot(slug, {
        invitee_name: form.name, invitee_email: form.email,
        date: toDateStr(selDate), start_time: selSlot,
        notes: form.notes || undefined,
      })
      navigate(`/book/${slug}/confirm`, { state: { meeting: data, event } })
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )
  if (!event) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
      Event not found.
    </div>
  )

  const cells = buildCalendar(year, month)
  const todayStr = toDateStr(today)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-4xl flex min-h-[520px]">

        {/* ── Left: Event Info ──────────────────────────── */}
        <div className="w-64 flex-shrink-0 p-7 border-r border-gray-100 flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">A</div>
            <span className="text-sm font-semibold text-gray-600">Admin User</span>
          </div>
          <div className="w-3 h-3 rounded-full mb-2" style={{ background: event.color }} />
          <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{event.name}</h1>
          <div className="space-y-1.5 mb-4">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Clock size={14} /> {event.duration} minutes
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Globe size={14} /> Asia/Kolkata
            </p>
          </div>
          {event.description && (
            <p className="text-sm text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
              {event.description}
            </p>
          )}

          {selDate && selSlot && (
            <div className="mt-auto pt-4">
              <div className="bg-blue-50 rounded-xl p-3 border-l-4 border-blue-500">
                <p className="text-xs text-gray-500 mb-0.5">Selected time</p>
                <p className="text-sm font-bold text-gray-900">
                  {selDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  {fmtTime(selSlot)} – {fmtTime(addMin(selSlot, event.duration))}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Middle: Calendar ──────────────────────────── */}
        {!showForm && (
          <div className="flex-1 p-7 border-r border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {MONTHS[month]} {year}
              </h2>
              <div className="flex gap-1">
                <button onClick={prevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {DAYS.map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map(({ d, cur }, i) => {
                const ds = toDateStr(d)
                const isPast = ds < todayStr
                const isSel  = selDate && ds === toDateStr(selDate)
                const isToday = ds === todayStr
                return (
                  <button key={i} disabled={isPast || !cur}
                          onClick={() => setSelDate(d)}
                          className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                            ${!cur ? 'invisible' : ''}
                            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                            ${isSel  ? 'bg-blue-600 text-white font-bold' : ''}
                            ${isToday && !isSel ? 'ring-2 ring-blue-500 text-blue-600 font-bold' : ''}
                            ${!isPast && !isSel && cur ? 'hover:bg-blue-50 hover:text-blue-600 text-gray-700' : ''}
                          `}>
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Right: Slots or Booking Form ─────────────── */}
        {selDate && (
          <div className="w-52 flex-shrink-0 p-5 overflow-y-auto">
            {!showForm ? (
              <>
                <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">
                  {selDate.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}
                </h3>
                {slotsLoading ? (
                  <div className="flex justify-center mt-8">
                    <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-8">No available times on this day.</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map(slot => (
                      <button key={slot}
                              onClick={() => { setSelSlot(slot); setShowForm(true) }}
                              className="w-full py-2.5 border-2 border-blue-500 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                        {fmtTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div>
                <button onClick={() => { setShowForm(false); setSelSlot(null) }}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                  <ChevronLeft size={14} /> Back
                </button>
                <h3 className="text-sm font-bold text-gray-900 mb-4">Your details</h3>
                <form onSubmit={handleBook} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name *</label>
                    <input className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                           value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                           placeholder="Full name" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email *</label>
                    <input type="email"
                           className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                           value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
                           placeholder="you@email.com" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
                    <textarea className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              rows={3} value={form.notes}
                              onChange={e => setForm(f=>({...f,notes:e.target.value}))}
                              placeholder="Anything to share..." />
                  </div>
                  <button type="submit" disabled={submitting}
                          className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {submitting ? 'Booking…' : 'Confirm'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
