import {
    getCleanedCandlesTinkoffRest,
    getCloseValues,
    getFigiFromTicker,
    getMACD,
    glueCandleBatches,
} from "./helpers.js";
import { tickersAndClasscodes } from "./tickersAndClasscodes.js";
// types
import { type IntervalTinkoff } from "./helpers.js";

export const analysByGivenTimeFrame = async (interval: IntervalTinkoff = "1d") => {
    const messages = [];

    for (const ticker of tickersAndClasscodes) {
        let message = "";

        const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
        let candles;

        if (interval === "1m" || interval === "5m") {
            candles = await glueCandleBatches(interval, figi);
        } else {
            candles = await getCleanedCandlesTinkoffRest(interval, figi);
        }

        const close = getCloseValues(candles!);

        const macd = await getMACD(close);
        const lastFourResults = macd.slice(macd.length - 4);
        const fourthRes = lastFourResults[0].histogram!; // 3
        const thirdRes = lastFourResults[1].histogram!; // 2
        const secondToLastRes = lastFourResults[2].histogram!; // 1
        const lastRes = lastFourResults[3].histogram!; // 0

        //  3>2>1<0 то сигнал к покупке (значение1), а если 3<2<1>0 то сигнал к продаже (значение2)
        if (fourthRes > thirdRes && thirdRes > secondToLastRes && secondToLastRes < lastRes) {
            message = `${interval} ${ticker.ticker} ${close.at(-1)} BUY📈`;
            messages.push(message);
            console.log("Buy");
        } else if (
            fourthRes < thirdRes &&
            thirdRes < secondToLastRes &&
            secondToLastRes > lastRes
        ) {
            message = `${interval} ${ticker.ticker} ${close.at(-1)} SELL📉`;
            messages.push(message);
            console.log("Sell");
        } else {
            // message = `${interval} ${ticker.ticker} ${price} No Signal❌`;
            // messages.push(message);
            console.log("No signal");
        }
    }

    return messages;
};
