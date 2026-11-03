import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { createChart } from 'lightweight-charts';
import './style.css';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

function App() {
  const [price, setPrice] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [qty, setQty] = useState(1);
  const socket = useMemo(() => io(WS_URL, { transports: ['websocket'] }), []);

  const chartContainerRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      height: 300,
      rightPriceScale: { visible: true },
      timeScale: { timeVisible: true, secondsVisible: true },
    });
    const lineSeries = chart.addLineSeries();
    seriesRef.current = lineSeries;
    return () => chart.remove();
  }, []);

  useEffect(() => {
    socket.on('tick', (tick) => {
      setPrice(tick.price);
      if (seriesRef.current) {
        seriesRef.current.update({ time: Math.floor(tick.ts / 1000), value: tick.price });
      }
    });
    socket.on('portfolio', setPortfolio);
    return () => {
      socket.off('tick');
      socket.off('portfolio');
      socket.disconnect();
    };
  }, [socket]);

  const sendOrder = (side) => {
    socket.emit('order', { side, symbol: 'SIM', qty: Number(qty) });
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Real-Time Trading Simulator</h2>
      <div ref={chartContainerRef} style={{ border: '1px solid #eee', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div><strong>Symbol:</strong> SIM</div>
        <div><strong>Price:</strong> {price ?? '-'} </div>
        <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: 80 }} />
        <button onClick={() => sendOrder('buy')}>Buy</button>
        <button onClick={() => sendOrder('sell')}>Sell</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <Stat label="Cash" value={portfolio?.cash} />
        <Stat label="Market Value" value={portfolio?.marketValue} />
        <Stat label="Equity" value={portfolio?.equity} />
        <Stat label="Unrealized PnL" value={portfolio?.unrealizedPnl} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value ?? '-'}</div>
    </div>
  );
}

export default App;


