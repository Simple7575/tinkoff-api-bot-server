import { CandleInterval } from "tinkoff-invest-api/cjs/generated/marketdata.js";
import { api as tinkoffApi } from "./helpers.js";
import { MACD } from "technicalindicators";
import ms from "ms";

export const timeFrameMap = {
    Minute: {
        interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
        from: new Date(new Date().getTime() - ms("1day") + ms("1m")),
    },
    FiveMinutes: {
        interval: CandleInterval.CANDLE_INTERVAL_5_MIN,
        from: new Date(new Date().getTime() - ms("1day") + ms("1m")),
    },
    FifteenMinutes: {
        interval: CandleInterval.CANDLE_INTERVAL_15_MIN,
        from: new Date(new Date().getTime() - ms("1day") + ms("1m")),
    },
    Hour: {
        interval: CandleInterval.CANDLE_INTERVAL_HOUR,
        from: new Date(new Date().getTime() - ms("7 days") + ms("1m")),
    },
    Day: {
        interval: CandleInterval.CANDLE_INTERVAL_DAY,
        from: new Date(new Date().getTime() - ms("1y") + ms("1m")),
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

    const lastTwentiSixClosed = close.slice(close.length - 26);

    console.log(lastTwentiSixClosed);

    const macdInput = {
        values: lastTwentiSixClosed,
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
