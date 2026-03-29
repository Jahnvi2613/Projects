import { useState, useEffect } from 'react'
import { Plus, Link, Pencil, Trash2, Clock, ExternalLink, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getEventTypes, deleteEventType, createEventType, updateEventType
} from '../api'

const COLORS  = ['#0069ff','#00a2ff','#ff5722','#9c27b0','#00a651','#e53935','#ff9800','#607d8b']
const DURATIONS = [15, 30, 45, 60, 90, 120]

// ── Modal ─────────────────────────────────────────────────────
function EventTypeModal({ event, onClose }) {
  const isEdit = !!event
  const [form, setForm] = useState({
    name: '', slug: '', duration: 30, description: '', color: '#0069ff'
  })
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      setForm({ name: event.name, slug: event.slug, duration: event.duration,
                description: event.description || '', color: event.color })
      setSlugManual(true)
    }
  }, [event])

  const toSlug = s => s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleName = e => {
    set('name', e.target.value)
    if (!slugManual) set('slug', toSlug(e.target.value))
  }

  const handleSlug = e => { setSlugManual(true); set('slug', toSlug(e.target.value)) }

  const submit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.slug.trim()) return toast.error('Slug is required')
    setLoading(true)
    try {
      isEdit ? await updateEventType(event.id, form) : await createEventType(form)
      toast.success(isEdit ? 'Updated!' : 'Created!')
      onClose(true)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
         onClick={() => onClose(false)}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? 'Edit Event Type' : 'New Event Type'}
          </h2>
          <button onClick={() => onClose(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Event Name *
            </label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                   value={form.name} onChange={handleName} placeholder="e.g. 30 Minute Meeting" required />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              URL Slug *
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 whitespace-nowrap">
                /book/
              </span>
              <input className="flex-1 px-3 py-2.5 text-sm outline-none"
                     value={form.slug} onChange={handleSlug} placeholder="30min" required />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button key={d} type="button"
                        onClick={() => set('duration', d)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          form.duration === d
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-200 text-gray-600 hover:border-blue-400'
                        }`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                        style={{ background: c }}
                        className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                          form.color === c ? 'ring-2 ring-offset-2 ring-gray-800' : ''
                        }`} />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Description (optional)
            </label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      rows={3} value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Brief description..." />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => onClose(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    try { const { data } = await getEventTypes(); setEvents(data) }
    catch { toast.error('Failed to load events') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await deleteEventType(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`)
    toast.success('Link copied!')
  }

  const closeModal = (refresh) => {
    setModal(false); setEditing(null)
    if (refresh) load()
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
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-sm text-gray-500 mt-1">Create shareable booking links for people to schedule time with you.</p>
        </div>
        <button onClick={() => { setEditing(null); setModal(true) }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={16} /> New Event Type
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Clock size={48} className="mx-auto mb-4 opacity-40" />
          <h3 className="text-base font-semibold text-gray-600 mb-1">No event types yet</h3>
          <p className="text-sm mb-5">Create your first event type to start accepting bookings.</p>
          <button onClick={() => setModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Create Event Type
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map(ev => (
            <div key={ev.id}
                 className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* color bar */}
              <div className="h-1" style={{ background: ev.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{ev.name}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    ev.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {ev.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1">
                  <Clock size={13} /> {ev.duration} minutes
                </p>
                {ev.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{ev.description}</p>
                )}
                <p className="text-xs text-gray-400 font-mono">/book/{ev.slug}</p>
              </div>

              <div className="flex items-center gap-1 px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button onClick={() => copyLink(ev.slug)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                  <Copy size={13} /> Copy Link
                </button>
                <a href={`/book/${ev.slug}`} target="_blank" rel="noreferrer"
                   className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                  <ExternalLink size={13} />
                </a>
                <button onClick={() => { setEditing(ev); setModal(true) }}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDelete(ev.id, ev.name)}
                        className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-500 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <EventTypeModal event={editing} onClose={closeModal} />}
    </div>
  )
}
