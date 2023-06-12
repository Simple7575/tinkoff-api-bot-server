import { Bot, InputFile } from "grammy";
import { BotToken } from "../envConstants.js";
import { zipFolder } from "../utils/zipFolder.js";
import { createFolderAndWrightJson } from "../utils/wrightToJson.js";
import { analysByGivenTimeFrame } from "../utils/analysByGivenTimeFrame.js";
import { CHAT_ID } from "../envConstants.js";
// types
import { type ClassCode } from "../../types/classcode";
import { type TimeFrame } from "../utils/macd";

if (!BotToken) throw new Error("Bot token needed.");
export const bot = new Bot(BotToken);

bot.api.setMyCommands([
    { command: "start", description: "start command" },
    { command: "getmacdzip", description: "get macd zip of given ticker" },
    { command: "getanalysbygiventime", description: "getanalysbygiventime" },
    { command: "myid", description: "Sends you your ID." },
]);

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("getmacdzip", async (ctx) => {
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
});

bot.command("getanalysbygiventime", async (ctx) => {
    await ctx.api.sendChatAction(ctx.from?.id!, "typing");
    const messages = await analysByGivenTimeFrame("FifteenMinutes");
    await ctx.api.sendChatAction(ctx.from?.id!, "typing");

    for (const message of messages) {
        await ctx.reply(message);
    }
});

bot.command("myid", async (ctx) => {
    await ctx.reply(`${ctx.from?.id}`);
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
