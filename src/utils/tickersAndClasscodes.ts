import { type ClassCode } from "../../types/classcode";

export const tickersAndClasscodes: { ticker: string; classCode: ClassCode }[] = [
    { ticker: "AAL", classCode: "SPBXM" },
    { ticker: "CCL", classCode: "SPBXM" },
    { ticker: "AWH", classCode: "SPBXM" },
    { ticker: "WISH", classCode: "SPBXM" },
    { ticker: "CLOV", classCode: "SPBXM" },
    { ticker: "GAZP", classCode: "TQBR" },
    { ticker: "SBER", classCode: "TQBR" },
    { ticker: "POLY", classCode: "TQBR" },
    { ticker: "MVID", classCode: "TQBR" },
    { ticker: "AFLT", classCode: "TQBR" },
];

export const figiToTickerMap = {
    BBG005P7Q881: "AAL",
    BBG000BF6LY3: "CCL",
    BBG000BTYP37: "AWH",
    BBG006DZTJ56: "WISH",
    BBG00SHY90J5: "CLOV",
    BBG004730RP0: "GAZP",
    BBG004730N88: "SBER",
    BBG004PYF2N3: "POLY",
    BBG004S68CP5: "MVID",
    BBG004S683W7: "AFLT",
};
