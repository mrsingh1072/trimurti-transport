import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel, isLoading, isDangerous = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full ${isDangerous ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
            <AlertTriangle size={24} className={isDangerous ? 'text-red-400' : 'text-yellow-400'} />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-gray-400 mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                : 'bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30'
            }`}
          >
            {isLoading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
