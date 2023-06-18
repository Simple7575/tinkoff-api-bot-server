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

export const day = async (interval: IntervalTinkoff) => {
    const result = new Map<string, ResultInterface>();
    for (const ticker of tickersAndClasscodes) {
        try {
            const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
            let candles;

            // if (interval === "1m" || interval === "5m") {
            //     candles = await glueCandleBatches(interval, figi);
            // } else {
            candles = await getCleanedCandlesTinkoffRest(interval, figi);
            // }

            const close = getCloseValues(candles!);
            const allValues = getAllValues(candles).at(-1)!;
            const macd = getMACD(close);

            const queantity = 4;
            const lastFourResults = macd.slice(macd.length - queantity);
            if (lastFourResults.length < queantity) {
                result.set(ticker.ticker, { ...allValues, deal: EMPTY });
                continue;
            }

            const fourthRes = lastFourResults[0].histogram!; // 3
            const thirdRes = lastFourResults[1].histogram!; // 2
            const secondToLastRes = lastFourResults[2].histogram!; // 1
            const lastRes = lastFourResults[3].histogram!; // 0

            //  3>2>1<0 то сигнал к покупке (значение1), а если 3<2<1>0 то сигнал к продаже (значение2)
            if (fourthRes > thirdRes && thirdRes > secondToLastRes && secondToLastRes < lastRes) {
                result.set(ticker.ticker, { ...allValues, deal: BUY });
            } else if (
                fourthRes < thirdRes &&
                thirdRes < secondToLastRes &&
                secondToLastRes > lastRes
            ) {
                result.set(ticker.ticker, { ...allValues, deal: SELL });
            } else {
                result.set(ticker.ticker, { ...allValues, deal: EMPTY });
            }
        } catch (error) {
            console.log(error);
            continue;
        }
    }
    return result;
};

export const fiveMin = async (interval: IntervalTinkoff) => {
    const result = new Map<string, ResultInterface>();
    for (const ticker of tickersAndClasscodes) {
        try {
            const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
            let candles;

            // if (interval === "1m" || interval === "5m") {
            //     candles = await glueCandleBatches(interval, figi);
            // } else {
            candles = await getCleanedCandlesTinkoffRest(interval, figi);
            // }

            const close = getCloseValues(candles!);
            const allValues = getAllValues(candles).at(-1)!;
            const macd = getMACD(close);

            const queantity = 4;
            const lastFourResults = macd.slice(macd.length - queantity);
            if (lastFourResults.length < queantity) {
                result.set(ticker.ticker, { ...allValues, deal: EMPTY });
                continue;
            }

            const fourthRes = lastFourResults[0].histogram!; // 3
            const thirdRes = lastFourResults[1].histogram!; // 2
            const secondToLastRes = lastFourResults[2].histogram!; // 1
            const lastRes = lastFourResults[3].histogram!; // 0

            //  3>2>1<0 то сигнал к покупке (значение1), а если 3<2<1>0 то сигнал к продаже (значение2)
            if (fourthRes > thirdRes && thirdRes > secondToLastRes && secondToLastRes < lastRes) {
                result.set(ticker.ticker, { ...allValues, deal: BUY });
            } else if (
                fourthRes < thirdRes &&
                thirdRes < secondToLastRes &&
                secondToLastRes > lastRes
            ) {
                result.set(ticker.ticker, { ...allValues, deal: SELL });
            } else {
                result.set(ticker.ticker, { ...allValues, deal: EMPTY });
            }
        } catch (error) {
            console.log(error);
            continue;
        }
    }
    return result;
};

export const analyseMarket = async (interval: IntervalTinkoff) => {
    // mojno kopirovat funkcii s verxu nazvat kak ugodno i vizvat ix sdes i poluchit rezultat kak nije 👇
    // v skobkax pishem jelaemi interval svechei
    // validni interval "1m" | "2m" | "3m" | "5m" | "10m" | "15m" | "30m" | "1h" | "2h" | "4h" | "1d" | "7 days" | "30 days"
    const result1 = await day("1d");
    const result2 = await fiveMin("5m");
    for (const ticker of tickersAndClasscodes) {
        // // @ts-expect-error
        // result1.get(ticker.ticker).open;
        // // @ts-expect-error
        // result1.get(ticker.ticker).close;
        // // @ts-expect-error
        // result2.get(ticker.ticker).open;
        // // @ts-expect-error
        // result2.get(ticker.ticker).close;

        try {
            // V bloke if mojete napisat lubuyu logiku
            // Buy
            if (
                result1.get(ticker.ticker)?.deal === BUY &&
                result2.get(ticker.ticker)?.deal === BUY
            ) {
                // otpravlyaem soobshenie buy
                await sendMessage(
                    `${interval} ${ticker.ticker} ${BUY}  Vashe Soobshenie zdes mojno propisat`
                );
                // Sell
            } else if (
                result1.get(ticker.ticker)?.deal === SELL &&
                result2.get(ticker.ticker)?.deal === SELL
            ) {
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
