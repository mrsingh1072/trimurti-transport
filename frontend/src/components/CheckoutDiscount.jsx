import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CheckoutDiscount.css';

const CheckoutDiscount = ({ bookingId, bookingAmount, onDiscountApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [bestCoupon, setBestCoupon] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCouponList, setShowCouponList] = useState(false);

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch active coupons on mount
  useEffect(() => {
    fetchActiveCoupons();
    fetchBestCoupon();
  }, [bookingAmount]);

  const fetchActiveCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/active`, {
        params: { bookingAmount },
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveCoupons(response.data.data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  const fetchBestCoupon = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/best`, {
        params: { bookingAmount },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.data) {
        setBestCoupon(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching best coupon:', err);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/apply-discount`,
        { bookingId, couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        discount: response.data.data.discount,
        finalAmount: response.data.data.finalAmount,
        savings: response.data.data.savings,
      });

      setSuccess(`✅ ${response.data.data.savings}`);
      setCouponCode('');

      // Notify parent component
      if (onDiscountApplied) {
        onDiscountApplied({
          couponCode: couponCode.toUpperCase(),
          discount: response.data.data.discount,
          finalAmount: response.data.data.finalAmount,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${API_URL}/bookings/${bookingId}/remove-discount`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppliedCoupon(null);
      setSuccess('✅ Discount removed');

      if (onDiscountApplied) {
        onDiscountApplied({
          couponCode: null,
          discount: 0,
          finalAmount: bookingAmount,
        });
      }
    } catch (err) {
      setError('Failed to remove coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoApply = async () => {
    if (!bestCoupon) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/auto-best-coupon`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.data.applied) {
        setAppliedCoupon({
          code: response.data.data.couponCode,
          discount: response.data.data.discount,
          finalAmount: response.data.data.finalAmount,
          savings: response.data.data.savings,
        });

        setSuccess(`✅ Best coupon applied: Save ${response.data.data.savings}`);

        if (onDiscountApplied) {
          onDiscountApplied({
            couponCode: response.data.data.couponCode,
            discount: response.data.data.discount,
            finalAmount: response.data.data.finalAmount,
          });
        }
      }
    } catch (err) {
      setError('Failed to apply best coupon');
    } finally {
      setLoading(false);
    }
  };

  const applyCouponFromList = async (couponCode) => {
    setCouponCode(couponCode);
    setShowCouponList(false);
    // Manually trigger apply after setting code
    setTimeout(() => {
      setLoading(true);
      setError('');
      setSuccess('');
    }, 0);
  };

  return (
    <div className="checkout-discount">
      <div className="discount-container">
        {/* Applied Coupon Display */}
        {appliedCoupon && (
          <div className="applied-coupon-card success-card">
            <div className="coupon-header">
              <span className="coupon-badge">{appliedCoupon.code}</span>
              <button
                className="remove-btn"
                onClick={handleRemoveCoupon}
                disabled={loading}
              >
                ✕ Remove
              </button>
            </div>
            <div className="coupon-details">
              <p className="savings">🎉 {appliedCoupon.savings}</p>
              <p className="final-price">
                Final Amount: <strong>₹{appliedCoupon.finalAmount.toFixed(2)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Coupon Input Section */}
        {!appliedCoupon && (
          <div className="coupon-input-section">
            <div className="input-group">
              <input
                type="text"
                className="coupon-input"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={loading}
              />
              <button
                className="apply-btn"
                onClick={handleApplyCoupon}
                disabled={loading || !couponCode.trim()}
              >
                {loading ? 'Applying...' : 'Apply'}
              </button>
            </div>

            {/* Messages */}
            {error && <div className="error-message">❌ {error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>
        )}

        {/* Best Coupon Suggestion */}
        {!appliedCoupon && bestCoupon && (
          <div className="best-coupon-card">
            <div className="best-header">
              <span className="best-badge">⭐ Best Offer</span>
            </div>
            <p className="best-message">{bestCoupon.reason}</p>
            <button
                className="apply-best-btn"
                onClick={handleAutoApply}
                disabled={loading}
              >
              {loading ? 'Applying...' : 'Apply Best Offer'}
            </button>
          </div>
        )}

        {/* Available Coupons List */}
        {!appliedCoupon && activeCoupons.length > 0 && (
          <div className="available-coupons">
            <button
              className="toggle-list-btn"
              onClick={() => setShowCouponList(!showCouponList)}
            >
              {showCouponList ? '▲' : '▼'} View {activeCoupons.length} Available Offers
            </button>

            {showCouponList && (
              <div className="coupons-list">
                {activeCoupons.map((coupon, idx) => (
                  <div key={idx} className="coupon-item">
                    <div className="coupon-info">
                      <strong>{coupon.couponCode}</strong>
                      <span className="discount-badge">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </span>
                    </div>
                    <p className="coupon-desc">{coupon.description}</p>
                    <p className="min-amount">Min: ₹{coupon.minBookingAmount}</p>
                    <button
                      className="select-coupon-btn"
                      onClick={() => applyCouponFromList(coupon.couponCode)}
                      disabled={loading}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Coupons Message */}
        {!appliedCoupon && activeCoupons.length === 0 && !bestCoupon && (
          <div className="no-coupons-message">
            <p>No applicable coupons available for this booking amount.</p>
            <p className="hint">💡 Add ₹300 more to unlock premium offers!</p>
          </div>
        )}
      </div>

      {/* Price Breakdown Summary */}
      <div className="price-breakdown">
        <div className="breakdown-row">
          <span>Original Price:</span>
          <span>₹{bookingAmount.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <>
            <div className="breakdown-row discount-row">
              <span>Discount ({appliedCoupon.code}):</span>
              <span>-₹{appliedCoupon.discount.toFixed(2)}</span>
            </div>
            <div className="breakdown-row total-row">
              <strong>Final Amount:</strong>
              <strong>₹{appliedCoupon.finalAmount.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutDiscount;
