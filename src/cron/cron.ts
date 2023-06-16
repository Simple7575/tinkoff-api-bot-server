import { scheduleJob } from "node-schedule";
import { analyseMarket } from "../utils/analyse/analyseMarket.js";

export const startSchedule = () => {
    scheduleJob("At every 1th min.", "*/1 * * * *", () => {
        analyseMarket("1m");
    });

    scheduleJob("At every 2 min.", "*/2 * * * *", () => {
        analyseMarket("2m");
    });

    scheduleJob("At every 3 min.", "*/3 * * * *", () => {
        analyseMarket("3m");
    });

    scheduleJob("At every 5th min.", "*/5 * * * *", () => {
        analyseMarket("5m");
    });

    scheduleJob("At every 10th min.", "*/10 * * * *", () => {
        analyseMarket("10m");
    });

    scheduleJob("At every 15th min.", "*/15 * * * *", () => {
        analyseMarket("15m");
    });

    scheduleJob("At every 30th min.", "*/30 * * * *", () => {
        analyseMarket("30m");
    });

    scheduleJob("At every hour.", "0 * * * *", () => {
        analyseMarket("1h");
    });

    scheduleJob("At every 2 hrs.", "0 */2 * * *", () => {
        analyseMarket("2h");
    });

    scheduleJob("At every 4th hr.", "0 */4 * * *", () => {
        analyseMarket("4h");
    });

    scheduleJob("Every day at 1:50AM.", "50 1 * * *", () => {
        analyseMarket("1d");
    });

    scheduleJob("At every weekend.", "0 0 * * 0", () => {
        analyseMarket("7 days");
    });

    scheduleJob("At 00:00 on day-of-month 1.", "0 0 1 * *", () => {
        analyseMarket("30 days");
    });
};
