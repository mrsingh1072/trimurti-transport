import { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
import { createPaymentOrder, verifyPayment } from '../services/api'

// Load Razorpay script once globally
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      console.log('✅ [RAZORPAY SCRIPT] Already loaded in window');
      resolve(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      console.log('✅ [RAZORPAY SCRIPT] Script tag already exists, waiting for load...');
      
      // If script exists but Razorpay not ready, wait for it
      if (existingScript.readyState === 'loading') {
        existingScript.onload = () => {
          console.log('✅ [RAZORPAY SCRIPT] Script on existing tag loaded');
          resolve(true);
        };
        existingScript.onerror = () => {
          console.error('❌ [RAZORPAY SCRIPT] Script tag load error');
          resolve(false);
        };
        return;
      } else if (window.Razorpay) {
        resolve(true);
        return;
      }
    }

    console.log('📥 [RAZORPAY SCRIPT] Creating new script tag...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ [RAZORPAY SCRIPT] New script loaded successfully');
      console.log('   - window.Razorpay available:', !!window.Razorpay);
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('❌ [RAZORPAY SCRIPT] Failed to load new script');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

export default function PaymentCheckoutModal({ isOpen, onClose, booking, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('confirm') // confirm, processing, success
  const [transactionId, setTransactionId] = useState('')

  // Load Razorpay script only once on component mount
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen])

  const handlePayment = async () => {
    // Prevent multiple submissions
    if (loading) {
      console.warn('⚠️  [PAYMENT] Payment already in progress, ignoring duplicate click');
      return;
    }

    try {
      console.log('\n💳 [PAYMENT] Starting payment process');
      console.log('   - Booking ID:', booking?._id);
      console.log('   - Amount:', booking?.totalPrice);
      console.log('   - Loading state:', loading);

      setLoading(true)
      setError('')

      // Validate booking data
      if (!booking || !booking._id) {
        throw new Error('Invalid booking: missing booking ID')
      }

      if (!booking.totalPrice) {
        throw new Error('Invalid booking: missing total price')
      }

      if (booking.totalPrice <= 0) {
        throw new Error('Invalid booking: amount must be greater than 0')
      }

      console.log('✅ [PAYMENT] Booking validation passed');

      // Ensure Razorpay is loaded
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection and try again.');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay is not available. Please refresh the page and try again.');
      }

      console.log('✅ [PAYMENT] Razorpay loaded successfully');

      // Step 1: Create order on backend
      console.log('📦 [PAYMENT] Creating Razorpay order...');
      let orderData;
      try {
        orderData = await createPaymentOrder(booking._id, booking.totalPrice)
      } catch (orderError) {
        console.error('❌ [PAYMENT] Order creation failed:', orderError);
        throw new Error(orderError.response?.data?.message || 'Failed to create payment order. Please try again.');
      }

      if (!orderData) {
        throw new Error('No order data received from server');
      }

      if (!orderData.orderId) {
        throw new Error('Invalid order data: missing orderId');
      }

      console.log('✅ [PAYMENT] Order created successfully');
      console.log('   - Order ID:', orderData.orderId);
      console.log('   - Amount:', orderData.amount);
      console.log('   - Currency:', orderData.currency);
      console.log('   - Key:', orderData.key?.substring(0, 10) + '...');

      // Step 2: Prepare Razorpay options
      console.log('⚙️  [PAYMENT] Preparing Razorpay checkout options...');
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Trimurti Transport',
        description: `Booking Payment - ${booking.vehicle?.name || 'Vehicle'}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            console.log('\n✔️ [PAYMENT] Razorpay payment completed');
            console.log('   - Payment ID:', response.razorpay_payment_id);
            console.log('   - Signature:', response.razorpay_signature?.substring(0, 10) + '...');

            setStep('processing')
            
            // Step 3: Verify payment on backend
            console.log('🔐 [PAYMENT] Verifying payment signature...');
            try {
              await verifyPayment(
                booking._id,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              )
            } catch (verifyError) {
              console.error('❌ [PAYMENT] Verification failed:', verifyError);
              throw new Error(verifyError.response?.data?.message || 'Payment verification failed. Please contact support.');
            }

            console.log('✅ [PAYMENT] Signature verified successfully');
            setTransactionId(response.razorpay_payment_id)
            setStep('success')

            // Call success callback
            if (onSuccess) {
              setTimeout(() => {
                onSuccess(response.razorpay_payment_id)
              }, 2000)
            }
          } catch (verifyError) {
            console.error('❌ [PAYMENT] Verification error:', verifyError.message);
            setError(verifyError.message || 'Payment verification failed. Please contact support.')
            setStep('confirm')
            setLoading(false)
          }
        },
        prefill: {
          name: booking.user?.name || '',
          email: booking.user?.email || '',
          contact: booking.user?.phone || '',
        },
        theme: {
          color: '#9333ea',
        },
        modal: {
          ondismiss: () => {
            console.log('ℹ️  [PAYMENT] Payment modal closed by user');
            setLoading(false)
            setError('Payment cancelled by user')
          },
        },
      };

      console.log('✅ [PAYMENT] Options prepared, opening Razorpay checkout...');

      // Step 3: Open Razorpay checkout
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('❌ [PAYMENT] Error:', err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed. Please try again.';
      setError(errorMessage)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Payment Checkout</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'confirm' && (
          <>
            {/* Booking Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Vehicle</p>
                <p className="text-white font-semibold">{booking?.vehicle?.name || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Start Date</p>
                  <p className="text-white font-semibold">
                    {booking?.startDate
                      ? new Date(booking.startDate).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">End Date</p>
                  <p className="text-white font-semibold">
                    {booking?.endDate
                      ? new Date(booking.endDate).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Amount to Pay</p>
                <p className="text-3xl font-bold text-purple-400">₹{booking?.totalPrice || 0}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Payment Methods Info */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-xs font-semibold mb-2">ACCEPTED PAYMENT METHODS</p>
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm">💳 Card</span>
                <span className="text-sm">📱 UPI</span>
                <span className="text-sm">🏦 Net Banking</span>
                <span className="text-sm">💰 Wallets</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="py-8 text-center">
            <div className="inline-block p-3 bg-purple-500/20 rounded-full mb-4">
              <Loader size={32} className="text-purple-400 animate-spin" />
            </div>
            <p className="text-white font-semibold">Verifying Payment...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we confirm your payment</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="inline-block p-3 bg-green-500/20 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-white font-semibold text-lg">Payment Successful!</p>
            <p className="text-gray-400 text-sm mt-2">Transaction ID: {transactionId}</p>
            <p className="text-gray-400 text-xs mt-4">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  )
}
