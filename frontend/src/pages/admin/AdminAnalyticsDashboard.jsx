import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminAnalyticsDashboard.css';

const AdminAnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardStats();
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
    } else if (range === 'quarter') {
      const quarter = Math.floor(today.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1);
      startDate.setHours(0, 0, 0, 0);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const fetchDashboardStats = async () => {
    try {
      const { startDate, endDate } = getDateRange(dateRange);
      const response = await axios.get(
        `${API_URL}/coupons/dashboard/stats`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDashboardData(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error(err);
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const { startDate, endDate } = getDateRange(dateRange);
      const response = await axios.get(
        `${API_URL}/coupons/report/export`,
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `discount_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      setError('Failed to export report');
    }
  };

  if (loading) {
    return <div className="admin-analytics loading">Loading...</div>;
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>📊 Discount Analytics & Reporting</h1>
        <div className="header-actions">
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
              Week
            </button>
            <button
              className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
              onClick={() => setDateRange('month')}
            >
              Month
            </button>
            <button
              className={`range-btn ${dateRange === 'quarter' ? 'active' : ''}`}
              onClick={() => setDateRange('quarter')}
            >
              Quarter
            </button>
          </div>
          <button className="export-btn" onClick={handleExportReport}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {dashboardData && (
        <>
          {/* Key Metrics */}
          <div className="metrics-overview">
            <div className="metric-card">
              <div className="metric-icon">💳</div>
              <div className="metric-content">
                <p className="metric-label">Total Coupons</p>
                <p className="metric-value">{dashboardData.totalCoupons}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">✓</div>
              <div className="metric-content">
                <p className="metric-label">Active Offers</p>
                <p className="metric-value">{dashboardData.activeCoupons}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <p className="metric-label">Total Discount Given</p>
                <p className="metric-value">₹{dashboardData.totalDiscountGiven.toFixed(2)}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <p className="metric-label">New Customers via Offers</p>
                <p className="metric-value">{dashboardData.newCustomersViaOffers}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🔄</div>
              <div className="metric-content">
                <p className="metric-label">Repeat Customers via Loyalty</p>
                <p className="metric-value">{dashboardData.repeatCustomersViaLoyalty}</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <p className="metric-label">Revenue Generated</p>
                <p className="metric-value">₹{(dashboardData.totalDiscountGiven * 3).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Revenue Analysis */}
          <div className="analytics-section">
            <h2>💹 Revenue Impact Analysis</h2>
            <div className="revenue-cards">
              <div className="revenue-card">
                <h3>Original Revenue</h3>
                <p className="amount">
                  ₹{((dashboardData.totalDiscountGiven * 3) + dashboardData.totalDiscountGiven).toFixed(2)}
                </p>
                <p className="label">Before discount impact</p>
              </div>

              <div className="revenue-card negative">
                <h3>Discount Given</h3>
                <p className="amount">-₹{dashboardData.totalDiscountGiven.toFixed(2)}</p>
                <p className="label">Customer savings</p>
              </div>

              <div className="revenue-card positive">
                <h3>Net Revenue</h3>
                <p className="amount">
                  ₹{((dashboardData.totalDiscountGiven * 3)).toFixed(2)}
                </p>
                <p className="label">After discount impact</p>
              </div>

              <div className="revenue-card roi">
                <h3>ROI %</h3>
                <p className="amount">
                  {((dashboardData.newCustomersViaOffers / dashboardData.totalDiscountGiven) * 100).toFixed(1)}%
                </p>
                <p className="label">Return on investment</p>
              </div>
            </div>
          </div>

          {/* Top Coupons */}
          {dashboardData.topCoupons && dashboardData.topCoupons.length > 0 && (
            <div className="analytics-section">
              <h2>⭐ Top Performing Offers</h2>
              <div className="top-coupons-list">
                {dashboardData.topCoupons.map((coupon, idx) => (
                  <div key={idx} className="coupon-item">
                    <div className="rank">#{idx + 1}</div>
                    <div className="coupon-details">
                      <h4>{coupon.code}</h4>
                      <p className="stats">
                        {coupon.usageCount} uses • ₹{coupon.discountGiven.toFixed(2)} given
                      </p>
                    </div>
                    <div className="coupon-metrics">
                      <span className="metric">Avg: ₹{(coupon.discountGiven / coupon.usageCount).toFixed(0)}</span>
                      <span className="metric">Type: {coupon.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referral Metrics */}
          {dashboardData.referralMetrics && (
            <div className="analytics-section">
              <h2>🎁 Referral Program Performance</h2>
              <div className="referral-stats">
                <div className="stat-box">
                  <p className="stat-title">Total Referrals</p>
                  <p className="stat-number">{dashboardData.referralMetrics.totalReferrals}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-title">Approved Referrals</p>
                  <p className="stat-number">{dashboardData.referralMetrics.approvedReferrals}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-title">Pending Approval</p>
                  <p className="stat-number">{dashboardData.referralMetrics.pendingReferrals}</p>
                </div>
                <div className="stat-box">
                  <p className="stat-title">Total Credits Given</p>
                  <p className="stat-number">₹{dashboardData.referralMetrics.totalCreditsGiven}</p>
                </div>
              </div>
            </div>
          )}

          {/* Festival Campaigns */}
          {dashboardData.festivalCampaigns && dashboardData.festivalCampaigns.length > 0 && (
            <div className="analytics-section">
              <h2>🎉 Festival Campaign Performance</h2>
              <div className="festival-campaigns">
                {dashboardData.festivalCampaigns.map((campaign, idx) => (
                  <div key={idx} className="festival-card">
                    <h3>{campaign.name}</h3>
                    <div className="campaign-metrics">
                      <div className="metric">
                        <span className="label">Impressions</span>
                        <span className="value">{campaign.impressions}</span>
                      </div>
                      <div className="metric">
                        <span className="label">Clicks</span>
                        <span className="value">{campaign.clicks}</span>
                      </div>
                      <div className="metric">
                        <span className="label">Conversions</span>
                        <span className="value">{campaign.conversions}</span>
                      </div>
                      <div className="metric">
                        <span className="label">CTR</span>
                        <span className="value">
                          {((campaign.clicks / campaign.impressions) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="metric">
                        <span className="label">ROI</span>
                        <span className="value">{campaign.roi.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="analytics-section">
            <h2>📌 Summary</h2>
            <div className="summary-text">
              <p>
                During this period, <strong>{dashboardData.totalCoupons}</strong> coupon offerings with{' '}
                <strong>{dashboardData.activeCoupons}</strong> currently active have generated{' '}
                <strong>₹{dashboardData.totalDiscountGiven.toFixed(2)}</strong> in customer benefits while attracting{' '}
                <strong>{dashboardData.newCustomersViaOffers}</strong> new customers and encouraging{' '}
                <strong>{dashboardData.repeatCustomersViaLoyalty}</strong> repeat bookings through loyalty programs.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsDashboard;
