import dotenv from "dotenv";
dotenv.config();

const TinkofAPIKey = process.env.TINKOFF_TOKEN;
const BotToken = process.env.BT_TOKEN;
const PORT = process.env.PORT;
const CHAT_ID = process.env.CHAT_ID;
const MONGO_URI = process.env.MONGO_URI;

export { TinkofAPIKey, BotToken, PORT, CHAT_ID, MONGO_URI };
