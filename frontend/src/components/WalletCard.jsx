import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WalletCard.css';

const WalletCard = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchWalletBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWalletBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(`${API_URL}/coupons/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallet(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="wallet-card loading">Loading...</div>;
  }

  if (!wallet) {
    return <div className="wallet-card empty">No wallet data</div>;
  }

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <h3>💰 My Wallet</h3>
        <span className="balance">₹{wallet.balance.toFixed(2)}</span>
      </div>

      {wallet.balance > 0 && (
        <p className="wallet-status">✅ Ready to use in your next booking</p>
      )}

      {wallet.transactions && wallet.transactions.length > 0 && (
        <div className="transactions-section">
          <button
            className="toggle-transactions"
            onClick={() => setShowTransactions(!showTransactions)}
          >
            {showTransactions ? '▲' : '▼'} Recent Transactions ({wallet.transactions.length})
          </button>

          {showTransactions && (
            <div className="transactions-list">
              {wallet.transactions.map((txn, idx) => (
                <div key={idx} className="transaction-item">
                  <div className="txn-info">
                    <p className="txn-reason">{txn.reason}</p>
                    <p className="txn-date">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`txn-amount ${txn.type}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {wallet.balance === 0 && (
        <p className="empty-wallet">
          📌 Earn wallet credits through referrals and special offers!
        </p>
      )}
    </div>
  );
};

export default WalletCard;
