import express from "express";
import cors from "cors";
import { bot } from "./bot/index.js";
import { PORT } from "./envConstants.js";
import { scheduleJob } from "node-schedule";
import { analysAndSendMessage } from "./bot/index.js";

const port = PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.get("/", async (req, res) => {
    res.status(200).json("Welcome");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    bot.start({ drop_pending_updates: true });

    scheduleJob("At every 1th minute.", "*/1 * * * *", () => {
        analysAndSendMessage("Minute");
        console.log("1 min");
    });

    scheduleJob("At every 5th minute.", "*/5 * * * *", () => {
        analysAndSendMessage("FiveMinutes");
        console.log("5 min");
    });

    scheduleJob("At every 15th minute.", "*/15 * * * *", () => {
        analysAndSendMessage("FifteenMinutes");
        console.log("15 min");
    });

    scheduleJob("At every hour.", "0 * * * *", () => {
        analysAndSendMessage("Hour");
        console.log("Hour");
    });

    scheduleJob("Every day at 1:50AM.", "50 1 * * *", () => {
        analysAndSendMessage("Day");
        console.log("day");
    });
});
