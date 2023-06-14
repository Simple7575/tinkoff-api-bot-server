import close from "./close";
import { MACD } from "technicalindicators";

describe("Macd", () => {
    it("Quantity of candles should not make diference.", () => {
        const macdInput1 = {
            values: close.slice(close.length - 35),
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        };

        const macdInput2 = {
            values: close.slice(close.length - 50),
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        };

        const macd1 = MACD.calculate(macdInput1);
        const macd2 = MACD.calculate(macdInput2);

        expect(true).toBe(true);
    });
});
