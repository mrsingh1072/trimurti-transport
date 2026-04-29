import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReferralCard.css';

const ReferralCard = () => {
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/referral/code`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReferral(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching referral code:', err);
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (referral?.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = () => {
    const message = `Join me on Trimurti Transport! Use my referral code ${referral?.referralCode} and get ₹150 off on your first booking! 🚗`;
    const url = `https://your-app.com?ref=${referral?.referralCode}`;

    if (navigator.share) {
      navigator.share({
        title: 'Trimurti Transport Referral',
        text: message,
        url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(message);
      alert('Message copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="referral-card loading">Loading...</div>;
  }

  if (!referral) {
    return <div className="referral-card empty">No referral data</div>;
  }

  return (
    <div className="referral-card">
      <div className="referral-header">
        <h3>🎁 Earn with Referrals</h3>
        <p className="tagline">Invite friends & earn rewards</p>
      </div>

      <div className="referral-benefits">
        <div className="benefit">
          <span className="emoji">👥</span>
          <div>
            <p className="benefit-label">Your Reward</p>
            <p className="benefit-amount">₹{referral.reward}</p>
          </div>
        </div>
        <div className="benefit">
          <span className="emoji">🎉</span>
          <div>
            <p className="benefit-label">Friend Gets</p>
            <p className="benefit-amount">₹150 OFF</p>
          </div>
        </div>
      </div>

      <div className="referral-code-section">
        <p className="label">Your Referral Code</p>
        <div className="code-display">
          <input
            type="text"
            value={referral.referralCode}
            readOnly
            className="code-input"
          />
          <button
            className="copy-btn"
            onClick={handleCopyCode}
            title="Copy code"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      <button className="share-btn" onClick={handleShareLink}>
        📤 Share with Friends
      </button>

      <div className="referral-steps">
        <h4>How it works:</h4>
        <ol>
          <li>Share your referral code with friends</li>
          <li>They sign up and complete their first booking</li>
          <li>You both get rewards instantly! 💰</li>
        </ol>
      </div>
    </div>
  );
};

export default ReferralCard;
