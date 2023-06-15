import { Bot, InputFile } from "grammy";
import { BotToken, TinkofAPIKey } from "../envConstants.js";
import { zipFolder } from "../utils/zipFolder.js";
import { createFolderAndWrightJson, wrightToJson } from "../utils/wrightToJson.js";
import { analysByGivenTimeFrame } from "../utils/analysByGivenTimeFrame.js";
import { CHAT_ID } from "../envConstants.js";
import axios from "axios";
import yahooFinance from "yahoo-finance2";
import { promises as fs } from "fs";
// types
import { type ClassCode } from "../../types/classcode";
import { type TimeFrame } from "../utils/macdAndLastPrice.js";

import {
    getCleanedCandlesTinkoff,
    getCleanedCandlesTinkoffRest,
    getCloseValues,
    getFigiFromTicker,
    getMACD,
    glueCandleBatches,
} from "../utils/helpers.js";
import { MACD } from "technicalindicators";
import { CandleInterval } from "tinkoff-invest-api/cjs/generated/marketdata.js";
import { api as tinkoffAPI } from "../utils/helpers.js";
import { timeFrameMap } from "../utils/macdAndLastPrice.js";

if (!BotToken) throw new Error("Bot token needed.");
export const bot = new Bot(BotToken);

bot.api.setMyCommands([
    { command: "start", description: "start command" },
    { command: "getmacdzip", description: "get macd zip of given ticker" },
    { command: "getanalysbygiventime", description: "getanalysbygiventime" },
    { command: "myid", description: "Sends you your ID." },
    { command: "getmacdtocompare", description: "Get MACD data." },
]);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("getmacdzip", async (ctx) => {
    try {
        const ticker = ctx.message?.text.split(" ")[1].toUpperCase();
        const classCode = ctx.message?.text.split(" ")[2].toUpperCase() as ClassCode | undefined;

        if (!ticker) {
            await ctx.reply("Ticker needed");
            return;
        } else if (!classCode) {
            await ctx.reply("Classcode needed");
            return;
        }

        const folder = await createFolderAndWrightJson(ticker, classCode);
        if (!folder) throw new Error("Folder name needed");
        await zipFolder(folder);

        await ctx.api.sendChatAction(ctx.from?.id!, "upload_document");
        await ctx.api.sendDocument(ctx.from?.id!, new InputFile(`${folder}.zip`));
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
});

bot.command("getanalysbygiventime", async (ctx) => {
    try {
        await ctx.api.sendChatAction(ctx.from?.id!, "typing");
        const messages = await analysByGivenTimeFrame("FifteenMinutes");
        await ctx.api.sendChatAction(ctx.from?.id!, "typing");

        for (const message of messages) {
            await ctx.reply(message);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
});

bot.command("myid", async (ctx) => {
    await ctx.reply(`${ctx.from?.id}`);
});

bot.command("figi", async (ctx) => {
    const figi = await getFigiFromTicker("CCL", "SPBXM");
});

bot.command("rest", async (ctx) => {
    const figi = "BBG000BF6LY3";

    try {
        // const candles = await glueCandleBatches("1m", figi);
        const candles = await getCleanedCandlesTinkoffRest("1d", figi);
        if (!candles) {
            console.log("no candles");
            return;
        }
        wrightToJson(candles);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
});

bot.command("getmacdtocompare", async (ctx) => {
    try {
        const figi = await getFigiFromTicker("CCL", "SPBXM");
        const candles = await getCleanedCandlesTinkoff(timeFrameMap.Day.interval, "1d", figi);
        const close = getCloseValues(candles);
        const macd = await getMACD(close);

        console.log(candles.length);
        // console.log(close);
        console.log(figi);
        console.log(macd[macd.length - 2]);

        await ctx.reply(`

Candle: ${JSON.stringify(candles.at(-3)?.close)}
Close ${close.at(-3)}

Candle: ${JSON.stringify(candles.at(-2)?.close)}
Close ${close.at(-2)}

Candle: ${JSON.stringify(candles.at(-1)?.close)}
Close ${close.at(-1)}

🛂MACD: ${macd.at(-2)?.MACD}
🚼Signal: ${macd.at(-2)?.signal}
🚺Histogram: ${macd.at(-2)?.histogram}
        `);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
});

bot.command("yahoo", async (ctx) => {
    try {
        const query = "CCL";
        let close;
        try {
            const query = "CCL";
            const { indicators } = await yahooFinance._chart(query, {
                period1: "2023-06-12",
                return: "object" /* ... */,
                interval: "1m",
            });

            close = indicators;

            console.log(indicators.quote[0]);
        } catch (error) {
            // console.log(error.result.indicators.quote[0].close);
            // @ts-expect-error
            close = error.result.indicators.quote[0].close.filter((price: any) => price !== null);
        }

        console.log(close);

        let macdInput;

        if (close?.adjclose) {
            macdInput = {
                values: close.adjclose,
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                SimpleMAOscillator: false,
                SimpleMASignal: false,
            };
        } else {
            macdInput = {
                values: close,
                fastPeriod: 12,
                slowPeriod: 26,
                signalPeriod: 9,
                SimpleMAOscillator: false,
                SimpleMASignal: false,
            };
        }

        const macd = MACD.calculate(macdInput);

        await fs.writeFile(`./jsons/${Date.now()}.json`, JSON.stringify(close, null, 4));

        await ctx.reply(`
${close.at(-2)}
${close.at(-1)}

🛂MACD: ${macd.at(-2)?.MACD}
🚼Signal: ${macd.at(-2)?.signal}
🚺Histogram: ${macd.at(-2)?.histogram}

🛂MACD: ${macd.at(-1)?.MACD}
🚼Signal: ${macd.at(-1)?.signal}
🚺Histogram: ${macd.at(-1)?.histogram}
        `);
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
});

export const analysAndSendMessage = async (timeFrame: TimeFrame) => {
    try {
        const messages = await analysByGivenTimeFrame(timeFrame);

        if (!CHAT_ID) throw new Error("Chat ID needed.");

        for (const message of messages) {
            await bot.api.sendMessage(CHAT_ID, message);
        }
    } catch (error) {
        console.log(error);
    }
};
