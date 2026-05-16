'use client'
import { LogOut, X } from 'lucide-react'

interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Sign out?</h2>
              <p className="text-gray-400 text-xs mt-0.5">You will need to sign in again to continue.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* Actions */}
        <div className="flex gap-3 p-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Stay signed in
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
