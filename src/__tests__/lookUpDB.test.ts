import mongoose from "mongoose";

import { connectDB } from "../db";
import { lookUpInDB, saveCandles } from "../db/handlers/lookUpInDB";
import { CandlesModel } from "../db/schemas/candlesSchema";
import * as helpers from "../utils/helpers";
import { candle } from "../__tests__/mocks/candle";
import { candleDocumentNoTime, candleDocumentWithTime } from "../__tests__/mocks/candleDocument";
import { IntervalToMsMap } from "../utils/maps";

let db: Awaited<Promise<typeof mongoose>>;

describe("Look up to DB first", () => {
    beforeAll(async () => {
        db = (await connectDB()) as Awaited<Promise<typeof mongoose>>;
    });
    afterAll(async () => {
        // await CandlesModel.deleteMany({ ticker: "CCL" });
        db.disconnect();
    });
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Candles does not exist in db by given interval of given ticker", () => {
        it("Should call tinkoff api, save candles to db and return candles", async () => {
            const FindOneSpy = jest.spyOn(CandlesModel, "findOne");
            const FigiSpy = jest.spyOn(helpers, "getFigiFromTicker");
            const TinkoffRestSpy = jest.spyOn(helpers, "getCleanedCandlesTinkoffRest");

            FindOneSpy.mockResolvedValueOnce(null);
            FigiSpy.mockResolvedValueOnce("BBG005P7Q881");
            // @ts-expect-error
            TinkoffRestSpy.mockResolvedValueOnce(candle);

            const candles = await lookUpInDB({ ticker: "CCL", classCode: "SPBXM" }, "1d");

            FindOneSpy.mockRestore();

            const createdCandles = await CandlesModel.findOne({ ticker: "CCL" });

            expect(candles instanceof Array).toBe(true);
            expect(createdCandles?.ticker).toBe("CCL");
            expect(createdCandles?.candles["1d"][0].volume).toBe("15069");

            await CandlesModel.findOneAndRemove({ ticker: "CCL" });
        });
    });

    describe("Candles of given interval in db are not exist yet.", () => {
        it("Should get candles from tinkoff api, update candles of given interval in db, return candles.", async () => {
            const FindOneSpy = jest.spyOn(CandlesModel, "findOne");
            const FigiSpy = jest.spyOn(helpers, "getFigiFromTicker");
            const TinkoffRestSpy = jest.spyOn(helpers, "getCleanedCandlesTinkoffRest");

            FindOneSpy.mockRestore();
            // @ts-expect-error
            await saveCandles("CCL", "1m", candle);
            FigiSpy.mockResolvedValueOnce("BBG005P7Q881");
            // @ts-expect-error
            TinkoffRestSpy.mockResolvedValueOnce(candle);

            const candles = await lookUpInDB({ ticker: "CCL", classCode: "SPBXM" }, "1d");

            const updatedCandle = await CandlesModel.findOne({ ticker: "CCL" });

            expect(candles instanceof Array).toBe(true);
            expect(updatedCandle?.candles["1d"].length).toBeGreaterThan(0);
            expect(updatedCandle?.candles["5m"].length).toBe(0);

            await CandlesModel.findOneAndRemove({ ticker: "CCL" });
        });
    });

    describe("Last candle in db don't have time specified.", () => {
        it("Should give warrning in console and just return candles from tinkoff api.", async () => {
            const FindOneSpy = jest.spyOn(CandlesModel, "findOne");
            const FigiSpy = jest.spyOn(helpers, "getFigiFromTicker");
            const TinkoffRestSpy = jest.spyOn(helpers, "getCleanedCandlesTinkoffRest");
            const LogSpy = jest.spyOn(global.console, "warn");

            FindOneSpy.mockResolvedValueOnce(candleDocumentNoTime);
            FigiSpy.mockResolvedValueOnce("BBG005P7Q881");
            // @ts-expect-error
            TinkoffRestSpy.mockResolvedValueOnce(candle);

            const candles = await lookUpInDB({ ticker: "CCL", classCode: "SPBXM" }, "1d");

            expect(candles instanceof Array).toBe(true);
            expect(LogSpy).toBeCalledWith("Last candle had no time in it.", "CCL", "1d");

            await CandlesModel.findOneAndRemove({ ticker: "CCL" });
        });
    });

    describe("Now > time in candle + interval.", () => {
        describe("Candles length in db is > 300.", () => {
            it("Should get new candle from tinkoff api, remove first candle from candles array of given interval in db, add new candle to the end, return candles.", async () => {
                const FindOneSpy = jest.spyOn(CandlesModel, "findOne");
                const FigiSpy = jest.spyOn(helpers, "getFigiFromTicker");
                const TinkoffRestSpy = jest.spyOn(helpers, "getCleanedCandlesTinkoffRest");
                const DateSpy = jest.spyOn(global.Date, "now");

                FigiSpy.mockResolvedValueOnce("BBG005P7Q881");
                // @ts-expect-error
                candle[0].index = 301;
                // @ts-expect-error
                TinkoffRestSpy.mockResolvedValueOnce(candle);

                candleDocumentWithTime.candles["1d"] = new Array(301).fill(null).map((_, index) => {
                    return { ...candleDocumentWithTime.candles["1d"][0], index };
                });
                FindOneSpy.mockResolvedValueOnce(candleDocumentWithTime);

                const timeAndInterval =
                    new Date(candleDocumentWithTime.candles["1d"].at(-1)?.time!).getMilliseconds() +
                    IntervalToMsMap["1d"];
                DateSpy.mockReturnValue(timeAndInterval + 1000);

                // @ts-expect-error
                await saveCandles("CCL", "1m", candle);
                const candles = await lookUpInDB({ ticker: "CCL", classCode: "SPBXM" }, "1d");

                // @ts-expect-error
                expect(candles[0].index).toBe(1);
                // @ts-expect-error
                expect(candles.at(-1)?.index).toBe(301);

                FindOneSpy.mockRestore();

                const updatedCandles = await CandlesModel.findOne({ ticker: "CCL" });

                expect(updatedCandles?.candles["1m"].length).toBeGreaterThan(0);
                expect(updatedCandles?.candles["1d"].length).toBe(301);
                // @ts-expect-error
                expect(updatedCandles?.candles["1d"][0].index).toBe(1);
                // @ts-expect-error
                expect(updatedCandles?.candles["1d"].at(-1).index).toBe(301);

                await CandlesModel.findOneAndRemove({ ticker: "CCL" });
            });
        });

        describe("Candles length in db is < 300.", () => {
            it("Should get new candle from tinkoff api, update candles in db and return candles.", async () => {
                const FindOneSpy = jest.spyOn(CandlesModel, "findOne");
                const FigiSpy = jest.spyOn(helpers, "getFigiFromTicker");
                const TinkoffRestSpy = jest.spyOn(helpers, "getCleanedCandlesTinkoffRest");
                const DateSpy = jest.spyOn(Date, "now");

                FigiSpy.mockResolvedValueOnce("BBG005P7Q881");
                // @ts-expect-error
                candle[0].index = 10;
                // @ts-expect-error
                TinkoffRestSpy.mockResolvedValueOnce(candle);

                candleDocumentWithTime.candles["1d"] = new Array(10).fill(null).map((_, index) => {
                    return { ...candleDocumentWithTime.candles["1d"][0], index };
                });
                FindOneSpy.mockResolvedValueOnce(candleDocumentWithTime);

                const timeAndInterval =
                    new Date(candleDocumentWithTime.candles["1d"].at(-1)?.time!).getMilliseconds() +
                    IntervalToMsMap["1d"];
                DateSpy.mockReturnValue(timeAndInterval + 1000);

                // @ts-expect-error
                await saveCandles("CCL", "1m", candle);
                await CandlesModel.findOneAndUpdate(
                    { ticker: "CCL" },
                    {
                        $set: { "candles.1d": candleDocumentWithTime.candles["1d"] },
                    }
                );

                const candles = await lookUpInDB({ ticker: "CCL", classCode: "SPBXM" }, "1d");

                expect(candles.length).toBe(11);

                const updatedCandles = await CandlesModel.findOne({ ticker: "CCL" });

                expect(updatedCandles?.candles["1m"].length).toBeGreaterThan(0);
                expect(updatedCandles?.candles["1d"].length).toBe(11);
                // @ts-expect-error
                expect(updatedCandles?.candles["1d"][0].index).toBe(0);
                // @ts-expect-error
                expect(updatedCandles?.candles["1d"].at(-1).index).toBe(10);

                await CandlesModel.findOneAndRemove({ ticker: "CCL" });
            });
        });
    });

    describe("Now < time in candle + interval.", () => {
        it("Should not call tinkoff api, instead should get candles from DB and return.", async () => {
            const FindOneSpy = jest.spyOn(CandlesModel, "findOne");
            const FigiSpy = jest.spyOn(helpers, "getFigiFromTicker");
            const TinkoffRestSpy = jest.spyOn(helpers, "getCleanedCandlesTinkoffRest");
            const DateSpy = jest.spyOn(Date, "now");

            candleDocumentWithTime.candles["1d"] = new Array(10).fill(null).map((_, index) => {
                return { ...candleDocumentWithTime.candles["1d"][0], index };
            });
            FindOneSpy.mockResolvedValueOnce(candleDocumentWithTime);

            const timeAndInterval =
                new Date(candleDocumentWithTime.candles["1d"].at(-1)?.time!).getMilliseconds() +
                IntervalToMsMap["1d"];
            DateSpy.mockReturnValue(timeAndInterval - 1000);

            const candles = await lookUpInDB({ ticker: "CCL", classCode: "SPBXM" }, "1d");

            expect(FigiSpy.mock.calls.length).toBe(0);
            expect(TinkoffRestSpy.mock.calls.length).toBe(0);
            expect(candles.length).toBe(10);

            await CandlesModel.findOneAndRemove({ ticker: "CCL" });
        });
    });
});
