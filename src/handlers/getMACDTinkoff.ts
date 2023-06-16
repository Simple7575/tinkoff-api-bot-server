import { Request, Response } from "express";
import { MACD } from "technicalindicators";
import {
    getAllValues,
    getCleanedCandlesTinkoffRest,
    getCloseValues,
    getFigiFromTicker,
    getMACD,
    glueCandleBatches,
} from "../utils/helpers.js";
import { IntervalMapTinkoff } from "../utils/helpers.js";
// types
import { type ClassCode } from "../../types/classcode.js";
import { type IntervalTinkoff } from "../utils/helpers.js";

const isIntervalType = (interval: any): interval is IntervalTinkoff =>
    interval in IntervalMapTinkoff;
const isClassCodeType = (classCode: any): classCode is ClassCode =>
    classCode === "TQBR" || classCode === "SPBXM";

export const getMACDTinkoff = async (req: Request, res: Response) => {
    const { intervalTinkoff: interval } = req.query;
    const { ticker } = req.query;
    const { classcode } = req.query;

    if (!isIntervalType(interval)) {
        res.status(400).send("Bad interval specified.");
        return;
    }
    if (!ticker) {
        res.status(400).send("Ticker needed.");
        return;
    }
    if (!isClassCodeType(classcode)) {
        res.status(400).send("Classcode needed.");
        return;
    }

    try {
        const figi = await getFigiFromTicker(ticker as string, classcode);
        let candles;

        if (interval === "1m" || interval === "5m") {
            candles = await glueCandleBatches(interval, figi);
        } else {
            candles = await getCleanedCandlesTinkoffRest(interval, figi);
        }

        const close = getCloseValues(candles!);

        const macd = getMACD(close);

        const allValues = getAllValues(candles!);

        res.status(200).json({ macd, candles: allValues });
    } catch (error) {
        res.status(500);
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
};
