/// <reference path="../../types/index.d.ts"/>
// import tulind from "tulind";
import { TinkoffInvestApi } from "tinkoff-invest-api";
import { MACD } from "technicalindicators";
import { CandleInterval } from "tinkoff-invest-api/cjs/generated/marketdata.js";
import { type ClassCode } from "../../types/classcode";

import { TinkofAPIKey } from "../envConstants.js";
if (!TinkofAPIKey) throw new Error("Tinkoff API key needed.");
export const api = new TinkoffInvestApi({ token: TinkofAPIKey });

export const getFigiFromTicker = async (ticker: string, classCode: ClassCode) => {
    const { instrument } = await api.instruments.getInstrumentBy({
        idType: 2,
        classCode,
        id: ticker,
    });

    if (!instrument) throw new Error("Ther is no instrument");

    return instrument.figi;
};

export const getCandles = async (ticker: string, classCode: ClassCode) => {
    const figi = await getFigiFromTicker(ticker, classCode);

    // получить 1-минутные свечи за последние 5 мин для акций Тинкофф Групп
    const { candles } = await api.marketdata.getCandles({
        figi: figi,
        interval: CandleInterval.CANDLE_INTERVAL_DAY,
        ...api.helpers.fromTo("-1y"), // <- удобный хелпер для получения { from, to }
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

export const getCloseValues = async (ticker: string, classCode: ClassCode) => {
    const candles = await getCandles(ticker, classCode);

    const close = candles.map((candle) => {
        if (candle.close?.units === undefined || candle.close?.nano === undefined) return;
        const result = candle.close?.units + candle.close?.nano / 1e9;
        return result;
    }) as number[];

    // console.log(candles.length);

    return close;
};

export const getMACD = async (ticker: string, classCode: ClassCode) => {
    const close = await getCloseValues(ticker, classCode);

    const macdInput = {
        values: close,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    };

    const macd = MACD.calculate(macdInput);

    // console.log(macd);
    // console.log(close);

    return macd;
};

// const macdData: { macd: number[]; macd_signal: number[]; macd_histogram: number[] } = {
//     macd: [],
//     macd_signal: [],
//     macd_histogram: [],
// };
// tulind.indicators.macd.indicator([close], [12, 26, 9], (err: any, res: any) => {
//     macdData.macd.push(...res[0]);
//     macdData.macd_signal.push(...res[1]);
//     macdData.macd_histogram.push(...res[2]);
// });

// console.log(close);
// console.log(calculateMACD(close));
// console.log(tulind.indicators.macd);

// type Something<Name extends string> = Name extends `Hello your ${infer A}` ? A : never

// type S = Something<"Hello your John">
