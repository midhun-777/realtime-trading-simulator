# Real-Time Trading Simulator

Monorepo with a Node.js WebSocket server and React client.

## Getting Started

Prereqs: Node 18+

1. Install dependencies

```
cd server && npm i
cd ../client && npm i
```

2. Run dev

```
cd server && npm run dev
```

In another terminal:

```
cd client && npm run dev
```

Client expects `VITE_WS_URL` (defaults to `http://localhost:4000`).

## Orders and Portfolio

- Each socket connection gets a virtual portfolio with $100,000 starting cash
- Use Buy/Sell buttons to submit orders for symbol `SIM`
- Unrealized PnL and equity update in real-time with ticks

## Market Data Adapters

- Default: Mock random-walk feed in `server/market/mockFeed.js`
- Example placeholder for Finnhub in `server/market/finnhubAdapter.js`

To integrate a real provider, implement a feed that emits `{ symbol, price, ts }` ticks and exposes `getLatestPrice()`. Wire it in `server/index.js`.

## Environment Variables

Server:

```
PORT=4000
FINNHUB_API_KEY=your_key
POLYGON_API_KEY=your_key
```

Client (optional):

```
VITE_WS_URL=http://localhost:4000
```


