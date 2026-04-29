import { useState, useEffect } from 'react'
import { X, Loader, Check, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { createPaymentOrder, verifyPayment } from '../services/api'

// Load Razorpay script globally once
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      console.log('✅ [RAZORPAY] Already loaded in window');
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ [RAZORPAY] Script loaded successfully');
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('❌ [RAZORPAY] Script failed to load');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

export default function PaymentCheckoutModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onPaymentSuccess,
  
  // New booking flow parameters
  vehicleId,
  startDate,
  endDate,
  durationType,
  durationValue,
  originalAmount,      // basePrice
  finalAmount,         // discountedPrice
  discountAmount,
  couponCode,
  vehicleName,
  
  // Fallback for old booking flow
  bookingId,
  booking,
  amount,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('confirm') // 'confirm', 'processing', 'success'
  const [transactionId, setTransactionId] = useState('')
  const [createdBookingId, setCreatedBookingId] = useState(null)

  // Determine if this is a new booking (has vehicle params but no bookingId)
  const isNewBooking = vehicleId && !bookingId
  
  // Resolve actual values
  const paymentAmount = finalAmount !== undefined ? finalAmount : amount
  const baseAmount = originalAmount !== undefined ? originalAmount : amount
  const discount = discountAmount || 0
  const coupon = couponCode || null

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const token = localStorage.getItem('authToken') || localStorage.getItem('token')

  // Load Razorpay when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen])

  const handlePayment = async () => {
    if (loading) {
      console.warn('⚠️  Payment already in progress');
      return;
    }

    try {
      console.log('\n' + '='.repeat(60));
      console.log('💳 PAYMENT PROCESS STARTING');
      console.log('='.repeat(60));
      console.log('📌 KEY PRINCIPLE: Booking created ONLY after payment verified!');
      console.log('   - Is new booking flow?', isNewBooking);
      console.log('   - Payment amount:', paymentAmount);
      console.log('   - Discount:', discount);
      console.log('   - Coupon:', coupon);

      setLoading(true)
      setError('')

      // Validate amount
      if (!paymentAmount || paymentAmount <= 0) {
        throw new Error('Invalid payment amount. Please try again.');
      }

      // Ensure Razorpay is loaded
      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady || !window.Razorpay) {
        throw new Error('Payment gateway not available. Please refresh and try again.');
      }

      console.log('\n📦 STEP 1: Create Payment Order');
      let orderData;

      if (isNewBooking) {
        // NEW FLOW: Send booking details, backend creates temp order
        console.log('   Flow: NEW BOOKING - sending booking params to backend');
        try {
          const response = await axios.post(
            `${API_URL}/payments/create-order`,
            {
              // Don't send bookingId for new bookings - we'll create it after payment
              vehicleId,
              startDate,
              endDate,
              durationType,
              durationValue,
              baseAmount,
              discountAmount: discount,
              couponCode: coupon,
              amount: paymentAmount,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          orderData = response.data.data;
        } catch (err) {
          console.error('❌ Order creation failed:', err.response?.data);
          throw new Error(err.response?.data?.message || 'Failed to create payment order');
        }
      } else if (bookingId) {
        // OLD FLOW: Use existing bookingId
        console.log('   Flow: EXISTING BOOKING -', bookingId);
        try {
          orderData = await createPaymentOrder(bookingId, paymentAmount);
        } catch (err) {
          console.error('❌ Order creation failed:', err.response?.data);
          throw new Error(err.response?.data?.message || 'Failed to create payment order');
        }
      } else {
        throw new Error('No booking information provided');
      }

      if (!orderData?.orderId) {
        throw new Error('Invalid payment order received from server');
      }

      console.log('   ✅ Order created:', orderData.orderId);
      console.log('   - Razorpay Key:', orderData.key?.substring(0, 10) + '***');

      // Setup Razorpay options
      console.log('\n⚙️  STEP 2: Open Razorpay Payment Gateway');
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        order_id: orderData.orderId,
        name: 'Trimurti Transport',
        description: `Vehicle Booking - ${vehicleName || 'Premium Vehicle'}`,
        
        handler: async (razorpayResponse) => {
          await handlePaymentSuccess(razorpayResponse, orderData);
        },

        prefill: {
          name: booking?.user?.name || '',
          email: booking?.user?.email || '',
          contact: booking?.user?.phone || '',
        },

        theme: { color: '#9333ea' },

        modal: {
          ondismiss: () => {
            console.log('ℹ️  User closed payment modal without paying');
            setLoading(false);
            setError('Payment cancelled. Your booking was not created. Please try again.');
            setStep('confirm');
          },
        },
      };

      // Open Razorpay
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('❌ Payment error:', err.message);
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (razorpayResponse, orderData) => {
    try {
      console.log('\n✔️ PAYMENT COMPLETED BY USER');
      console.log('   - Payment ID:', razorpayResponse.razorpay_payment_id);
      console.log('   - Order ID:', razorpayResponse.razorpay_order_id);

      setStep('processing');
      console.log('\n🔐 STEP 3: Verify Payment Signature on Backend');

      let verificationData;

      if (isNewBooking) {
        // NEW FLOW: Verify AND create booking
        console.log('   Flow: NEW BOOKING - backend will create booking during verification');
        
        try {
          const response = await axios.post(
            `${API_URL}/payments/verify`,
            {
              // For new bookings, pass all details so backend can create booking
              vehicleId,
              startDate,
              endDate,
              durationType,
              durationValue,
              baseAmount,
              discountAmount: discount,
              couponCode: coupon,
              orderId: orderData.orderId,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
              isNewBooking: true,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          verificationData = response.data.data;
        } catch (err) {
          console.error('❌ Verification failed:', err.response?.data);
          throw new Error(err.response?.data?.message || 'Payment verification failed. Please contact support.');
        }
      } else if (bookingId) {
        // OLD FLOW: Verify existing booking
        console.log('   Flow: EXISTING BOOKING - updating payment status');
        
        try {
          verificationData = await verifyPayment(
            bookingId,
            razorpayResponse.razorpay_order_id,
            razorpayResponse.razorpay_payment_id,
            razorpayResponse.razorpay_signature
          );
        } catch (err) {
          console.error('❌ Verification failed:', err.response?.data);
          throw new Error(err.response?.data?.message || 'Payment verification failed. Please contact support.');
        }
      }

      const finalBookingId = verificationData?.bookingId || verificationData?._id || bookingId;
      console.log('   ✅ Payment verified successfully');
      console.log('   - Final Booking ID:', finalBookingId);
      console.log('   - Payment Status: PAID');

      setCreatedBookingId(finalBookingId);
      setTransactionId(razorpayResponse.razorpay_payment_id);
      setStep('success');

      // Notify parent after delay
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess({
            transactionId: razorpayResponse.razorpay_payment_id,
            bookingId: finalBookingId,
          });
        } else if (onSuccess) {
          onSuccess({
            transactionId: razorpayResponse.razorpay_payment_id,
            bookingId: finalBookingId,
          });
        }
      }, 2000);

    } catch (err) {
      console.error('❌ Payment verification error:', err.message);
      setError(err.message || 'Payment verification failed. Please contact support.');
      setStep('confirm');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-800/50">
          <h3 className="text-lg font-bold text-white">Payment Checkout</h3>
          <button
            onClick={onClose}
            disabled={loading || step !== 'confirm'}
            className="text-gray-400 hover:text-white disabled:opacity-50 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* CONFIRM STEP */}
          {step === 'confirm' && (
            <>
              {/* Booking Summary */}
              <div className="space-y-3">
                
                {/* Vehicle Name */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs font-semibold">VEHICLE</p>
                  <p className="text-white text-lg font-bold">{vehicleName || 'Premium Vehicle'}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs font-semibold">PICKUP</p>
                    <p className="text-white font-semibold text-sm">
                      {startDate ? new Date(startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs font-semibold">DROPOFF</p>
                    <p className="text-white font-semibold text-sm">
                      {endDate ? new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Base Price</span>
                  <span className="text-white font-semibold">₹{baseAmount?.toLocaleString()}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-2">
                    <span className="text-green-400 flex items-center gap-1">
                      <Check size={14} /> {coupon || 'Discount'}
                    </span>
                    <span className="text-green-400 font-semibold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold border-t border-gray-700 pt-3 mt-2">
                  <span className="text-white">Total Payable</span>
                  <span className={`${discount > 0 ? 'text-green-400' : 'text-purple-400'}`}>
                    ₹{paymentAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs">
                  <span className="font-semibold">📌 Important:</span> Your booking will be created only after successful payment verification.
                </p>
              </div>

              {/* Payment Methods */}
              <div className="text-center text-xs text-gray-400 py-2">
                💳 Card • 📱 UPI • 🏦 Net Banking • 💰 Wallets
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition disabled:opacity-50 font-bold flex items-center justify-center gap-2"
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

          {/* PROCESSING STEP */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full">
                <Loader size={32} className="text-purple-400 animate-spin" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">Verifying Payment...</p>
                <p className="text-gray-400 text-sm">Please wait while we confirm your transaction</p>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
                <Check size={32} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">🎉 Payment Successful!</p>
                <p className="text-gray-400 text-sm">Your booking has been confirmed</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 mt-4 space-y-1">
                <p className="text-gray-400 text-xs">Transaction ID</p>
                <p className="text-white font-mono text-xs break-all">{transactionId}</p>
              </div>
              <p className="text-gray-400 text-xs pt-2">Redirecting...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
