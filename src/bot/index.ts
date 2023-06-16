import { Bot } from "grammy";
import { BotToken } from "../envConstants.js";
import { analysByGivenTimeFrame } from "../utils/analyse/analysByGivenTimeFrame.js";
import { CHAT_ID } from "../envConstants.js";
import {
    getCleanedCandlesTinkoff,
    getCloseValues,
    getFigiFromTicker,
    getMACD,
} from "../utils/helpers.js";
// types
import { type IntervalTinkoff } from "../utils/helpers.js";
import { CandleInterval } from "tinkoff-invest-api/cjs/generated/marketdata.js";

if (!BotToken) throw new Error("Bot token needed.");
if (!CHAT_ID) throw new Error("Chat ID needed, check env file.");
export const bot = new Bot(BotToken);

bot.api.setMyCommands([
    { command: "start", description: "start command" },
    { command: "getmacdzip", description: "get macd zip of given ticker" },
    { command: "getanalysbygiventime", description: "getanalysbygiventime" },
    { command: "myid", description: "Sends you your ID." },
    { command: "getmacdtocompare", description: "Get MACD data." },
]);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("myid", async (ctx) => {
    await ctx.reply(`${ctx.from?.id}`);
});

bot.command("getmacdtocompare", async (ctx) => {
    try {
        if (!CHAT_ID) throw new Error("Chat ID needed, check env file.");
        const figi = await getFigiFromTicker("CCL", "SPBXM");
        const candles = await getCleanedCandlesTinkoff(
            CandleInterval.CANDLE_INTERVAL_DAY,
            "1d",
            figi
        );
        const close = getCloseValues(candles);
        const macd = await getMACD(close);

        await ctx.api.sendMessage(
            CHAT_ID,
            `

Candle: ${JSON.stringify(candles.at(-3)?.close)}
Close ${close.at(-3)}

Candle: ${JSON.stringify(candles.at(-2)?.close)}
Close ${close.at(-2)}

Candle: ${JSON.stringify(candles.at(-1)?.close)}
Close ${close.at(-1)}

🛂MACD: ${macd.at(-2)?.MACD}
🚼Signal: ${macd.at(-2)?.signal}
🚺Histogram: ${macd.at(-2)?.histogram}
        `
        );
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    }
});

export const sendMessage = async (message: string) => {
    try {
        if (!CHAT_ID) throw new Error("Chat ID needed.");

        await bot.api.sendMessage(CHAT_ID, message);
    } catch (error) {
        console.log(error);
    }
};
