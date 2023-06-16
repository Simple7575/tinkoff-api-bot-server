import { Request, Response } from "express";
import { MACD } from "technicalindicators";
import {
    IntervalMapYahoo,
    getCandlesYahoo,
    type IntervalYahoo,
    getMACD,
} from "../utils/helpers.js";
// types
import { type ClassCode } from "../../types/classcode";
import { wrightToJson } from "../utils/wrightToJson.js";

const isIntervalType = (interval: any): interval is IntervalYahoo => interval in IntervalMapYahoo;
const isClassCodeType = (classCode: any): classCode is ClassCode =>
    classCode === "TQBR" || classCode === "SPBXM";

export const getMACDYahoo = async (req: Request, res: Response) => {
    const { intervalYahoo: interval } = req.query;
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
        const candles = await getCandlesYahoo(interval, ticker as string);

        if (!candles) {
            res.status(200).send("No chart indicators.");
            return;
        }

        const close = candles.close.filter((close: number) => close !== null);
        const open = candles.open.filter((open: number) => open !== null);
        const macd = await getMACD(close);

        const openAndClose = [];

        for (let i = 0; i < open.length; i++) {
            openAndClose.push({ open: open[i], close: close[i] });
        }

        res.status(200).json({
            macd,
            candles: openAndClose,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error);
        }
    }
};
