import React from 'react';
import './MetricsCard.css';

const MetricsCard = ({ title, value, icon, color = 'blue', trend = null }) => {
  return (
    <div className={`metrics-card ${color}`}>
      <div className="card-header">
        <span className="icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        <p className="value">{value}</p>
        {trend && (
          <p className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '📈' : '📉'} {Math.abs(trend)}%
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;
