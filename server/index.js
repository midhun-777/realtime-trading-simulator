const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Simple in-memory pub-sub from market adapter to sockets
const { createMarketFeed } = require('./market/mockFeed');

// In-memory per-user portfolios
const portfolios = new Map(); // socket.id -> { cash, positions: { [symbol]: { qty, avgPrice } } }
const STARTING_CASH = 100000;

const market = createMarketFeed();

io.on('connection', (socket) => {
	// On connect, start sending latest prices
	const onTick = (tick) => {
		socket.emit('tick', tick);
	};
	market.on('tick', onTick);

	// Init portfolio for this session
	portfolios.set(socket.id, { cash: STARTING_CASH, positions: {} });

	socket.on('order', (order) => {
		// order: { side: 'buy'|'sell', symbol: string, qty: number, price?: number }
		const state = portfolios.get(socket.id);
		if (!state) return;
		const { side, symbol, qty } = order || {};
		if (!symbol || !qty || qty <= 0) return;

		// use latest simulated price for symbol
		// For simplicity, we only have one symbol 'SIM' in mock feed
		if (symbol !== 'SIM') return;
		const currentPrice = market.getLatestPrice ? market.getLatestPrice('SIM') : null;
		if (currentPrice == null) return;

		if (side === 'buy') {
			const cost = currentPrice * qty;
			if (state.cash < cost) return;
			state.cash -= cost;
			const pos = state.positions[symbol] || { qty: 0, avgPrice: 0 };
			const newQty = pos.qty + qty;
			const newAvg = newQty === 0 ? 0 : (pos.qty * pos.avgPrice + cost) / newQty;
			state.positions[symbol] = { qty: newQty, avgPrice: newAvg };
		} else if (side === 'sell') {
			const pos = state.positions[symbol] || { qty: 0, avgPrice: 0 };
			if (pos.qty < qty) return;
			const proceeds = currentPrice * qty;
			state.cash += proceeds;
			const newQty = pos.qty - qty;
			state.positions[symbol] = { qty: newQty, avgPrice: newQty === 0 ? 0 : pos.avgPrice };
		}

		const portfolio = computePortfolio(state, currentPrice);
		socket.emit('portfolio', portfolio);
	});

	socket.on('disconnect', () => {
		market.off('tick', onTick);
		portfolios.delete(socket.id);
	});
});

server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});

function computePortfolio(state, lastPrice) {
	const positions = state.positions;
	const position = positions['SIM'] || { qty: 0, avgPrice: 0 };
	const marketValue = position.qty * (lastPrice || 0);
	const equity = state.cash + marketValue;
	const unrealizedPnl = position.qty * ((lastPrice || 0) - position.avgPrice);
	return {
		cash: Number(state.cash.toFixed(2)),
		positions: { SIM: position },
		marketValue: Number(marketValue.toFixed(2)),
		equity: Number(equity.toFixed(2)),
		unrealizedPnl: Number(unrealizedPnl.toFixed(2))
	};
}

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Simple in-memory pub-sub from market adapter to sockets
const { createMarketFeed } = require('./market/mockFeed');

const market = createMarketFeed();

io.on('connection', (socket) => {
	// On connect, start sending latest prices
	const onTick = (tick) => {
		socket.emit('tick', tick);
	};
	market.on('tick', onTick);

	socket.on('disconnect', () => {
		market.off('tick', onTick);
	});
});

server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});


