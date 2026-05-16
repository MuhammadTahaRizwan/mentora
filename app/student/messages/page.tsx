'use client'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'
import { formatTime, formatDate, timeAgo } from '@/lib/utils'
import { Send, MessageSquare, Paperclip } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentMessages() {
  const { currentUser, getStudentByUserId, getConversation, sendMessage, markMessagesRead, users } = useStore()
  const student = currentUser ? getStudentByUserId(currentUser.id) : null
  const consultant = student ? users.find(u => u.id === student.consultantId) : null
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)

  const messages = currentUser && consultant
    ? getConversation(currentUser.id, consultant.id)
    : []

  useEffect(() => {
    if (currentUser && consultant) {
      markMessagesRead(consultant.id, currentUser.id)
    }
  }, [tick, currentUser, consultant])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, tick])

  // Refresh every 2s for real-time feel
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !currentUser || !consultant) return
    setSending(true)
    sendMessage({ senderId: currentUser.id, receiverId: consultant.id, content: text.trim() })
    setText('')
    setSending(false)
    setTick(t => t + 1)
  }

  if (!consultant) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="font-bold text-gray-900 mb-1">No consultant assigned</h2>
          <p className="text-gray-400 text-sm">You'll be able to message your consultant once assigned.</p>
        </div>
      </div>
    )
  }

  const groupedMessages = messages.reduce((acc, msg) => {
    const day = msg.timestamp.slice(0, 10)
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {} as Record<string, typeof messages>)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">{consultant.name.slice(0,2).toUpperCase()}</span>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-sm">{consultant.name}</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-400">Your Consultant · Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-6">
        {Object.entries(groupedMessages).map(([day, msgs]) => (
          <div key={day}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">{formatDate(day)}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="space-y-3">
              {msgs.map(msg => {
                const isMe = msg.senderId === currentUser?.id
                return (
                  <div key={msg.id} className={`flex gap-2.5 message-enter ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-auto">
                        <span className="text-white text-[10px] font-bold">{consultant.name.slice(0,2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">
                        {formatTime(msg.timestamp)}
                        {isMe && msg.read && <span className="ml-1 text-brand-400">· Read</span>}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 lg:px-6 py-3 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button type="button" className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Message ${consultant.name.split(' ')[0]}…`}
            className="flex-1 px-4 py-2.5 text-sm bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
          />
          <button type="submit" disabled={!text.trim() || sending}
            className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
