import { getFigiFromTicker } from "./helpers.js";
import { macdAndLastPrice } from "./macdAndLastPrice.js";
import { tickersAndClasscodes } from "./tickersAndClasscodes.js";
// types
import { type TimeFrame } from "./macdAndLastPrice.js";

export const analysByGivenTimeFrame = async (timeFrame: TimeFrame = "Day") => {
    const messages = [];

    for (const ticker of tickersAndClasscodes) {
        const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);

        let message = "";

        const { macd, price } = await macdAndLastPrice(figi);
        const lastFourDays = macd.slice(macd.length - 4);
        const dayFour = lastFourDays[0].histogram!; // 3
        const dayTrhee = lastFourDays[1].histogram!; // 2
        const dayTwo = lastFourDays[2].histogram!; // 1
        const today = lastFourDays[3].histogram!; // 0

        //  3>2>1<0 то сигнал к покупке (значение1), а если 3<2<1>0 то сигнал к продаже (значение2)
        if (dayFour > dayTrhee && dayTrhee > dayTwo && dayTwo < today) {
            message = `${timeFrame} ${ticker.ticker} ${price} BUY📈`;
            messages.push(message);
            console.log("Buy");
        } else if (dayFour < dayTrhee && dayTrhee < dayTwo && dayTwo > today) {
            message = `${timeFrame} ${ticker.ticker} ${price} SELL📉`;
            messages.push(message);
            console.log("Sell");
        } else {
            // message = `${timeFrame} ${ticker.ticker} ${price} No Signal❌`;
            // messages.push(message);
            console.log("No signal");
        }
    }

    return messages;
};
