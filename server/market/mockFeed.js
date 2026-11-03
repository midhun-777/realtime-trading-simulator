const { EventEmitter } = require('events');

function createMarketFeed() {
	const emitter = new EventEmitter();
	let price = 100 + Math.random() * 10;

	function nextTick() {
		// random walk
		const change = (Math.random() - 0.5) * 0.5;
		price = Math.max(1, price + change);
		const now = Date.now();
		emitter.emit('tick', { symbol: 'SIM', price: Number(price.toFixed(2)), ts: now });
	}

	const interval = setInterval(nextTick, 500);

	// expose a getter for latest price
	emitter.getLatestPrice = () => Number(price.toFixed(2));
	// expose stop if needed
	emitter.stop = () => clearInterval(interval);
	return emitter;
}

module.exports = { createMarketFeed };

const { EventEmitter } = require('events');

function createMarketFeed() {
	const emitter = new EventEmitter();
	let price = 100 + Math.random() * 10;

	function nextTick() {
		// random walk
		const change = (Math.random() - 0.5) * 0.5;
		price = Math.max(1, price + change);
		const now = Date.now();
		emitter.emit('tick', { symbol: 'SIM', price: Number(price.toFixed(2)), ts: now });
	}

	const interval = setInterval(nextTick, 500);
	// expose stop if needed
	emitter.stop = () => clearInterval(interval);
	return emitter;
}

module.exports = { createMarketFeed };


