import { X, Download, Copy, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { useState, useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { generateReceiptPDF, generateCustomReceiptPDF } from '../utils/pdfGenerator'

export default function PaymentDetailsModal({ payment, booking, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [pdfMethod, setPdfMethod] = useState('html2pdf') // 'html2pdf' or 'jspdf' or 'custom'
  const receiptRef = useRef(null)

  if (!isOpen || !payment) return null

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const downloadPDF = async () => {
    if (!receiptRef.current) return

    setIsDownloading(true)
    try {
      if (pdfMethod === 'jspdf') {
        // Use jsPDF + html2canvas method
        const success = await generateReceiptPDF('receipt-content', booking?._id, {
          filename: `receipt_${payment._id.toString().slice(-6)}.pdf`,
        })
        if (success) {
          setIsDownloading(false)
          return
        }
      } else if (pdfMethod === 'custom') {
        // Use custom jsPDF layout with fields
        const success = await generateCustomReceiptPDF(payment, booking)
        if (success) {
          setIsDownloading(false)
          return
        }
      } else {
        // Default html2pdf method
        const element = receiptRef.current.cloneNode(true)

        // Remove interactive elements from the clone
        const buttons = element.querySelectorAll('button')
        buttons.forEach((btn) => btn.remove())

        const opt = {
          margin: 10,
          filename: `Receipt_${payment._id}_${new Date().getTime()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: '#ffffff' },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        }

        await html2pdf().set(opt).from(element).save()
        setIsDownloading(false)
      }
    } catch (error) {
      console.error('PDF download failed:', error)
      alert('Failed to download PDF. Please try again.')
      setIsDownloading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30">
            <CheckCircle size={18} />
            <span className="font-medium">Payment Completed</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/30">
            <AlertCircle size={18} />
            <span className="font-medium">Payment Pending</span>
          </div>
        )
      case 'failed':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30">
            <AlertCircle size={18} />
            <span className="font-medium">Payment Failed</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="text-cyan-400" size={28} />
            <h2 className="text-2xl font-bold text-white">Payment Receipt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            title="Close"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Receipt Content - This will be cloned for PDF */}
        <div id="receipt-content" ref={receiptRef} className="p-8 space-y-6 bg-white text-gray-900">
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6">
            <h1 className="text-3xl font-bold text-gray-900">PAYMENT RECEIPT</h1>
            <p className="text-gray-600 mt-2">Trimurti Transport Services</p>
            
            {/* Company Contact Details */}
            <div className="text-gray-700 text-xs mt-3 space-y-1">
              <p>Email: trimurtitransport1072@gmail.com | Phone: +91 8709905612</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            {getStatusBadge(payment.status)}
          </div>

          {/* Receipt Number and Date */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="border-l-4 border-cyan-500 pl-4">
              <p className="text-gray-600 font-semibold">RECEIPT #</p>
              <p className="text-lg font-mono text-gray-900">{payment._id.toString().slice(-12).toUpperCase()}</p>
            </div>
            <div className="border-l-4 border-cyan-500 pl-4">
              <p className="text-gray-600 font-semibold">DATE</p>
              <p className="text-lg text-gray-900">{formatDate(payment.createdAt).split(',')[0]}</p>
            </div>
          </div>

          {/* Booking Details Section */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
              BOOKING DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-semibold">Vehicle</p>
                <p className="text-gray-900 font-medium text-base">{booking?.vehicle?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Booking ID</p>
                <p className="text-gray-900 font-mono text-xs">{booking?._id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Check-in Date</p>
                <p className="text-gray-900 font-medium">
                  {booking?.startDate ? new Date(booking.startDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Check-out Date</p>
                <p className="text-gray-900 font-medium">
                  {booking?.endDate ? new Date(booking.endDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
              PAYMENT DETAILS
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                <p className="text-gray-600 font-semibold">Payment Method</p>
                <p className="text-gray-900 font-medium capitalize">{payment?.method || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                <p className="text-gray-600 font-semibold">Payment Status</p>
                <p className="text-gray-900 font-bold capitalize">{payment?.status || 'N/A'}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600 font-semibold">Payment Date</p>
                <p className="text-gray-900 font-medium">{formatDate(payment?.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-6 rounded-lg border-2 border-cyan-300">
            <p className="text-gray-700 font-semibold text-sm">TOTAL AMOUNT PAID</p>
            <p className="text-4xl font-bold text-cyan-700 mt-2">₹{payment?.amount?.toLocaleString() || 0}</p>
          </div>

          {/* Transaction IDs */}
          {payment?.status?.toLowerCase() === 'completed' && (
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
                TRANSACTION REFERENCE
              </h3>
              <div className="space-y-4 text-sm font-mono">
                {payment?.razorpayOrderId && (
                  <div>
                    <p className="text-gray-600 font-semibold mb-1">Order ID</p>
                    <p className="text-gray-900 bg-white p-2 rounded border border-gray-300 break-all">
                      {payment.razorpayOrderId}
                    </p>
                  </div>
                )}
                {payment?.razorpayPaymentId && (
                  <div>
                    <p className="text-gray-600 font-semibold mb-1">Payment ID</p>
                    <p className="text-gray-900 bg-white p-2 rounded border border-gray-300 break-all">
                      {payment.razorpayPaymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="border-t-2 border-gray-300 pt-6">
            <div className="flex justify-end items-end space-x-20">
              {/* Signature Area - Right Side */}
              <div className="text-center">
                <p className="text-gray-600 text-xs font-semibold mb-2">Authorized Signature</p>
                <img
                  src="/signature.jpeg"
                  alt="Authorized Signature"
                  style={{
                    width: '120px',
                    height: '50px',
                    objectFit: 'contain',
                    marginBottom: '4px'
                  }}
                  onError={(e) => {
                    console.warn('Signature image failed to load')
                    e.target.style.display = 'none'
                  }}
                />
                <p className="text-gray-500 text-xs mt-1">Trimurti Transport Services</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-gray-300 pt-6">
            <p className="text-gray-600 text-sm">
              Thank you for choosing Trimurti Transport Services!
            </p>
            <p className="text-gray-500 text-xs mt-2">
              This is a digital receipt. Please keep it for your records.
            </p>
          </div>
        </div>

        {/* Action Buttons - Not included in PDF */}
        <div className="bg-gray-900 border-t border-white/10 p-6 space-y-3">
          {/* PDF Method Selection */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-gray-400 font-semibold mb-2">PDF DOWNLOAD METHOD</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPdfMethod('html2pdf')}
                className={`px-3 py-2 rounded text-xs font-medium transition ${
                  pdfMethod === 'html2pdf'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                title="Original html2pdf method"
              >
                Quick
              </button>
              <button
                onClick={() => setPdfMethod('jspdf')}
                className={`px-3 py-2 rounded text-xs font-medium transition ${
                  pdfMethod === 'jspdf'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                title="jsPDF + html2canvas method"
              >
                Canvas
              </button>
              <button
                onClick={() => setPdfMethod('custom')}
                className={`px-3 py-2 rounded text-xs font-medium transition ${
                  pdfMethod === 'custom'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                title="Custom jsPDF layout"
              >
                Custom
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition font-medium"
            >
              Close
            </button>
            <button
              onClick={downloadPDF}
              disabled={isDownloading}
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={18} />
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

          {/* Copy IDs Section */}
          {payment?.status?.toLowerCase() === 'completed' && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-2">
              <p className="text-xs text-gray-400 font-semibold">COPY TRANSACTION IDs</p>
              <div className="flex gap-2">
                {payment?.razorpayOrderId && (
                  <button
                    onClick={() => copyToClipboard(payment?.razorpayOrderId, 'orderid')}
                    className="flex-1 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 transition text-sm flex items-center justify-center gap-2"
                    title="Copy Order ID"
                  >
                    <Copy
                      size={16}
                      className={`transition ${
                        copied === 'orderid' ? 'text-green-400' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-gray-300">{copied === 'orderid' ? 'Copied!' : 'Order ID'}</span>
                  </button>
                )}
                {payment?.razorpayPaymentId && (
                  <button
                    onClick={() => copyToClipboard(payment?.razorpayPaymentId, 'paymentid')}
                    className="flex-1 px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 transition text-sm flex items-center justify-center gap-2"
                    title="Copy Payment ID"
                  >
                    <Copy
                      size={16}
                      className={`transition ${
                        copied === 'paymentid' ? 'text-green-400' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-gray-300">{copied === 'paymentid' ? 'Copied!' : 'Payment ID'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
