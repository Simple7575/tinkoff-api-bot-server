import OpenAPI, { MarketInstrument } from "@tinkoff/invest-openapi-js-sdk";
import { TinkofAPIKey } from "../envConstants.js";

const apiURL = "https://api-invest.tinkoff.ru/openapi";
const socketURL = "wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws";
const api = new OpenAPI({ apiURL: apiURL, secretToken: TinkofAPIKey!, socketURL });

export const stream = async () => {
    // const marketInstrument = (await api.searchOne({ ticker: "CCL" })) as MarketInstrument;
    // const { figi } = marketInstrument;

    // console.log(
    //     await api.candlesGet({
    //         from: "2019-08-19T18:38:33.131642+03:00",
    //         to: "2019-08-19T18:48:33.131642+03:00",
    //         figi,
    //         interval: "1min",
    //     }) // Получаем свечи за конкретный промежуток времени.
    // );

    const figi = "BBG000B9XRY4";

    api.candle({ figi, interval: "1min" }, (x) => {
        console.log(x);
    });
};
