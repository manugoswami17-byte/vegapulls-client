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
  const [latestData, setLatestData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/data`);
      const json = await res.json();
      if (json.length > 0) setLatestData(json[0]);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (latestData) {
      setData(prev => {
        if (prev.length > 0 && prev[0].timestamp === latestData.timestamp) return prev;
        const updated = [latestData, ...prev];
        if (updated.length > 100) updated.pop();
        return updated;
      });
    }
  }, [latestData]);

  return (
    <div>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'white',
          padding: '12px 20px',
          borderBottom: '1px solid #eee',
        }}
      >
        <img
          src="/images/Malin-Group-Full-Logo.png"
          alt="Malin Group Logo"
          style={{ height: 48, display: 'block' }}
        />
      </header>

      <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#2b6cb0' }}>Freeboard Monitoring System</h1>

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
    </div>  
  );
}

export default App;
