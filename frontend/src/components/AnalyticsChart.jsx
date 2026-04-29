import React from 'react';
import './AnalyticsChart.css';

const AnalyticsChart = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return <div className="chart-placeholder">No data available</div>;
  }

  // Simple chart implementation using CSS
  return (
    <div className="analytics-chart">
      <div className="chart-container">
        {/* This is a placeholder for chart integration */}
        {/* In production, integrate with a library like Chart.js or Recharts */}
        <div className="chart-placeholder">
          {type} Chart - {data.length} data points
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
