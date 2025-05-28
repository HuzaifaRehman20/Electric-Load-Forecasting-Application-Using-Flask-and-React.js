import React from 'react';

export default function HelpSection() {
  return (
    <div className="help-section">
      <h4>Help & Documentation</h4>
      <ul>
        <li>Select a city and date range.</li>
        <li>Use the slider to adjust clusters (k).</li>
        <li>Toggle between models for comparison.</li>
      </ul>
      <p>
        <b>Clustering:</b> PCA + K-Means to group similar demand patterns. <br />
        <b>Forecasting:</b> Models trained to predict next-day demand using weather + time features.
      </p>
      <p><b>Data Source:</b> Energy + Weather from provided datasets.</p>
    </div>
  );
}
