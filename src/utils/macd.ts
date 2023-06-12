export const calculateMACD = (closingPrices: number[]) => {
    const shortPeriod = 12; // Shorter EMA period (usually 12)
    const longPeriod = 26; // Longer EMA period (usually 26)
    const signalPeriod = 9; // Signal line EMA period (usually 9)

    // Calculate the 12-day EMA
    const calculateEMA12 = (prices: number[]) => {
        const smoothingFactor = 2 / (shortPeriod + 1);
        let ema = prices[0];
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * smoothingFactor + ema;
        }
        return ema;
    };

    // Calculate the 26-day EMA
    const calculateEMA26 = (prices: number[]) => {
        const smoothingFactor = 2 / (longPeriod + 1);
        let ema = prices[0];
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * smoothingFactor + ema;
        }
        return ema;
    };

    // Calculate the MACD line
    const calculateMACDLine = (prices: number[]) => {
        const ema12 = calculateEMA12(prices);
        const ema26 = calculateEMA26(prices);
        return ema12 - ema26;
    };

    // Calculate the signal line
    const calculateSignalLine = (prices: number[]) => {
        const macdLine = calculateMACDLine(prices);
        const smoothingFactor = 2 / (signalPeriod + 1);
        let signalLine = macdLine;
        for (let i = 1; i < prices.length; i++) {
            signalLine = (macdLine - signalLine) * smoothingFactor + signalLine;
        }
        return signalLine;
    };

    // Calculate the MACD histogram
    const calculateMACDHistogram = (prices: number[]) => {
        const macdLine = calculateMACDLine(prices);
        const signalLine = calculateSignalLine(prices);
        return macdLine - signalLine;
    };

    return calculateMACDHistogram(closingPrices);
};
