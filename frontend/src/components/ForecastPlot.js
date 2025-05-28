import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ForecastPlot({ data }) {
  // Format the tooltip display
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '14px 18px',
          border: '1.5px solid #8884d8',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(60,60,60,0.12)',
          fontSize: 15
        }}>
          <p className="label" style={{ fontWeight: 600 }}>{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color, fontWeight: 500 }}>
              {`${entry.name}: ${parseFloat(entry.value).toFixed(2)}`}
            </p>
          ))}
          {payload.length >= 2 && (
            <p style={{ color: '#e7298a', fontWeight: 600, marginTop: 6 }}>
              {`Error: ${Math.abs(payload[0].value - payload[1].value).toFixed(2)}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Colorblind-friendly palette
  const ACTUAL_COLOR = '#1b9e77';
  const FORECAST_COLOR = '#d95f02';

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 10, letterSpacing: 1 }}>Forecast vs Actual</h2>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={420}>
          <LineChart
            data={data}
            margin={{ top: 30, right: 30, left: 30, bottom: 40 }}
            style={{ background: '#f8fafc', borderRadius: 16 }}
          >
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              angle={-30} 
              textAnchor="end"
              height={70}
              tick={{ fontSize: 15, fontWeight: 500 }}
              tickFormatter={(value) => {
                // Format the timestamp for better display
                const date = new Date(value);
                return date instanceof Date && !isNaN(date) 
                  ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : value;
              }}
              label={{ value: 'Timestamp', position: 'insideBottom', offset: -5, fontWeight: 600, fontSize: 16 }}
            />
            <YAxis 
              label={{ value: 'Electric Load', angle: -90, position: 'insideLeft', fontWeight: 600, fontSize: 16 }}
              tick={{ fontSize: 15, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 16, fontWeight: 600, paddingBottom: 10 }} />
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Actual Load"
              stroke={ACTUAL_COLOR}
              activeDot={{ r: 8, style: { filter: 'drop-shadow(0 0 6px #1b9e77aa)' } }}
              strokeWidth={3}
              dot={{ r: 3 }}
              style={{ filter: 'drop-shadow(0 0 6px #1b9e7755)' }}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              name="Forecasted Load"
              stroke={FORECAST_COLOR}
              strokeWidth={3}
              strokeDasharray="7 5"
              dot={{ r: 3 }}
              style={{ filter: 'drop-shadow(0 0 6px #d95f0255)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>No forecast data available. Please adjust your parameters.</p>
      )}
    </div>
  );
}