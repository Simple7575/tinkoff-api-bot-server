import { HistoricCandle } from "tinkoff-invest-api/cjs/generated/marketdata.js";
import {
    IntervalTinkoff,
    getFigiFromTicker,
    getCleanedCandlesTinkoffRest,
} from "../../utils/helpers.js";
import { CandlesModel } from "../schemas/candlesSchema.js";
import { tickersAndClasscodes } from "../../utils/tickersAndClasscodes.js";
import { IntervalToMsMap } from "../../utils/maps.js";

export const saveCandles = async (
    ticker: string,
    interval: IntervalTinkoff,
    candles: HistoricCandle[]
) => {
    try {
        const candlesToSave = {
            [interval]: candles,
        };

        const newCandles = new CandlesModel({
            ticker,
            candles: candlesToSave,
        });

        await newCandles.save();
    } catch (error) {
        console.log(error);
    }
};

export const lookUpInDB = async (
    ticker: (typeof tickersAndClasscodes)[number],
    interval: IntervalTinkoff,
    shceduledInterval: IntervalTinkoff
): Promise<HistoricCandle[]> => {
    const existingCandles = await CandlesModel.findOne({ ticker: ticker.ticker });

    if (!existingCandles) {
        console.log("Save", `candles.${interval}`, "API call");
        const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
        const candles = await getCleanedCandlesTinkoffRest(interval, figi);
        await saveCandles(ticker.ticker, interval, candles);
        return candles;
    } else {
        const field = `candles.${interval}`;

        if (existingCandles.candles[interval].length === 0) {
            // if candles of given interval in db are not exist yet, get candles from tinkoff and update candles in db
            console.log("Update", `candles.${interval}`, "API call");
            const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
            const candles = await getCleanedCandlesTinkoffRest(interval, figi);
            await existingCandles.updateOne({ $set: { [field]: candles } });
            return candles;
        } else {
            const time =
                existingCandles.candles[interval][existingCandles.candles[interval].length - 1]
                    .time;
            if (!time) {
                // if last candle don't have time specified, get candles from tinkoff and compare with last candle
                // if they are same just return candles
                // else push ne candle to db and return candles
                // ----------for now just return candles from tinkoff with warrning
                console.warn("Last candle had no time in it.", ticker.ticker, interval, "API call");
                const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
                const candles = await getCleanedCandlesTinkoffRest(interval, figi);
                return candles;
            }

            const timeAndInterval = new Date(time).getTime() + IntervalToMsMap[interval];
            const now = Date.now();
            console.log(interval, new Date(time));
            console.log(interval, new Date());
            // if now > timeAndInterval means there is new candle in api so get new candles from api
            // update candles in db and return updated candles
            // else return candles from db
            if (now > timeAndInterval) {
                console.log("Greater", "API call");
                const figi = await getFigiFromTicker(ticker.ticker, ticker.classCode);
                const candles = await getCleanedCandlesTinkoffRest(interval, figi);
                const newCandleTime = candles.at(-1)?.time!;
                // this part of code need test coverage
                if (new Date(time).getTime() === new Date(newCandleTime).getTime()) {
                    console.log("Candles are the same");
                    return candles;
                }

                // if candles length in db is geater than 300 remove first candle and push new candle to the end
                if (existingCandles.candles[interval].length > 300) {
                    const newCandles = existingCandles.candles[interval].slice(1);
                    newCandles.push(candles[candles.length - 1]);

                    const updated = await CandlesModel.findOneAndUpdate(
                        { ticker: ticker.ticker },
                        { $set: { [field]: newCandles } },
                        { returnDocument: "after" }
                    );

                    return updated!.candles[interval];
                } else {
                    const updated = await CandlesModel.findOneAndUpdate(
                        { ticker: ticker.ticker },
                        { $push: { [field]: candles[candles.length - 1] } },
                        { returnDocument: "after" }
                    );

                    return updated!.candles[interval];
                }
            } else {
                console.log("DB call");
                return existingCandles.candles[interval];
            }
        }
    }
};
