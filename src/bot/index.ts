import { Bot, InputFile } from "grammy";
import { BotToken } from "../envConstants.js";
import { createFolderAndWrightJson } from "../utils/wrightToJson.js";
import { zipFolder } from "../utils/zipFolder.js";
import { type ClassCode } from "../../types/classcode";

if (!BotToken) throw new Error("Bot token needed.");
export const bot = new Bot(BotToken);

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.command("getMACDzip", async (ctx) => {
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
