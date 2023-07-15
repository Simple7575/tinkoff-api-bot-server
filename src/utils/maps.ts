export const IntervalMapTinkoff = {
    "1m": { interval: "CANDLE_INTERVAL_1_MIN", from: "-1d" },
    "2m": { interval: "CANDLE_INTERVAL_2_MIN", from: "-1d" },
    "3m": { interval: "CANDLE_INTERVAL_3_MIN", from: "-1d" },
    "5m": { interval: "CANDLE_INTERVAL_5_MIN", from: "-1d" },
    "10m": { interval: "CANDLE_INTERVAL_10_MIN", from: "-1d" },
    "15m": { interval: "CANDLE_INTERVAL_15_MIN", from: "-1d" },
    "30m": { interval: "CANDLE_INTERVAL_30_MIN", from: "-2 days" },
    "1h": { interval: "CANDLE_INTERVAL_HOUR", from: "-7 days" },
    "2h": { interval: "CANDLE_INTERVAL_2_HOUR", from: "-30 days" },
    "4h": { interval: "CANDLE_INTERVAL_4_HOUR", from: "-30 days" },
    "1d": { interval: "CANDLE_INTERVAL_DAY", from: "-1y" },
    "7 days": { interval: "CANDLE_INTERVAL_WEEK", from: "-2y" },
    "30 days": { interval: "CANDLE_INTERVAL_MONTH", from: "-10y" },
};

const toMilliseconds = (h: number, m: number, s = 0) => (h * 60 * 60 + m * 60 + s) * 1000;

export const IntervalToMsMap = {
    "1m": 60000,
    "2m": 120000,
    "3m": 180000,
    "5m": 300000,
    "10m": 600000,
    "15m": 900000,
    "30m": 1.8e6,
    "1h": 3.6e6,
    "2h": 7.2e6,
    "4h": 1.44e7,
    "1d": 8.64e7,
    "7 days": 6.048e8,
    "30 days": 2.592e9,
};
