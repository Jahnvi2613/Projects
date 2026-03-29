
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getAvailability, updateAvailability } from '../api'

const DAYS = [
  { key: 'sunday',    label: 'Sunday' },
  { key: 'monday',    label: 'Monday' },
  { key: 'tuesday',   label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday' },
  { key: 'friday',    label: 'Friday' },
  { key: 'saturday',  label: 'Saturday' },
]

const TIMEZONES = [
  'Asia/Kolkata','America/New_York','America/Los_Angeles',
  'America/Chicago','Europe/London','Europe/Berlin',
  'Asia/Tokyo','Asia/Singapore','Australia/Sydney','UTC',
]

// Generate HH:MM every 30 min
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${h.toString().padStart(2,'0')}:${m}`
})

const fmt = t => {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function AvailabilityPage() {
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [slots, setSlots] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data } = await getAvailability()
      setTimezone(data.timezone)
      const s = {}
      DAYS.forEach(({ key }) => {
        const ex = data.slots.find(sl => sl.day_of_week === key)
        s[key] = ex
          ? { active: ex.is_active, start: ex.start_time, end: ex.end_time }
          : { active: false, start: '09:00', end: '17:00' }
      })
      setSlots(s)
    } catch { toast.error('Failed to load availability') }
    finally { setLoading(false) }
  }

  const toggle  = day => setSlots(p => ({ ...p, [day]: { ...p[day], active: !p[day].active } }))
  const update  = (day, k, v) => setSlots(p => ({ ...p, [day]: { ...p[day], [k]: v } }))

  const save = async () => {
    setSaving(true)
    try {
      const payload = Object.entries(slots)
        .filter(([, s]) => s.active)
        .map(([day, s]) => ({ day_of_week: day, start_time: s.start, end_time: s.end, is_active: true }))
      await updateAvailability({ timezone, slots: payload })
      toast.success('Availability saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex justify-center mt-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-sm text-gray-500 mt-1">Set the times you're available for bookings each week.</p>
        </div>
        <button onClick={save} disabled={saving}
                className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Timezone */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Timezone</h3>
          <select value={timezone} onChange={e => setTimezone(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 max-w-xs w-full">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>

        {/* Days */}
        <div className="px-6 py-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Weekly Hours</h3>
          <div className="space-y-1">
            {DAYS.map(({ key, label }) => {
              const s = slots[key] || { active: false, start: '09:00', end: '17:00' }
              return (
                <div key={key}
                     className={`flex items-center gap-6 px-4 py-3 rounded-lg transition-colors ${
                       s.active ? 'bg-blue-50' : ''
                     }`}>
                  {/* Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer w-44 flex-shrink-0">
                    <button type="button" onClick={() => toggle(key)}
                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                              s.active ? 'bg-blue-600' : 'bg-gray-200'
                            }`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        s.active ? 'translate-x-5' : ''
                      }`} />
                    </button>
                    <span className={`text-sm font-medium ${s.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </label>

                  {s.active ? (
                    <div className="flex items-center gap-2">
                      <select value={s.start} onChange={e => update(key, 'start', e.target.value)}
                              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                      </select>
                      <span className="text-gray-400 font-semibold">–</span>
                      <select value={s.end} onChange={e => update(key, 'end', e.target.value)}
                              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Unavailable</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
