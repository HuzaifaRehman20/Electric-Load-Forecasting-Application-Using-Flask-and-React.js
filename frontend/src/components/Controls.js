import React from 'react';

export default function Controls({ k, setK, model, setModel }) {
  return (
    <div className="controls">
      <h4>Model Controls</h4>
      
      <div className="control-group">
        <label>Number of Clusters (k):</label>
        <input 
          type="range" 
          min="2" 
          max="10" 
          value={k} 
          onChange={e => setK(+e.target.value)} 
        />
        <span>{k}</span>
      </div>

      <div className="control-group">
        <label>Forecast Model:</label>
        <select value={model} onChange={e => setModel(e.target.value)}>
          <option value="xgb">XGBoost</option>
          <option value="naive">Naïve Baseline</option>
        </select>
      </div>
    </div>
  );
}