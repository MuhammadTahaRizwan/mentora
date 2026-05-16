'use client'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { formatTime, formatDate, timeAgo } from '@/lib/utils'
import { Send, Search, Paperclip, MessageSquare } from 'lucide-react'

export default function ConsultantMessages() {
  const { currentUser, getStudentsByConsultant, getConversation, sendMessage, markMessagesRead, messages, students, users } = useStore()
  const myStudents = currentUser ? getStudentsByConsultant(currentUser.id) : []
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-select first student
  useEffect(() => {
    if (!selectedUserId && myStudents.length > 0) {
      const firstStudent = myStudents[0]
      const studentUser = users.find(u => u.id === firstStudent.userId)
      if (studentUser) setSelectedUserId(studentUser.id)
    }
  }, [myStudents.length])

  // Refresh every 2s
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(i)
  }, [])

  const conversation = currentUser && selectedUserId
    ? getConversation(currentUser.id, selectedUserId)
    : []

  useEffect(() => {
    if (currentUser && selectedUserId) {
      markMessagesRead(selectedUserId, currentUser.id)
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.length, selectedUserId, tick])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !currentUser || !selectedUserId) return
    sendMessage({ senderId: currentUser.id, receiverId: selectedUserId, content: text.trim() })
    setText('')
    setTick(t => t + 1)
  }

  const getUnreadForStudent = (studentUserId: string) => {
    if (!currentUser) return 0
    return messages.filter(m => m.senderId === studentUserId && m.receiverId === currentUser.id && !m.read).length
  }

  const getLastMessage = (studentUserId: string) => {
    if (!currentUser) return null
    const conv = getConversation(currentUser.id, studentUserId)
    return conv[conv.length - 1] || null
  }

  const filteredStudents = myStudents.filter(s => {
    const u = users.find(u => u.id === s.userId)
    return s.name.toLowerCase().includes(search.toLowerCase()) || u?.email.toLowerCase().includes(search.toLowerCase())
  })

  const selectedStudent = myStudents.find(s => users.find(u => u.id === s.userId && u.id === selectedUserId))
  const selectedStudentUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null

  const groupedMessages = conversation.reduce((acc, msg) => {
    const day = msg.timestamp.slice(0, 10)
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {} as Record<string, typeof conversation>)

  return (
    <div className="flex h-full animate-fade-in">
      {/* Student list */}
      <div className="w-72 border-r border-gray-100 bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" className="input pl-9 text-xs py-2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.map(s => {
            const u = users.find(usr => usr.id === s.userId)
            if (!u) return null
            const unread = getUnreadForStudent(u.id)
            const lastMsg = getLastMessage(u.id)
            const isSelected = selectedUserId === u.id
            return (
              <button key={s.id} onClick={() => setSelectedUserId(u.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-gray-50 ${isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 relative">
                  <span className="text-white text-xs font-bold">{s.name.slice(0,2).toUpperCase()}</span>
                  {unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">{unread}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{s.name}</p>
                    {lastMsg && <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{timeAgo(lastMsg.timestamp)}</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {lastMsg ? lastMsg.content : 'No messages yet'}
                  </p>
                </div>
              </button>
            )
          })}
          {filteredStudents.length === 0 && (
            <div className="py-10 text-center text-xs text-gray-400">No students found</div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedStudentUser ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{(selectedStudent?.name || selectedStudentUser.name).slice(0,2).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{selectedStudent?.name || selectedStudentUser.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                  {selectedStudent?.intendedProgram || 'Student'} · Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {Object.entries(groupedMessages).map(([day, msgs]) => (
                <div key={day}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">{formatDate(day)}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="space-y-3">
                    {msgs.map(msg => {
                      const isMe = msg.senderId === currentUser?.id
                      return (
                        <div key={msg.id} className={`flex gap-2.5 message-enter ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-auto">
                              <span className="text-white text-[10px] font-bold">{(selectedStudent?.name || 'S').slice(0,2).toUpperCase()}</span>
                            </div>
                          )}
                          <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-gray-400 px-1">
                              {formatTime(msg.timestamp)}
                              {isMe && <span className="ml-1 text-gray-300">· {msg.read ? 'Read' : 'Sent'}</span>}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              {conversation.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-20">
                  <div className="text-center">
                    <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Start the conversation!</p>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-6 py-3 flex-shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <button type="button" className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex-shrink-0">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input value={text} onChange={e => setText(e.target.value)}
                  placeholder={`Message ${selectedStudent?.name.split(' ')[0] || 'student'}…`}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }} />
                <button type="submit" disabled={!text.trim()}
                  className="p-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-30 transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">Select a student to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
