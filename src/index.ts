import express from "express";
import cors from "cors";

import { bot } from "./bot/index.js";
import { PORT } from "./envConstants.js";
import { getMACDTinkoff } from "./handlers/getMACDTinkoff.js";
import { getMACDYahoo } from "./handlers/getMACDYahoo.js";
import { startSchedule } from "./cron/cron.js";

const port = PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.get("/", async (req, res) => {
    res.status(200).json("Welcome");
});

app.get("/macd/tinkoff", getMACDTinkoff);
app.get("/macd/yahoo", getMACDYahoo);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    bot.start({ drop_pending_updates: true });

    startSchedule();
});
