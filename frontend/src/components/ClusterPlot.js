import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function ClusterPlot({ data }) {
  // Colorblind-friendly palette
  const COLORS = [
    '#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e',
    '#e6ab02', '#a6761d', '#666666', '#1f78b4', '#b2df8a'
  ];

  // Group data by cluster
  const groupByCluster = () => {
    if (!data || data.length === 0) return [];
    const clusters = {};
    data.forEach(point => {
      const clusterNum = point.cluster;
      if (!clusters[clusterNum]) {
        clusters[clusterNum] = [];
      }
      clusters[clusterNum].push(point);
    });
    return Object.keys(clusters).map(cluster => ({
      cluster: parseInt(cluster),
      data: clusters[cluster]
    }));
  };

  const clusters = groupByCluster();

  // Custom tooltip to show more information
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          border: '1.5px solid #8884d8',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(60,60,60,0.12)',
          fontSize: 15
        }}>
          <p><strong>Cluster:</strong> {data.cluster}</p>
          <p><strong>PCA1:</strong> {data.x.toFixed(2)}</p>
          <p><strong>PCA2:</strong> {data.y.toFixed(2)}</p>
          <p><strong>Demand:</strong> {data.demand?.toFixed(2) || 'N/A'}</p>
          <p><strong>Temperature:</strong> {data.temperature?.toFixed(2) || 'N/A'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 10, letterSpacing: 1 }}>Cluster Visualization</h2>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }} style={{ background: '#f8fafc', borderRadius: 16 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis 
              dataKey="x" 
              name="PCA Dimension 1" 
              type="number"
              label={{ value: 'PCA Dimension 1', position: 'insideBottom', offset: -5, fontWeight: 600, fontSize: 16 }}
              tick={{ fontSize: 15, fontWeight: 500 }}
            />
            <YAxis 
              dataKey="y" 
              name="PCA Dimension 2" 
              type="number"
              label={{ value: 'PCA Dimension 2', position: 'insideLeft', angle: -90, offset: -5, fontWeight: 600, fontSize: 16 }}
              tick={{ fontSize: 15, fontWeight: 500 }}
            />
            <ZAxis dataKey="demand" range={[100, 400]} name="Demand" />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 16, fontWeight: 600, paddingBottom: 10 }} />
            {clusters.map((cluster, i) => (
              <Scatter 
                key={`cluster-${cluster.cluster}`}
                name={`Cluster ${cluster.cluster}`} 
                data={cluster.data} 
                fill={COLORS[cluster.cluster % COLORS.length]} 
                shape="circle"
                stroke="#222"
                strokeWidth={1.5}
                legendType="circle"
                // Increase point size for visibility
                {...{ marker: { radius: 10 } }}
              >
                {cluster.data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[cluster.cluster % COLORS.length]} stroke="#222" strokeWidth={1.5} />
                ))}
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <p>No cluster data available. Please adjust your parameters.</p>
      )}
    </div>
  );
}