import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import ClusterPlot from './components/ClusterPlot';
import ForecastPlot from './components/ForecastPlot';
import Controls from './components/Controls';
import HelpSection from './components/HelpSection';
import './App.css'; // Assuming you'll create this file for styling
import './style.css'; // Import global styles for consistency

function App() {
  const [city, setCity] = useState('phoenix');
  const [cities] = useState([
    'phoenix', 'nyc', 'seattle', 'houston', 'dallas', 
    'san antonio', 'san jose', 'la', 'philadelphia', 'san diego'
  ]);
  const [startDate, setStartDate] = useState('2018-07-01');
  const [endDate, setEndDate] = useState('2018-07-07');
  const [k, setK] = useState(4);
  const [model, setModel] = useState('xgb');
  const [clusterData, setClusterData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`http://localhost:5000/api/data`, {
          params: { city, start: startDate, end: endDate, k, model }
        });
        
        console.log("API Response:", res.data);  // Debug log
        
        if (res.data.error) {
          setError(res.data.error);
        } else {
          setClusterData(res.data.clusters || []);
          setForecastData(res.data.forecast || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please check if the backend server is running.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [city, startDate, endDate, k, model]);

  // Toggle dark mode
  const handleToggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className={`app-bg${darkMode ? ' dark-mode' : ''}`}>
      <button className="dark-toggle-btn" onClick={handleToggleDarkMode}>
        {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>
      <div className="app">
        <header className="app-header">
          <h1>Electric Load Forecasting Dashboard</h1>
        </header>
        <div className="app-content">
          <div className="control-panel">
            <InputForm 
              cities={cities}
              city={city} 
              setCity={setCity} 
              startDate={startDate} 
              setStartDate={setStartDate} 
              endDate={endDate} 
              setEndDate={setEndDate} 
            />
            <Controls 
              k={k} 
              setK={setK} 
              model={model} 
              setModel={setModel} 
            />
            <HelpSection />
          </div>
          <div className="visualization-panel">
            {loading && <div className="loading">Loading data...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && (
              <>
                <div className="plot-container">
                  <ClusterPlot data={clusterData} />
                </div>
                <div className="plot-container">
                  <ForecastPlot data={forecastData} />
                </div>
              </>
            )}
          </div>
        </div>
        <footer className="app-footer">
          <span>© {new Date().getFullYear()} Electric Load Forecasting | <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a></span>
        </footer>
      </div>
    </div>
  );
}

export default App;