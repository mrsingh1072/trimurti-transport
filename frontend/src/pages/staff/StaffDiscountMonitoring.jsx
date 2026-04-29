import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StaffDiscountMonitoring.css';
import MetricsCard from './MetricsCard';
import AnalyticsChart from './AnalyticsChart';

const StaffDiscountMonitoring = () => {
  const [metrics, setMetrics] = useState(null);
  const [discountedBookings, setDiscountedBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [dateRange, setDateRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const { startDate, endDate } = getDateRange(dateRange);
    fetchMetrics(startDate, endDate);
    fetchDiscountedBookings(startDate, endDate);
  }, [dateRange]);

  const getDateRange = (range) => {
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(today.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const fetchMetrics = async (startDate, endDate) => {
    try {
      const response = await axios.get(`${API_URL}/coupons/analytics`, {
        params: { startDate, endDate, type: dateRange },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetrics(response.data.data);
    } catch (err) {
      setError('Failed to fetch metrics');
      console.error('Error:', err);
    }
  };

  const fetchDiscountedBookings = async (startDate, endDate) => {
    try {
      const response = await axios.get(`${API_URL}/coupons/discount-bookings`, {
        params: { startDate, endDate, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscountedBookings(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="staff-monitoring loading">Loading...</div>;
  }

  return (
    <div className="staff-monitoring">
      <div className="monitoring-header">
        <h1>📊 Discount Monitoring & Analytics</h1>
        <div className="date-range-selector">
          <button
            className={`range-btn ${dateRange === 'today' ? 'active' : ''}`}
            onClick={() => setDateRange('today')}
          >
            Today
          </button>
          <button
            className={`range-btn ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => setDateRange('week')}
          >
            This Week
          </button>
          <button
            className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => setDateRange('month')}
          >
            This Month
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Metrics Cards */}
      {metrics && (
        <div className="metrics-grid">
          <MetricsCard
            title="Coupons Used"
            value={metrics.couponsUsed}
            icon="🎟️"
            color="blue"
          />
          <MetricsCard
            title="Discounted Bookings"
            value={metrics.discountedBookings}
            icon="🚗"
            color="green"
          />
          <MetricsCard
            title="Total Discount Given"
            value={`₹${metrics.totalDiscountGiven.toFixed(2)}`}
            icon="💰"
            color="orange"
          />
          <MetricsCard
            title="Revenue After Discount"
            value={`₹${metrics.revenueAfterDiscount.toFixed(2)}`}
            icon="📈"
            color="purple"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📋 Discounted Bookings
        </button>
        <button
          className={`tab-btn ${activeTab === 'topoffers' ? 'active' : ''}`}
          onClick={() => setActiveTab('topoffers')}
        >
          ⭐ Top Offers
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Analytics Tab */}
        {activeTab === 'analytics' && metrics && (
          <div className="analytics-section">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>💳 Coupon Usage Trend</h3>
                <p className="stat-value">{metrics.couponsUsed}</p>
                <p className="stat-label">coupons applied</p>
              </div>

              <div className="analytics-card">
                <h3>💵 Average Discount</h3>
                <p className="stat-value">
                  ₹{(metrics.totalDiscountGiven / (metrics.discountedBookings || 1)).toFixed(2)}
                </p>
                <p className="stat-label">per booking</p>
              </div>

              <div className="analytics-card">
                <h3>📊 Discount Rate</h3>
                <p className="stat-value">
                  {((metrics.totalDiscountGiven / (metrics.revenueAfterDiscount + metrics.totalDiscountGiven)) * 100).toFixed(1)}%
                </p>
                <p className="stat-label">of revenue</p>
              </div>
            </div>

            {/* Top Offers */}
            {metrics.topOffers && metrics.topOffers.length > 0 && (
              <div className="top-offers-section">
                <h3>🏆 Top Performing Offers</h3>
                <div className="offers-list">
                  {metrics.topOffers.map((offer, idx) => (
                    <div key={idx} className="offer-row">
                      <div className="rank">#{idx + 1}</div>
                      <div className="offer-name">{offer.code}</div>
                      <div className="offer-stats">
                        <span className="count">{offer.count} uses</span>
                        <span className="discount">₹{offer.discount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Discounted Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            {discountedBookings.length > 0 ? (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Coupon</th>
                      <th>Original Amount</th>
                      <th>Discount</th>
                      <th>Final Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discountedBookings.map((booking, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="customer-info">
                            <p className="name">{booking.user?.name || 'N/A'}</p>
                            <p className="email">{booking.user?.email}</p>
                          </div>
                        </td>
                        <td>
                          <span className="coupon-badge">{booking.couponCode}</span>
                        </td>
                        <td>₹{booking.originalAmount.toFixed(2)}</td>
                        <td className="discount-amount">
                          -₹{booking.discountApplied.toFixed(2)}
                        </td>
                        <td className="final-amount">
                          ₹{booking.finalAmount.toFixed(2)}
                        </td>
                        <td className="date">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">No discounted bookings found</div>
            )}
          </div>
        )}

        {/* Top Offers Tab */}
        {activeTab === 'topoffers' && metrics && metrics.topOffers && (
          <div className="offers-section">
            {metrics.topOffers.length > 0 ? (
              <div className="offers-grid">
                {metrics.topOffers.map((offer, idx) => (
                  <div key={idx} className="offer-card">
                    <div className="rank-badge">#{idx + 1}</div>
                    <h3>{offer.code}</h3>
                    <div className="offer-stat">
                      <span className="label">Usage Count</span>
                      <span className="value">{offer.count}</span>
                    </div>
                    <div className="offer-stat">
                      <span className="label">Total Discount</span>
                      <span className="value">₹{offer.discount.toFixed(2)}</span>
                    </div>
                    <div className="offer-stat">
                      <span className="label">Avg per Use</span>
                      <span className="value">
                        ₹{(offer.discount / offer.count).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No offer data available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDiscountMonitoring;
