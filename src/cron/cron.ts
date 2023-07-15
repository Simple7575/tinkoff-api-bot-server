import { scheduleJob } from "node-schedule";
import { analyseOneByOne } from "../utils/analyse/analyseOneByOne.js";

export const startSchedule = () => {
    scheduleJob("At every 1th min.", "*/1 * * * *", () => {
        analyseOneByOne("1m");
    });

    scheduleJob("At every 2 min.", "*/2 * * * *", () => {
        analyseOneByOne("2m");
    });

    scheduleJob("At every 3 min.", "*/3 * * * *", () => {
        analyseOneByOne("3m");
    });

    scheduleJob("At every 5th min.", "*/5 * * * *", () => {
        analyseOneByOne("5m");
    });

    scheduleJob("At every 10th min.", "*/10 * * * *", () => {
        analyseOneByOne("10m");
    });

    scheduleJob("At every 15th min.", "*/15 * * * *", () => {
        analyseOneByOne("15m");
    });

    scheduleJob("At every 30th min.", "*/30 * * * *", () => {
        analyseOneByOne("30m");
    });

    scheduleJob("At every hour.", "0 * * * *", () => {
        analyseOneByOne("1h");
    });

    scheduleJob("At every 2 hrs.", "0 */2 * * *", () => {
        analyseOneByOne("2h");
    });

    scheduleJob("At every 4th hr.", "0 */4 * * *", () => {
        analyseOneByOne("4h");
    });

    scheduleJob("Every day at 1:50AM.", "50 1 * * *", () => {
        analyseOneByOne("1d");
    });

    // scheduleJob("At every weekend.", "0 0 * * 0", () => {
    //     analyseOneByOne("7 days");
    // });

    // scheduleJob("At 00:00 on day-of-month 1.", "0 0 1 * *", () => {
    //     analyseOneByOne("30 days");
    // });
};
