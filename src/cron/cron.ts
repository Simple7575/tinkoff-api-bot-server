import { scheduleJob } from "node-schedule";
import { analysAndSendMessage } from "../bot/index.js";

export const startSchedule = () => {
    // scheduleJob("At every 1th minute.", "*/1 * * * *", () => {
    //     analysAndSendMessage("1m");
    //     console.log("1 min");
    // });

    // scheduleJob("At every 15th minute.", "*/15 * * * *", () => {
    //     analysAndSendMessage("15m");
    //     console.log("15 min");
    // });

    scheduleJob("At every 5th minute.", "*/5 * * * *", () => {
        analysAndSendMessage("5m");
        console.log("5 min");
    });

    scheduleJob("At every hour.", "0 * * * *", () => {
        analysAndSendMessage("1h");
        console.log("1 hour");
    });

    scheduleJob("Every day at 1:50AM.", "50 1 * * *", () => {
        analysAndSendMessage("1d");
        console.log("1 day");
    });
};
