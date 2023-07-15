import mongoose, { Schema } from "mongoose";
import { HistoricCandle } from "tinkoff-invest-api/cjs/generated/marketdata";
import { IntervalTinkoff } from "../../utils/helpers";

interface Candle {
    open: {
        units: string;
        nano: number;
    };
    high: {
        units: string;
        nano: number;
    };
    low: {
        units: string;
        nano: number;
    };
    close: {
        units: string;
        nano: number;
    };
    volume: string;
    time: Date;
    isComplete: boolean;
}

export interface CandlesInterface {
    ticker: string;
    candles: {
        [key in IntervalTinkoff]: HistoricCandle[];
    };
}

const candleSchema = new Schema(
    {
        "1m": [],
        "2m": [],
        "3m": [],
        "5m": [],
        "10m": [],
        "15m": [],
        "30m": [],
        "1h": [],
        "2h": [],
        "4h": [],
        "1d": [],
        "7 days": [],
        "30 days": [],
    },
    { _id: false }
);

const candlesSchema = new Schema<CandlesInterface>(
    {
        ticker: { type: String, required: true },
        candles: { type: candleSchema },
    },
    {
        bufferCommands: false,
        autoCreate: false, // disable `autoCreate` since `bufferCommands` is false
    }
);

const CandlesModel = mongoose.model("Candles", candlesSchema);

export { CandlesModel };
