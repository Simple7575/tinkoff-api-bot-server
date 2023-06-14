import { getMACD, getCleanedCandles, getCloseValues, getFigiFromTicker } from "./helpers.js";
import { promises as fs } from "fs";
import { timeFrameMap } from "./macdAndLastPrice.js";
// types
import { type ClassCode } from "../../types/classcode";

export const createFolderAndWrightJson = async (ticker: string, classCode: ClassCode) => {
    console.log("Start creation.");

    const date = new Date()
        .toLocaleString()
        .replaceAll(/(\/)|(,)/gi, "-")
        .replaceAll(/(:)/gi, "_")
        .replaceAll(" ", "");
    const folder = `./jsons/date-${date}`;

    const figi = await getFigiFromTicker("CCL", "SPBXM");
    const candles = await getCleanedCandles(timeFrameMap.Minute.interval, "-1d", figi);
    const close = await getCloseValues(candles);
    const macd = await getMACD(close);

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
