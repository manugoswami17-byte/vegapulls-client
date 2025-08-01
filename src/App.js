import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

function formatTime(ts) {
  const date = new Date(ts);
  if (isNaN(date)) return ts;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function App() {
  const [data, setData] = useState([]);
  const [latestData, setLatestData] = useState(null);  // Store the most recent data point

  // Fetch the latest data from the backend
  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/data`);
      const json = await res.json();
      if (json.length > 0) {
        const newPoint = json[0];
        setLatestData(newPoint);  // Set the new data point to state
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Use effect to fetch data once every 2 seconds and update the state
  useEffect(() => {
    fetchData();  // Initial fetch
    const interval = setInterval(fetchData, 2000);  // Fetch every 2 seconds (when data is updated)
    return () => clearInterval(interval);  // Clean up on unmount
  }, []);

  // Use effect to update the graph with the latest data point
  useEffect(() => {
    if (latestData) {
      // If there’s a new data point, update the graph data
      setData((prevData) => {
        const updatedData = [latestData, ...prevData];  // Prepend the new data point to the front
        if (updatedData.length > 20) {
          updatedData.pop();  // Keep the array length to the latest 20 data points
        }
        return updatedData;
      });
    }
  }, [latestData]);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2b6cb0' }}>🌾 VEGAPULS Real-Time Dashboard</h1>

      {/* LineChart component for displaying the distance over time */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 60 }}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
            tick={{ fontSize: 12 }}
            label={{ value: 'Time (HH:MM:SS)', position: 'insideBottomRight', offset: -10, fontSize: 14 }}
          />
          <YAxis
            domain={[0, 'auto']}  // Auto scale Y axis based on data
            label={{ value: 'Distance (m)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 14 }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip labelFormatter={formatTime} />
          <Line
            type="monotone"
            dataKey="avg_distance_m"  // Ensure this matches the field name in the API response
            stroke="#2b6cb0"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2b6cb0' }}
            activeDot={{ r: 6, fill: '#2b6cb0' }}
            isAnimationActive={false}  // Disable animation
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Table displaying the data */}
      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: 30, width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}
      >
        <thead style={{ backgroundColor: '#2b6cb0', color: 'white' }}>
          <tr>
            <th>Time</th>
            <th>Voltage (V)</th>
            <th>Current (mA)</th>
            <th>Distance (m)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f7f9fc' : 'white' }}>
              <td>{formatTime(row.timestamp)}</td>
              <td>{row.avg_voltage !== undefined ? row.avg_voltage.toFixed(4) : 'N/A'}</td>
              <td>{row.avg_current_mA !== undefined ? row.avg_current_mA.toFixed(2) : 'N/A'}</td>
              <td>{row.avg_distance_m !== undefined ? row.avg_distance_m.toFixed(2) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
