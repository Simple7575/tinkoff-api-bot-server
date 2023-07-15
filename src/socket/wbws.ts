import WebSocket from "ws";
import { TinkofAPIKey } from "../envConstants.js";
import { getFigiFromTicker } from "../utils/helpers.js";
import { tickersAndClasscodes, figiToTickerMap } from "../utils/tickersAndClasscodes.js";
// types
import { type StreamCandle } from "../../types/streamCandle";

const ws = new WebSocket(
    "wss://invest-public-api.tinkoff.ru/ws/tinkoff.public.invest.api.contract.v1.MarketDataStreamService/MarketDataStream",
    {
        headers: {
            Authorization: `Bearer ${TinkofAPIKey}`,
            "Web-Socket-Protocol": `json`,
        },
    }
);

export const startStream = () => {
    ws.on("open", async () => {
        console.log("Socket opened");
        const instruments = await Promise.all(
            tickersAndClasscodes.map(async (t) => {
                const figi = await getFigiFromTicker(t.ticker, t.classCode);
                return {
                    interval: "SUBSCRIPTION_INTERVAL_ONE_MINUTE",
                    instrumentId: figi,
                };
            })
        );

        // const aalFigi = await getFigiFromTicker("AAL", "SPBXM");
        // const gazpFigi = await getFigiFromTicker("GAZP", "TQBR");
        console.log(instruments);

        const request = {
            subscribeCandlesRequest: {
                subscriptionAction: "SUBSCRIPTION_ACTION_SUBSCRIBE",
                instruments: [
                    ...instruments,
                    // {
                    //     interval: "SUBSCRIPTION_INTERVAL_ONE_MINUTE",
                    //     instrumentId: aalFigi,
                    // },
                    // {
                    //     interval: "SUBSCRIPTION_INTERVAL_FIVE_MINUTES",
                    //     instrumentId: aalFigi,
                    // },
                ],
                waitingClose: false,
            },
        };

        ws.send(JSON.stringify(request), (err) => console.log("ERR", err));
    });

    ws.on("message", (data, isBinary) => {
        const result = isBinary ? data : data.toString();

        if (typeof result === "string") {
            const data = JSON.parse(result) as StreamCandle;

            // console.log(data);
            if (data.candle) {
                console.log(
                    figiToTickerMap[data.candle.figi],
                    data.candle.figi,
                    Number(data.candle.close?.units) + data.candle.close?.nano / 1e9,
                    new Date(data.candle.time).toLocaleString(),
                    new Date(data.candle.lastTradeTs).toLocaleString(),
                    data.candle.interval
                );
                // @ts-expect-error
            } else if (data.subscribeCandlesResponse) {
                // @ts-expect-error
                console.log(data.subscribeCandlesResponse);
            }
        }
    });

    // Event: WebSocket connection error
    ws.on("error", (error) => {
        console.error("WebSocket connection error:", error);
    });
};
