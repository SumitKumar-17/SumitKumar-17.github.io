---
title: Trading Engine
date: 2026-04-03
repo: opensoft-2026/exchange-engine
topics: ["Go", "Next.js", "WebSocket", "Trading Systems", "Python"]
lead:
  A full trading exchange simulation built for a hackathon - a Go matching
  engine, a real-time Next.js terminal, and autonomous Python trading bots, all
  talking over one WebSocket event bus.
image: terminal.png
subimages: ["dashboard.png"]
image_border: true
---

**Trading Engine** (shipped under the team name **SyntheticBull**) is a
three-service trading exchange simulation my team built for the Opensoft 2026
hackathon: a real limit order book, a synthetic market generator, a live trading
terminal, and a set of autonomous bots all trading against each other in real
time. I worked mainly on the
[exchange-engine](https://github.com/opensoft-2026/exchange-engine) and the
[web terminal](https://github.com/opensoft-2026/terminal).

## exchange-engine (Go)

The core of the system - an in-memory limit order book (LOB) per symbol, matched
by price-time priority, backed by a synthetic market generator that runs an
independent
[Geometric Brownian Motion](https://github.com/opensoft-2026/exchange-engine/blob/main/README.md#gbm-market-generator)
process per symbol to produce realistic bid-ask spreads and candlestick shapes
at 50-100 messages/second across 3 symbols. It exposes both a REST API (17
endpoints) and a WebSocket feed (`orderbook`, `trade`, `ohlcv`, `portfolio`,
`ticker` events), supports `LIMIT`, `MARKET`, and `STOP_LIMIT` orders including
short selling, and persists everything - open orders, trade history, OHLCV
candles, portfolio snapshots - to SQLite in WAL mode, with open human orders
restored into the LOB on restart.

## terminal (Next.js 16 + React 19)

The user-facing trading interface, connected to the engine over REST and a
single reconnecting WebSocket per active symbol. It renders a live candlestick
chart (KlineCharts Pro, with EMA/Bollinger/MACD/volume indicators computed
client-side), an order book with live depth, a trade tape, and a full order
entry panel, plus a separate analytics dashboard (30-day P&L, win rate, a
trading calendar, and a notes/journal panel) built on Recharts and Zustand for
state.

## trading-bots (Python)

Four autonomous strategies - a spread-quoting market maker, an RSI+EMA alpha
bot, a MACD/EMA momentum bot, and a Bollinger-band mean-reversion bot - each
running as its own account and connecting to the engine as a regular WebSocket
client, so the order book has continuous, realistic activity even with no human
trader online.

Full architecture write-up (with the message-flow diagram) is in the team's
[architecture repo](https://github.com/opensoft-2026/architecture/blob/main/overview.md).
