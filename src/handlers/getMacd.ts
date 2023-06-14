import { Request, Response } from "express";
import { MACD } from "technicalindicators";
import { getCleanedCandles, getCloseValues, getFigiFromTicker } from "../utils/helpers.js";
import { CandleInterval } from "tinkoff-invest-api/cjs/generated/marketdata.js";

export const getMACD = async (req: Request, res: Response) => {
    try {
        const figi = await getFigiFromTicker("CCL", "SPBXM");
        const candles = await getCleanedCandles(CandleInterval.CANDLE_INTERVAL_DAY, "-1y", figi);
        const close = await getCloseValues(candles);
        const macdInput = {
            values: close,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        };
        const macd = MACD.calculate(macdInput);

        console.log(macd);

        res.status(200).json(macd);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
};
