// Placeholder adapter structure to demonstrate how to plug real feeds.
// Implement real streaming using Finnhub's WebSocket if API key provided.
const { EventEmitter } = require('events');

function createFinnhubFeed(symbol = 'AAPL') {
	const emitter = new EventEmitter();
	const apiKey = process.env.FINNHUB_API_KEY;
	if (!apiKey) {
		process.nextTick(() => emitter.emit('error', new Error('FINNHUB_API_KEY not set')));
		return emitter;
	}
	// TODO: implement real WS connect and forward ticks as { symbol, price, ts }
	// For now, just emit error to indicate not implemented in demo.
	process.nextTick(() => emitter.emit('error', new Error('Finnhub adapter not implemented in demo')));
	return emitter;
}

module.exports = { createFinnhubFeed };


