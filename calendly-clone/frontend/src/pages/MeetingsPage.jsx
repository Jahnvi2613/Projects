import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Mail, ChevronDown, ChevronUp, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUpcomingMeetings, getPastMeetings, cancelMeeting } from '../api'

const fmtDate = dateStr => {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((d - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })
}

const fmtTime = t => {
  const [h, m] = t.split(':').map(Number)
  return `${h%12||12}:${m.toString().padStart(2,'0')} ${h>=12?'PM':'AM'}`
}

function MeetingCard({ meeting: m, isUpcoming, onCancel }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
      m.status === 'cancelled' ? 'opacity-60' : 'hover:shadow-md'
    } transition-all`}>
      <div className="flex items-start gap-4 p-5">
        <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
             style={{ background: m.event_type?.color || '#0069ff' }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="font-bold text-gray-900">{m.event_type?.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              m.status === 'confirmed'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-500'
            }`}>
              {m.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {fmtDate(m.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {fmtTime(m.start_time)} – {fmtTime(m.end_time)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><User size={13} /> {m.invitee_name}</span>
            <span className="flex items-center gap-1.5"><Mail size={12} /> {m.invitee_email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isUpcoming && m.status === 'confirmed' && (
            <button onClick={() => onCancel(m.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all">
              <X size={13} /> Cancel
            </button>
          )}
          <button onClick={() => setOpen(o => !o)}
                  className="text-gray-400 border border-gray-200 rounded-lg p-1.5 hover:bg-gray-50 transition-colors">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
          {m.notes && (
            <p className="text-sm text-gray-600 mt-3 mb-1">
              <span className="font-semibold">Notes:</span> {m.notes}
            </p>
          )}
          <p className="text-xs text-gray-400 font-mono mt-2">Meeting ID: #{m.id}</p>
        </div>
      )}
    </div>
  )
}

export default function MeetingsPage() {
  const [tab, setTab] = useState('upcoming')
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [u, p] = await Promise.all([getUpcomingMeetings(), getPastMeetings()])
      setUpcoming(u.data); setPast(p.data)
    } catch { toast.error('Failed to load meetings') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCancel = async id => {
    if (!confirm('Cancel this meeting?')) return
    try { await cancelMeeting(id); toast.success('Meeting cancelled'); load() }
    catch { toast.error('Failed to cancel') }
  }

  const list = tab === 'upcoming' ? upcoming : past

  if (loading) return (
    <div className="flex justify-center mt-20">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage your scheduled meetings.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[['upcoming','Upcoming'], ['past','Past']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}>
            {label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              tab === key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {(key === 'upcoming' ? upcoming : past).length}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="text-base font-semibold text-gray-500 mb-1">No {tab} meetings</h3>
          <p className="text-sm">
            {tab === 'upcoming'
              ? 'Share your booking link so people can schedule time with you.'
              : 'Your completed meetings will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(m => (
            <MeetingCard key={m.id} meeting={m}
                         isUpcoming={tab === 'upcoming'}
                         onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  )
}
