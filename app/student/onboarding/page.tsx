'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { SUPPORTED_COUNTRIES } from '@/lib/utils'
import { SupportedCountry, ConsultantProfile } from '@/lib/types'
import { GraduationCap, ArrowRight, CheckCircle, Loader2, Globe, Shuffle, ChevronLeft, Star, Users, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'country' | 'consultant' | 'assigning' | 'done'

export default function StudentOnboarding() {
  const router = useRouter()
  const { currentUser, getStudentByUserId, assignByCountry, updateStudent, consultantProfiles, students, users } = useStore()
  const student = currentUser ? getStudentByUserId(currentUser.id) : null

  const [step, setStep] = useState<Step>('country')
  const [selectedCountry, setSelectedCountry] = useState<SupportedCountry | null>(null)
  const [selectedConsultantId, setSelectedConsultantId] = useState<string | null>(null) // userId of consultant
  const [assignedName, setAssignedName] = useState('')
  const [assignedCountries, setAssignedCountries] = useState<string[]>([])
  const [goRandom, setGoRandom] = useState(false)

  useEffect(() => {
    if (!currentUser) { router.replace('/login'); return }
    if (currentUser.role !== 'student') { router.replace('/'); return }
    if (student?.onboardingComplete) { router.replace('/student/dashboard') }
  }, [currentUser, student])

  // Consultants eligible for the chosen country
  const eligibleConsultants = selectedCountry
    ? consultantProfiles.filter(cp => cp.status === 'active' && cp.assignedCountries.includes(selectedCountry))
    : []

  const getStudentCount = (consultantUserId: string) =>
    students.filter(s => s.consultantId === consultantUserId).length

  const handleCountryNext = () => {
    if (!selectedCountry) return
    if (eligibleConsultants.length === 0) {
      toast.error('No consultants available for that country. Please contact support.')
      return
    }
    setStep('consultant')
  }

  const doAssign = async (consultantUserId: string | null) => {
    if (!student || !selectedCountry) return
    setGoRandom(consultantUserId === null)
    setStep('assigning')
    await new Promise(r => setTimeout(r, 2000))

    if (consultantUserId) {
      // Manual pick — directly assign
      updateStudent(student.id, {
        consultantId: consultantUserId,
        selectedCountry,
        onboardingComplete: true,
      })
      const u = users.find(u => u.id === consultantUserId)
      const cp = consultantProfiles.find(c => c.userId === consultantUserId)
      setAssignedName(u?.name || 'Your Consultant')
      setAssignedCountries(cp?.assignedCountries || [])
    } else {
      // Random / load-balanced
      const result = assignByCountry(student.id, selectedCountry)
      if (result.consultantId) {
        const u = users.find(u => u.id === result.consultantId)
        const cp = consultantProfiles.find(c => c.userId === result.consultantId)
        setAssignedName(u?.name || 'Your Consultant')
        setAssignedCountries(cp?.assignedCountries || [])
      } else {
        toast.error('Assignment failed. Please contact support.')
        setStep('consultant')
        return
      }
    }
    setStep('done')
  }

  // ── Country selection ─────────────────────────────────────────────────────
  if (step === 'country') {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
              <span className="text-white/50 text-xs">of 2 steps</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Where do you want to study?</h1>
            <p className="text-white/40 text-sm max-w-sm mx-auto">
              Select your target country. You'll then choose your consultant or let us pick the best match.
            </p>
          </div>

          <div className="space-y-2.5 mb-8">
            {SUPPORTED_COUNTRIES.map(c => {
              const consultantCount = consultantProfiles.filter(cp => cp.status === 'active' && cp.assignedCountries.includes(c.key)).length
              const isSelected = selectedCountry === c.key
              return (
                <button key={c.key} onClick={() => setSelectedCountry(c.key)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-150 text-left group ${isSelected ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/25 hover:bg-white/5'}`}>
                  <span className="text-3xl">{c.flag}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-base ${isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{c.label}</p>
                    <p className="text-white/30 text-xs mt-0.5 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {consultantCount} specialist{consultantCount !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-white/20'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>

          <button onClick={handleCountryNext} disabled={!selectedCountry}
            className="w-full py-4 px-6 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base shadow-xl shadow-brand-900/50">
            Choose My Consultant <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Consultant selection ──────────────────────────────────────────────────
  if (step === 'consultant') {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-8">
            <button onClick={() => setStep('country')} className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to country selection
            </button>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
              <span className="text-white/50 text-xs">of 2 steps</span>
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
              {SUPPORTED_COUNTRIES.find(c => c.key === selectedCountry) && (
                <span className="text-3xl">{SUPPORTED_COUNTRIES.find(c => c.key === selectedCountry)!.flag}</span>
              )}
              <h1 className="text-2xl font-black text-white">Pick your consultant</h1>
            </div>
            <p className="text-white/40 text-sm">
              {eligibleConsultants.length} specialist{eligibleConsultants.length !== 1 ? 's' : ''} available for <span className="text-white/70 font-semibold">{selectedCountry}</span>
            </p>
          </div>

          {/* Auto-assign card */}
          <button onClick={() => doAssign(null)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed border-white/20 hover:border-brand-500/60 hover:bg-brand-500/5 transition-all mb-4 text-left group">
            <div className="w-11 h-11 rounded-2xl bg-brand-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600/30 transition-colors">
              <Shuffle className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Best Match — Assign Automatically</p>
              <p className="text-white/30 text-xs mt-0.5">We'll pick the most available specialist using smart load balancing</p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-brand-400 transition-colors" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-medium">or choose manually</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Individual consultant cards */}
          <div className="space-y-3 mb-6">
            {eligibleConsultants.map(cp => {
              const studentLoad = getStudentCount(cp.userId)
              const isSelected = selectedConsultantId === cp.userId
              return (
                <button key={cp.id} onClick={() => setSelectedConsultantId(isSelected ? null : cp.userId)}
                  className={`w-full flex items-start gap-4 px-5 py-4 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/25 hover:bg-white/5'}`}>
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 flex-shrink-0">
                    <span className="text-white font-black text-sm">{cp.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-white text-sm">{cp.name}</p>
                      {cp.performanceScore && cp.performanceScore >= 85 && (
                        <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">Top Rated</span>
                      )}
                    </div>
                    {cp.specialization && (
                      <p className="text-white/40 text-xs mb-2 truncate">{cp.specialization}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-[11px] text-white/30">
                        <MapPin className="w-3 h-3" /> {cp.assignedCountries.join(', ')}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-white/30">
                        <Users className="w-3 h-3" /> {studentLoad} student{studentLoad !== 1 ? 's' : ''}
                      </span>
                      {cp.performanceScore !== undefined && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-400">
                          <Star className="w-3 h-3" /> {cp.performanceScore}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-white/20'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>

          <button onClick={() => doAssign(selectedConsultantId)} disabled={!selectedConsultantId}
            className="w-full py-4 px-6 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base shadow-xl shadow-brand-900/50">
            Confirm Selection <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-center text-white/20 text-xs mt-3">Consultant assigned instantly · No waiting</p>
        </div>
      </div>
    )
  }

  // ── Assigning animation ───────────────────────────────────────────────────
  if (step === 'assigning') {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-brand-600/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-2xl bg-brand-600 flex items-center justify-center shadow-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <p className="text-white font-bold text-lg">
              {goRandom ? 'Finding best match…' : 'Confirming your consultant…'}
            </p>
          </div>
          <p className="text-white/40 text-sm max-w-xs mx-auto mb-6">
            {goRandom
              ? `Matching you with the best available specialist for ${selectedCountry}`
              : 'Setting up your personalised dashboard'}
          </p>
          <div className="flex justify-center gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-slide-up">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">You're All Set! 🎉</h1>
        <p className="text-white/50 mb-6">Your consultant has been assigned and your dashboard is ready.</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left">
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Your Assigned Consultant</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black">{assignedName.slice(0,2).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white font-bold text-base">{assignedName}</p>
              <p className="text-white/40 text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {assignedCountries.join(', ')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-1.5 animate-pulse" />
              <p className="text-emerald-400 text-xs font-semibold">Consultant Online</p>
            </div>
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-center">
              <div className="text-brand-400 text-xs font-semibold mb-0.5">
                {SUPPORTED_COUNTRIES.find(c => c.key === selectedCountry)?.flag} {selectedCountry}
              </div>
              <p className="text-brand-300 text-[10px]">Your Target</p>
            </div>
          </div>
        </div>

        <button onClick={() => router.push('/student/dashboard')}
          className="w-full py-4 px-6 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 text-base shadow-xl shadow-brand-900/50">
          Go to My Dashboard <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-white/20 text-xs mt-3">Dashboard synced in real-time · Chat available immediately</p>
      </div>
    </div>
  )
}
