import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminOfferManagement.css';

const AdminOfferManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [activeTab, setActiveTab] = useState('coupons');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    couponCode: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: 0,
    minBookingAmount: 500,
    maxUsageLimit: '',
    usagePerUserLimit: 1,
    startDate: '',
    endDate: '',
    couponType: 'promotional',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchCoupons();
    } else {
      fetchFestivalOffers();
    }
  }, [activeTab]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch coupons');
      console.error(err);
      setLoading(false);
    }
  };

  const fetchFestivalOffers = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/festival/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFestivals(response.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch festival offers');
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        maxUsageLimit: formData.maxUsageLimit ? parseInt(formData.maxUsageLimit) : null,
      };

      const response = await axios.post(
        `${API_URL}/coupons/create`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('✅ Coupon created successfully!');
      setCoupons([response.data.data, ...coupons]);
      setFormData({
        couponCode: '',
        discountType: 'percentage',
        discountValue: 0,
        maxDiscount: 0,
        minBookingAmount: 500,
        maxUsageLimit: '',
        usagePerUserLimit: 1,
        startDate: '',
        endDate: '',
        couponType: 'promotional',
        description: '',
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const toggleCouponStatus = async (couponId, currentStatus) => {
    try {
      await axios.patch(
        `${API_URL}/coupons/toggle/${couponId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCoupons(coupons.map((c) =>
        c._id === couponId ? { ...c, isActive: !currentStatus } : c
      ));
      setSuccess('✅ Coupon status updated');
    } catch (err) {
      setError('Failed to update coupon');
    }
  };

  const deleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await axios.delete(
          `${API_URL}/coupons/delete/${couponId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCoupons(coupons.filter((c) => c._id !== couponId));
        setSuccess('✅ Coupon deleted');
      } catch (err) {
        setError('Failed to delete coupon');
      }
    }
  };

  if (loading) {
    return <div className="admin-offer-management loading">Loading...</div>;
  }

  return (
    <div className="admin-offer-management">
      <div className="management-header">
        <h1>💳 Offer Management</h1>
        <button
          className="create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '➕ Create New Offer'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {/* Create Form */}
      {showForm && (
        <div className="create-form-container">
          <form onSubmit={handleCreateCoupon} className="create-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) =>
                    setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., WELCOME10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Coupon Type *</label>
                <select
                  value={formData.couponType}
                  onChange={(e) =>
                    setFormData({ ...formData, couponType: e.target.value })
                  }
                >
                  <option value="new_user">New User</option>
                  <option value="loyalty">Loyalty</option>
                  <option value="festival">Festival</option>
                  <option value="referral">Referral</option>
                  <option value="premium">Premium</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Value *</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: parseFloat(e.target.value) })
                  }
                  placeholder="e.g., 10 or 500"
                  required
                />
              </div>

              <div className="form-group">
                <label>Max Discount (₹)</label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) })
                  }
                  placeholder="e.g., 300"
                />
              </div>

              <div className="form-group">
                <label>Min Booking Amount (₹)</label>
                <input
                  type="number"
                  value={formData.minBookingAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minBookingAmount: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label>Max Usage Limit</label>
                <input
                  type="number"
                  value={formData.maxUsageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsageLimit: e.target.value })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="form-group">
                <label>Usage Per User</label>
                <input
                  type="number"
                  value={formData.usagePerUserLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usagePerUserLimit: parseInt(e.target.value) })
                  }
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the offer..."
                  rows="3"
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Create Coupon
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          💳 Coupons ({coupons.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'festivals' ? 'active' : ''}`}
          onClick={() => setActiveTab('festivals')}
        >
          🎉 Festival Offers ({festivals.length})
        </button>
      </div>

      {/* Coupons List */}
      {activeTab === 'coupons' && (
        <div className="coupons-grid">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="coupon-card">
              <div className="card-header">
                <h3>{coupon.couponCode}</h3>
                <span className={`status ${coupon.isActive ? 'active' : 'inactive'}`}>
                  {coupon.isActive ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>

              <div className="card-body">
                <p><strong>Type:</strong> {coupon.couponType}</p>
                <p>
                  <strong>Discount:</strong>
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}%`
                    : `₹${coupon.discountValue}`}
                </p>
                {coupon.maxDiscount > 0 && (
                  <p><strong>Max Cap:</strong> ₹{coupon.maxDiscount}</p>
                )}
                <p><strong>Min Amount:</strong> ₹{coupon.minBookingAmount}</p>
                <p><strong>Used:</strong> {coupon.usedCount} / {coupon.maxUsageLimit || '∞'}</p>
                <p><strong>Valid:</strong> {new Date(coupon.startDate).toLocaleDateString()} to {new Date(coupon.endDate).toLocaleDateString()}</p>
              </div>

              <div className="card-actions">
                <button
                  className={`status-btn ${coupon.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                >
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteCoupon(coupon._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Festivals List */}
      {activeTab === 'festivals' && (
        <div className="festivals-grid">
          {festivals.map((festival) => (
            <div key={festival._id} className="festival-card">
              <div className="card-header">
                <h3>{festival.festivalName}</h3>
                <span className={`status ${festival.isActive ? 'active' : 'inactive'}`}>
                  {festival.isActive ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>

              <div className="card-body">
                <p><strong>Code:</strong> {festival.couponCode}</p>
                <p>
                  <strong>Discount:</strong>
                  {festival.discountType === 'percentage'
                    ? `${festival.discountValue}%`
                    : `₹${festival.discountValue}`}
                </p>
                <p><strong>Max Discount:</strong> ₹{festival.maxDiscount}</p>
                <p><strong>Min Booking:</strong> ₹{festival.minBookingAmount}</p>
                <p><strong>Campaign Reach:</strong> {festival.impressions} impressions</p>
              </div>

              <div className="card-actions">
                <button
                  className={`status-btn ${festival.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => toggleCouponStatus(festival._id, festival.isActive)}
                >
                  {festival.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {coupons.length === 0 && festivals.length === 0 && (
        <div className="empty-state">
          <p>No offers created yet. Create your first offer!</p>
        </div>
      )}
    </div>
  );
};

export default AdminOfferManagement;
