'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Team } from '@/lib/types'
import { Plus, Trash2, X, Users, Send, ChevronRight, MessageSquare, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Create Team Modal ──────────────────────────────────────────────────────────
function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const { createTeam } = useStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Team name is required'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    createTeam(name.trim(), description.trim() || undefined)
    toast.success(`Team "${name}" created!`)
    onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-bold text-white">Create Team</h2>
            <p className="text-xs text-white/40 mt-0.5">Group consultants for easier management</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Team Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. UK & Europe Specialists"
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this team's focus…"
              rows={3}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-gray-900 text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50">
              {loading ? 'Creating…' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Broadcast Modal ────────────────────────────────────────────────────────────
function BroadcastModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const { sendTeamBroadcast } = useStore()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) { toast.error('Message cannot be empty'); return }
    if (team.consultantIds.length === 0) { toast.error('No consultants in this team'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    sendTeamBroadcast(team.id, message.trim())
    toast.success(`Message sent to all ${team.consultantIds.length} consultant(s) in ${team.name}`)
    onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-bold text-white">Send Team Broadcast</h2>
            <p className="text-xs text-white/40 mt-0.5">Message goes to all {team.consultantIds.length} consultant(s) in <span className="text-amber-400">{team.name}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message to all consultants in this team…"
              rows={5}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-gray-900 text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-50">
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Sending…' : 'Send to All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add Consultant Modal ───────────────────────────────────────────────────────
function AddConsultantModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const { consultantProfiles, addConsultantToTeam } = useStore()
  const available = consultantProfiles.filter(cp => !team.consultantIds.includes(cp.userId))

  const add = (userId: string, name: string) => {
    addConsultantToTeam(team.id, userId)
    toast.success(`${name} added to ${team.name}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="font-bold text-white text-sm">Add Consultant to Team</h2>
            <p className="text-xs text-white/40 mt-0.5">{team.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">
          {available.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-8">All consultants are already in this team.</p>
          ) : (
            <div className="space-y-2">
              {available.map(cp => (
                <button
                  key={cp.id}
                  onClick={() => add(cp.userId, cp.name)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{cp.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{cp.name}</p>
                    <p className="text-white/30 text-xs truncate">{cp.email}</p>
                  </div>
                  <span className="text-amber-400/0 group-hover:text-amber-400 text-xs font-semibold transition-colors">+ Add</span>
                </button>
              ))}
            </div>
          )}
          <button onClick={onClose} className="w-full mt-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:bg-white/5 transition-colors">Done</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminTeams() {
  const { teams, consultantProfiles, deleteTeam, removeConsultantFromTeam } = useStore()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null)
  const [showCreate, setShowCreate] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [showAddConsultant, setShowAddConsultant] = useState(false)

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? null

  const handleDeleteTeam = (team: Team) => {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return
    deleteTeam(team.id)
    if (selectedTeamId === team.id) setSelectedTeamId(teams.find(t => t.id !== team.id)?.id ?? null)
    toast.success('Team deleted')
  }

  const handleRemoveConsultant = (teamId: string, consultantUserId: string, name: string) => {
    removeConsultantFromTeam(teamId, consultantUserId)
    toast.success(`${name} removed from team`)
  }

  const getConsultantProfile = (userId: string) => consultantProfiles.find(cp => cp.userId === userId)

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Team Management</span>
          </div>
          <h1 className="text-2xl font-black text-white">Teams</h1>
          <p className="text-white/40 text-sm mt-1">{teams.length} team{teams.length !== 1 ? 's' : ''} · {consultantProfiles.length} total consultants</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-gray-900 text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-white font-bold mb-2">No teams yet</h3>
          <p className="text-white/30 text-sm max-w-xs mb-6">Create a team to group consultants, monitor their work, and send broadcast messages.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-gray-900 text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Team
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Teams list ── */}
          <div className="space-y-2">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-1 mb-3">All Teams</p>
            {teams.map(team => {
              const isSelected = team.id === selectedTeamId
              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all ${isSelected ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.03] border-white/[0.08] hover:border-white/15 hover:bg-white/5'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-sm ${isSelected ? 'text-amber-300' : 'text-white'}`}>{team.name}</span>
                    {isSelected && <ChevronRight className="w-4 h-4 text-amber-400" />}
                  </div>
                  {team.description && <p className="text-white/30 text-xs mb-2 truncate">{team.description}</p>}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-white/30" />
                    <span className="text-white/30 text-xs">{team.consultantIds.length} consultant{team.consultantIds.length !== 1 ? 's' : ''}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* ── Team detail ── */}
          {selectedTeam ? (
            <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
              {/* Team header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">{selectedTeam.name}</h2>
                  {selectedTeam.description && <p className="text-white/40 text-sm mt-0.5">{selectedTeam.description}</p>}
                  <p className="text-white/25 text-xs mt-1">{selectedTeam.consultantIds.length} consultant{selectedTeam.consultantIds.length !== 1 ? 's' : ''} · Created {new Date(selectedTeam.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowBroadcast(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Broadcast
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(selectedTeam)}
                    className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete team"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Consultants section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Consultants in Team</h3>
                  <button
                    onClick={() => setShowAddConsultant(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-white/50 text-xs font-medium hover:bg-white/5 hover:text-white/70 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Consultant
                  </button>
                </div>

                {selectedTeam.consultantIds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-white/5 border-dashed rounded-2xl">
                    <Users className="w-10 h-10 text-white/10 mb-3" />
                    <p className="text-white/20 text-sm mb-3">No consultants in this team yet</p>
                    <button
                      onClick={() => setShowAddConsultant(true)}
                      className="text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors"
                    >
                      + Add first consultant
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedTeam.consultantIds.map(userId => {
                      const cp = getConsultantProfile(userId)
                      if (!cp) return null
                      return (
                        <div key={userId} className="flex items-center gap-3 bg-white/5 border border-white/[0.08] rounded-2xl p-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-black text-xs">{cp.name.slice(0,2).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{cp.name}</p>
                            <p className="text-white/30 text-xs truncate">{cp.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`w-1.5 h-1.5 rounded-full inline-block ${cp.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              <span className="text-white/25 text-[10px]">{cp.status}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveConsultant(selectedTeam.id, userId, cp.name)}
                            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                            title="Remove from team"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Modals */}
      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}
      {showBroadcast && selectedTeam && (
        <BroadcastModal team={selectedTeam} onClose={() => setShowBroadcast(false)} />
      )}
      {showAddConsultant && selectedTeam && (
        <AddConsultantModal team={selectedTeam} onClose={() => setShowAddConsultant(false)} />
      )}
    </div>
  )
}
