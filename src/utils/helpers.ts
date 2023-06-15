import { TinkoffInvestApi } from "tinkoff-invest-api";
import yahooFinance from "yahoo-finance2";
import { CandleInterval, HistoricCandle } from "tinkoff-invest-api/cjs/generated/marketdata.js";
import { MACD } from "technicalindicators";
import axios from "axios";
import ms from "ms";

import { TinkofAPIKey } from "../envConstants.js";
// types
import { type ClassCode } from "../../types/classcode";

if (!TinkofAPIKey) throw new Error("Tinkoff API key needed.");
export const api = new TinkoffInvestApi({ token: TinkofAPIKey });

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

export type IntervalMapTinkoffType = typeof IntervalMapTinkoff;
export type IntervalTinkoff = keyof IntervalMapTinkoffType;

export const getFigiFromTicker = async (ticker: string, classCode: ClassCode) => {
    const { instrument } = await api.instruments.getInstrumentBy({
        idType: 2,
        classCode,
        id: ticker,
    });

    if (!instrument) throw new Error("Ther is no instrument");

    return instrument.figi;
};

export const getCleanedCandlesTinkoff = async (
    interval: CandleInterval,
    from: IntervalTinkoff,
    figi: string
) => {
    const { candles } = await api.marketdata.getCandles({
        figi: figi,
        interval: interval,
        ...api.helpers.fromTo(IntervalMapTinkoff[from].from), // <- удобный хелпер для получения { from, to }
    });

    // Cleaning weekends from candles
    const cleanedCandles = candles.filter((candle) => {
        if (!candle.time) throw new Error("Ther is no time in this candle.");
        const day = new Date(candle.time).getDay();

        if (day === 0 || day === 6) return false;

        return true;
    });

    return cleanedCandles;
};

export const getCleanedCandlesTinkoffRest = async (
    interval: IntervalTinkoff,
    figi: string,
    base = new Date()
) => {
    console.log(api.helpers.fromTo(IntervalMapTinkoff[interval].from, base));

    const body = {
        figi,
        instrumentId: figi,
        interval: IntervalMapTinkoff[interval].interval,
        ...api.helpers.fromTo(IntervalMapTinkoff[interval].from, base),
    };

    const { data } = await axios.post(
        "https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1.MarketDataService/GetCandles",
        JSON.stringify(body),
        {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${TinkofAPIKey}`,
                "Content-Type": "application/json",
            },
        }
    );

    // Cleaning weekends from candles
    const cleanedCandles: HistoricCandle[] = data.candles.filter((candle: HistoricCandle) => {
        if (!candle.time) throw new Error("Ther is no time in this candle.");
        const day = new Date(candle.time).getDay();

        if (day === 0 || day === 6) return false;

        return true;
    });

    return cleanedCandles;
};

export const glueCandleBatches = async (interval: IntervalTinkoff, figi: string) => {
    try {
        const promise1 = getCleanedCandlesTinkoffRest("1m", figi, new Date(Date.now() - ms("1d")));

        const promise2 = getCleanedCandlesTinkoffRest("1m", figi);

        const [candlesBatch, candlesBatch2] = await Promise.all([promise1, promise2]);

        const gluedCandles = candlesBatch.concat(candlesBatch2);

        return gluedCandles;
    } catch (error) {
        console.log(error);
    }
};

export const getCloseValues = (candles: HistoricCandle[]) => {
    const close = candles.map((candle) => {
        if (candle.close?.nano === undefined) return candle.close?.units;
        const result = Number(candle.close?.units) + candle.close?.nano / 1e9;
        return result;
    }) as number[];

    return close;
};

export const getAllValues = (candles: HistoricCandle[]) => {
    const values = [];

    for (const candle of candles) {
        if (candle.open?.nano && candle.close?.nano && candle.high?.nano && candle.low?.nano) {
            const result = {
                open: Number(candle.open?.units) + candle.open?.nano / 1e9,
                close: Number(candle.close?.units) + candle.close?.nano / 1e9,
                high: Number(candle.high?.units) + candle.high?.nano / 1e9,
                low: Number(candle.low?.units) + candle.low?.nano / 1e9,
                date: new Date(candle.time!).toLocaleString(),
            };
            values.push(result);
        }
    }

    return values;
};

// Yahoo
export const IntervalMapYahoo = {
    "1m": { interval: "1m", from: "1d" },
    "2m": { interval: "2m", from: "1d" },
    "5m": { interval: "5m", from: "1d" },
    "15m": { interval: "15m", from: "1d" },
    "30m": { interval: "30m", from: "2 days" },
    "1h": { interval: "1h", from: "7 days" },
    "1d": { interval: "1d", from: "1y" },
    "5d": { interval: "5d", from: "30 days" },
    "1wk": { interval: "1wk", from: "1y" },
    "1mo": { interval: "1mo", from: "2y" },
    "3mo": { interval: "3mo", from: "10y" },
} as const;

export type IntervalMapYahooType = typeof IntervalMapYahoo;
export type IntervalYahoo = keyof IntervalMapYahooType;

export const getCandlesYahoo = async (interval: IntervalYahoo, ticker: string) => {
    console.log(new Date(Date.now() - ms(IntervalMapYahoo[interval].from)));
    let result;
    try {
        result = await yahooFinance._chart(ticker, {
            // period1: "2023-06-12",
            period1: new Date(Date.now() - ms(IntervalMapYahoo[interval].from)),
            return: "object" /* ... */,
            interval: IntervalMapYahoo[interval].interval,
        });

        return result.indicators.quote[0];
        // console.log(indicators.adjclose[0].adjclose);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        // @ts-expect-error
        result = error.result;
    }

    const validRanges = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"];

    if (result.indicators) {
        return result.indicators.quote[0];
    } else {
        throw new Error("Something wrong in Yahoo.");
    }
};

export const getMACD = async (close: number[]) => {
    const macdInput = {
        values: close,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    };

    const macd = MACD.calculate(macdInput);

    return macd;
};

// type Something<Name extends string> = Name extends `Hello your ${infer A}` ? A : never

// type S = Something<"Hello your John">
