import {
    getCleanedCandlesTinkoffRest,
    getCloseValues,
    getFigiFromTicker,
    getMACD,
    glueCandleBatches,
} from "../helpers.js";
import { tickersAndClasscodes } from "../tickersAndClasscodes.js";
// types
import { type IntervalTinkoff } from "../helpers.js";

export const analyseFiveMinInterval = async (interval: IntervalTinkoff = "5m") => {
    const messages = [];

    for (const ticker of tickersAndClasscodes) {
        let message = "";

        const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);

        const candles = await glueCandleBatches(interval, figi);

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
            console.log("No signal");
        }
    }

    return messages;
};
