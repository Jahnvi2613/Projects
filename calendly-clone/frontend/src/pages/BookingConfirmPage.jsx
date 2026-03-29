import { useLocation, useParams, Link } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, User, Mail, Home } from 'lucide-react'

const fmtDate = dateStr => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
}

const fmtTime = t => {
  const [h, m] = t.split(':').map(Number)
  return `${h%12||12}:${m.toString().padStart(2,'0')} ${h>=12?'PM':'AM'}`
}

export default function BookingConfirmPage() {
  const { state }  = useLocation()
  const { slug }   = useParams()

  if (!state?.meeting) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full">
        <p className="text-gray-500 mb-4">No booking data found.</p>
        <Link to={`/book/${slug}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          Book Again
        </Link>
      </div>
    </div>
  )

  const { meeting: m, event } = state

  const details = [
    { icon: Calendar, label: 'Date',  value: fmtDate(m.date) },
    { icon: Clock,    label: 'Time',  value: `${fmtTime(m.start_time)} – ${fmtTime(m.end_time)}` },
    { icon: User,     label: 'Name',  value: m.invitee_name },
    { icon: Mail,     label: 'Email', value: m.invitee_email },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
           style={{ animation: 'slideUp 0.3s ease' }}>

        {/* Icon */}
        <div className="flex justify-center mb-5"
             style={{ animation: 'pop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <CheckCircle size={56} className="text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're scheduled!</h1>
        <p className="text-sm text-gray-500 mb-8">
          A calendar invitation has been sent to your email address.
        </p>

        {/* Event name */}
        <div className="text-left mb-5"
             style={{ borderLeft: `4px solid ${event?.color || '#0069ff'}` }}
             className="text-left mb-5 pl-4">
          <p className="font-bold text-gray-900">{event?.name || m.event_type?.name}</p>
        </div>

        {/* Details */}
        <div className="text-left space-y-4 mb-8">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 text-sm">
              <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to={`/book/${slug}`}
                className="px-4 py-2.5 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Book Another Time
          </Link>
          <Link to="/"
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
            <Home size={15} /> Go Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        @keyframes pop {
          from { transform: scale(0.5); opacity: 0 }
          to   { transform: scale(1);   opacity: 1 }
        }
      `}</style>
    </div>
  )
}
