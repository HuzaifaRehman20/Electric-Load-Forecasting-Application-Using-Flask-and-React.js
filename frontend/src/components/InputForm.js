import React from 'react';

export default function InputForm({ cities, city, setCity, startDate, setStartDate, endDate, setEndDate }) {
  return (
    <div className="input-form">
      <h3>Select Parameters</h3>
      <label>City:</label>
      <select value={city} onChange={e => setCity(e.target.value)}>
        {cities.map(c => <option key={c}>{c}</option>)}
      </select>

      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />

      <label>End Date:</label>
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
    </div>
  );
}
