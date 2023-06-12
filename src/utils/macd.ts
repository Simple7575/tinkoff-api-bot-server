import { CandleInterval } from "tinkoff-invest-api/cjs/generated/marketdata.js";
import { api as tinkoffApi } from "./getDataFromTinkoff.js";
import { MACD } from "technicalindicators";
import ms from "ms";

const timeFrameMap = {
    Minute: {
        interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
        from: new Date(new Date().getTime() - ms("1h")),
    },
    FiveMinutes: {
        interval: CandleInterval.CANDLE_INTERVAL_5_MIN,
        from: new Date(new Date().getTime() - ms("150min")),
    },
    FifteenMinutes: {
        interval: CandleInterval.CANDLE_INTERVAL_15_MIN,
        from: new Date(new Date().getTime() - ms("450min")),
    },
    Hour: {
        interval: CandleInterval.CANDLE_INTERVAL_HOUR,
        from: new Date(new Date().getTime() - ms("30h")),
    },
    Day: {
        interval: CandleInterval.CANDLE_INTERVAL_DAY,
        from: new Date(new Date().getTime() - ms("60 days")),
    },
};

export type TimeFrame = keyof typeof timeFrameMap;

export const macdAndLastPrice = async (figi: string, timeFrame: TimeFrame = "Day") => {
    // получить 1-минутные свечи за последние 5 мин для акций Тинкофф Групп
    const { candles } = await tinkoffApi.marketdata.getCandles({
        figi: figi,
        interval: timeFrameMap[timeFrame].interval,
        from: timeFrameMap[timeFrame].from,
        to: new Date(),
    });

    // Cleaning weekends from candles
    const cleanedCandles = candles.filter((candle) => {
        if (!candle.time) throw new Error("Ther is no time in this candle.");
        const day = new Date(candle.time).getDay();

        if (day === 0 || day === 6) return false;

        return true;
    });

    const close = cleanedCandles.map((candle) => {
        if (candle.close?.units === undefined || candle.close?.nano === undefined) return;
        const result = candle.close?.units + candle.close?.nano / 1e9;
        return result;
    }) as number[];

    const macdInput = {
        values: close,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    };

    const macd = MACD.calculate(macdInput);
    const price = close.at(-1);

    return { macd, price };
};
