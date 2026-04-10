import { useState } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import { useShowToast } from './ToastContainer'

/**
 * VehicleBottomSheet Component
 * Slides up from bottom when a vehicle marker is clicked
 * Shows vehicle details and action buttons
 */
export default function VehicleBottomSheet({ vehicle, isOpen, onClose }) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const toast = useShowToast()

  if (!isOpen || !vehicle) return null

  const handleCompleteRide = async () => {
    try {
      // TODO: Implement API call to complete the ride
      // await completeRide(vehicle.bookingId)
      toast.success('Ride marked as completed')
      setShowCompleteDialog(false)
      onClose()
    } catch (error) {
      toast.error('Failed to complete ride')
    }
  }

  const handleReportIssue = async () => {
    if (!reportMessage.trim()) {
      toast.error('Please enter an issue description')
      return
    }

    try {
      // TODO: Implement API call to report issue
      // await reportVehicleIssue(vehicle.bookingId, reportMessage)
      toast.success('Issue reported successfully')
      setReportMessage('')
      setShowReportDialog(false)
      onClose()
    } catch (error) {
      toast.error('Failed to report issue')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 transition-transform transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>

          {/* Vehicle Info */}
          <div className="mb-6">
            {/* Driver Avatar & Name */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {vehicle.driverName?.charAt(0) || 'D'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {vehicle.driverName || 'Driver Name'}
                </h2>
                <p className="text-sm text-gray-600">
                  {vehicle.customerName || 'Customer'}
                </p>
              </div>
            </div>

            {/* Vehicle Details Grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">REGISTRATION</p>
                <p className="text-sm font-bold text-gray-900 font-mono">
                  {vehicle.registrationNumber || vehicle.vehicleNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">VEHICLE TYPE</p>
                <p className="text-sm font-bold text-gray-900">
                  {vehicle.vehicleType || vehicle.vehicleCategory || 'Four Wheeler'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">CURRENT STATUS</p>
                <p className="text-sm font-bold text-green-600">
                  {vehicle.currentLocation?.status || 'Active'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">RIDE TYPE</p>
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {vehicle.rideType || 'Daily'}
                </p>
              </div>
            </div>

            {/* Route Info */}
            {(vehicle.pickupLocation || vehicle.dropoffLocation) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-2">ROUTE</p>
                {vehicle.pickupLocation && (
                  <p className="text-xs text-blue-800 mb-1">
                    📍 From: {vehicle.pickupLocation}
                  </p>
                )}
                {vehicle.dropoffLocation && (
                  <p className="text-xs text-blue-800">
                    📍 To: {vehicle.dropoffLocation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {/* Complete Button */}
            <button
              onClick={() => setShowCompleteDialog(true)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              COMPLETE
            </button>

            {/* Report Issue Button */}
            <button
              onClick={() => setShowReportDialog(true)}
              className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <AlertCircle size={18} />
              REPORT ISSUE
            </button>
          </div>
        </div>
      </div>

      {/* Complete Confirmation Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Ride?</h3>
            <p className="text-gray-600 mb-6">
              Mark this ride as completed for {vehicle.registrationNumber || 'this vehicle'}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRide}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Report Issue</h3>
            <p className="text-gray-600 text-sm mb-4">
              Describe the issue with {vehicle.registrationNumber || 'this vehicle'}:
            </p>
            <textarea
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              placeholder="Describe the issue here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none h-24 text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReportDialog(false)
                  setReportMessage('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReportIssue}
                className="flex-1 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
