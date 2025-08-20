import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Helper function to format the timestamp
function formatTime(ts) {
  const date = new Date(ts);
  if (isNaN(date)) return ts;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function App() {
  const [data, setData] = useState([]);
  const [latestData, setLatestData] = useState(null);

  // Fetch the latest data point from backend
  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/data`);
      const json = await res.json();
      if (json.length > 0) {
        const newPoint = json[0];
        setLatestData(newPoint);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Start polling every 2 seconds
  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Only add new data if the timestamp is different
  useEffect(() => {
    if (latestData) {
      setData((prevData) => {
        if (prevData.length > 0 && prevData[0].timestamp === latestData.timestamp) {
          return prevData; // Duplicate, no update
        }

        const updatedData = [latestData, ...prevData];
        if (updatedData.length > 100) {
          updatedData.pop(); // Keep max 100 points
        }
        return updatedData;
      });
    }
  }, [latestData]);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2b6cb0' }}> Freeboard Monitoring System Prototype </h1>

      {/* Chart */}
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
            domain={[0, 'auto']}
            label={{ value: 'Distance (m)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 14 }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip labelFormatter={formatTime} />
          <Line
            type="monotone"
            dataKey="avg_distance_m"
            stroke="#2b6cb0"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2b6cb0' }}
            activeDot={{ r: 6, fill: '#2b6cb0' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Data Table */}
      <table
        border="1"
        cellPadding="8"
        style={{ marginTop: 30, width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}
      >
        <thead style={{ backgroundColor: '#2b6cb0', color: 'white' }}>
          <tr>
            <th>Time</th>
            <th>Voltage (V)</th>
            <th>Distance (m)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f7f9fc' : 'white' }}>
              <td>{formatTime(row.timestamp)}</td>
              <td>{row.avg_voltage !== undefined ? row.avg_voltage.toFixed(4) : 'N/A'}</td>
              <td>{row.avg_distance_m !== undefined ? row.avg_distance_m.toFixed(2) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
