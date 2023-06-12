import dotenv from "dotenv";
dotenv.config();

const TinkofAPIKey = process.env.TINKOFF_TOKEN;
const BotToken = process.env.BT_TOKEN;
const PORT = process.env.PORT;
const CHAT_ID = process.env.CHAT_ID;

export { TinkofAPIKey, BotToken, PORT, CHAT_ID };
