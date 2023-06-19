import {
    getAllValues,
    getCleanedCandlesTinkoffRest,
    getCloseValues,
    getFigiFromTicker,
    getMACD,
    glueCandleBatches,
} from "../helpers.js";
import { tickersAndClasscodes } from "../tickersAndClasscodes.js";
// types
import { type IntervalTinkoff } from "../helpers.js";
import { sendMessage } from "../../bot/index.js";

const BUY = "Buy" as const;
const SELL = "Sell" as const;
const EMPTY = "Empty" as const;
type DealType = typeof BUY | typeof SELL | typeof EMPTY;
interface ResultInterface {
    deal: DealType;
    open: number;
    close: number;
    high?: number;
    low?: number;
    date?: string;
}

export const day = async (
    ticker: (typeof tickersAndClasscodes)[number],
    interval: IntervalTinkoff
) => {
    try {
        const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
        let candles = await getCleanedCandlesTinkoffRest(interval, figi);

        const close = getCloseValues(candles!);
        const allValues = getAllValues(candles);
        const quantityOfValues = 2;
        const lastFourValuse = allValues.slice(allValues.length - quantityOfValues);
        const candleAClose = lastFourValuse[0].close; // predposlednaya svecha close
        const candleAOpen = lastFourValuse[0].open; // predposlednaya svecha open
        const candleBClose = lastFourValuse[1].close; // poslednaya svecha close
        const candleBOpen = lastFourValuse[1].open; // poslednaya svecha open
        const candleBDate = lastFourValuse[1].date; // poslednaya svecha open

        const macd = getMACD(close);
        const quantityOfMacd = 4;
        const lastFourResults = macd.slice(macd.length - quantityOfMacd);
        if (lastFourResults.length < quantityOfMacd) {
            return EMPTY;
        }

        const fourthRes = lastFourResults[0].histogram!; // 3
        const thirdRes = lastFourResults[1].histogram!; // 2
        const secondToLastRes = lastFourResults[2].histogram!; // 1
        const lastRes = lastFourResults[3].histogram!; // 0

        //  3>2>1<0 то сигнал к покупке (значение1), а если 3<2<1>0 то сигнал к продаже (значение2)
        if (fourthRes > thirdRes && thirdRes > secondToLastRes && secondToLastRes < lastRes) {
            return BUY;
        } else if (
            fourthRes < thirdRes &&
            thirdRes < secondToLastRes &&
            secondToLastRes > lastRes
        ) {
            return SELL;
        } else {
            return EMPTY;
        }
    } catch (error) {
        console.log(error);
    }
};

export const fiveMin = async (
    ticker: (typeof tickersAndClasscodes)[number],
    interval: IntervalTinkoff
) => {
    try {
        const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
        let candles = await getCleanedCandlesTinkoffRest(interval, figi);

        const close = getCloseValues(candles!);
        const allValues = getAllValues(candles);
        const quantityOfValues = 2;
        const lastFourValuse = allValues.slice(allValues.length - quantityOfValues);
        const candleAClose = lastFourValuse[0].close; // predposlednaya svecha close
        const candleAOpen = lastFourValuse[0].open; // predposlednaya svecha open
        const candleBClose = lastFourValuse[1].close; // poslednaya svecha close
        const candleBOpen = lastFourValuse[1].open; // poslednaya svecha open
        const candleBDate = lastFourValuse[1].date; // poslednaya svecha open

        const macd = getMACD(close);
        const quantityOfMacd = 4;
        const lastFourResults = macd.slice(macd.length - quantityOfMacd);
        if (lastFourResults.length < quantityOfMacd) {
            return EMPTY;
        }

        const fourthRes = lastFourResults[0].histogram!; // 3
        const thirdRes = lastFourResults[1].histogram!; // 2
        const secondToLastRes = lastFourResults[2].histogram!; // 1
        const lastRes = lastFourResults[3].histogram!; // 0

        //  3>2>1<0 то сигнал к покупке (значение1), а если 3<2<1>0 то сигнал к продаже (значение2)
        if (fourthRes > thirdRes && thirdRes > secondToLastRes && secondToLastRes < lastRes) {
            return BUY;
        } else if (
            fourthRes < thirdRes &&
            thirdRes < secondToLastRes &&
            secondToLastRes > lastRes
        ) {
            return SELL;
        } else {
            return EMPTY;
        }
    } catch (error) {
        console.log(error);
    }
};

export const analyseOneByOne = async (interval: IntervalTinkoff) => {
    for (const ticker of tickersAndClasscodes) {
        try {
            // mojno kopirovat funkcii s verxu nazvat kak ugodno i vizvat ix sdes i poluchit rezultat kak nije 👇
            // v skobkax pishem jelaemi interval svechei
            // validni interval "1m" | "2m" | "3m" | "5m" | "10m" | "15m" | "30m" | "1h" | "2h" | "4h" | "1d" | "7 days" | "30 days"
            const result1 = await day(ticker, "1d");
            const result2 = await fiveMin(ticker, "5m");

            // V bloke if mojete napisat lubuyu logiku
            // Buy
            if (result1 === BUY && result2 === BUY) {
                // otpravlyaem soobshenie buy
                await sendMessage(
                    `${interval} ${ticker.ticker} ${BUY}  Vashe Soobshenie zdes mojno propisat`
                );
                // Sell
            } else if (result1 === SELL && result2 === SELL) {
                // otpravlyaem soobshenie sell
                await sendMessage(
                    `${interval} ${ticker.ticker} ${SELL}  Vashe Soobshenie zdes mojno propisat`
                );
            }
        } catch (error) {
            console.log(error);
            continue;
        }
    }
};
