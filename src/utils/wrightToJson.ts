import { getMACD, getCandles, getCloseValues } from "./getDataFromTinkoff.js";
import { promises as fs } from "fs";
import { type ClassCode } from "../../types/classcode";

export const createFolderAndWrightJson = async (ticker: string, classCode: ClassCode) => {
    console.log("Start creation.");

    const date = new Date()
        .toLocaleString()
        .replaceAll(/(\/)|(,)/gi, "-")
        .replaceAll(/(:)/gi, "_")
        .replaceAll(" ", "");
    const folder = `./jsons/date-${date}`;

    const macd = await getMACD(ticker, classCode);
    const candles = await getCandles(ticker, classCode);
    const close = await getCloseValues(ticker, classCode);

    try {
        await fs.mkdir(folder);

        await fs.writeFile(`${folder}/macd-${ticker}.json`, JSON.stringify(macd, null, 4));

        await fs.writeFile(`${folder}/candles-${ticker}.json`, JSON.stringify(candles, null, 4));

        await fs.writeFile(`${folder}/close-${ticker}.json`, JSON.stringify(close, null, 4));

        return folder;
    } catch (error) {
        console.log(error);
    }
};
