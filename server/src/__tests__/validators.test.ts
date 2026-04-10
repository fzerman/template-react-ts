import { describe, it, expect } from "vitest";
import {
    MarketBuySchema,
    MarketSellSchema,
    UserSyncSchema,
    validate,
} from "../validators/socketEvents.js";

describe("MarketBuySchema", () => {
    it("accepts valid input", () => {
        const result = MarketBuySchema.parse({ itemId: "sword-01", quantity: 5 });
        expect(result).toEqual({ itemId: "sword-01", quantity: 5 });
    });

    it("rejects empty itemId", () => {
        expect(() => MarketBuySchema.parse({ itemId: "", quantity: 1 })).toThrow();
    });

    it("rejects quantity < 1", () => {
        expect(() => MarketBuySchema.parse({ itemId: "a", quantity: 0 })).toThrow();
    });

    it("rejects quantity > 100", () => {
        expect(() => MarketBuySchema.parse({ itemId: "a", quantity: 101 })).toThrow();
    });

    it("rejects non-integer quantity", () => {
        expect(() => MarketBuySchema.parse({ itemId: "a", quantity: 2.5 })).toThrow();
    });
});

describe("MarketSellSchema", () => {
    it("accepts valid input", () => {
        const result = MarketSellSchema.parse({ itemId: "gem", quantity: 10 });
        expect(result).toEqual({ itemId: "gem", quantity: 10 });
    });

    it("rejects missing fields", () => {
        expect(() => MarketSellSchema.parse({})).toThrow();
    });
});

describe("UserSyncSchema", () => {
    it("accepts valid input", () => {
        const result = UserSyncSchema.parse({ balance: 100.5, level: 3 });
        expect(result).toEqual({ balance: 100.5, level: 3 });
    });

    it("rejects negative balance", () => {
        expect(() => UserSyncSchema.parse({ balance: -1, level: 1 })).toThrow();
    });

    it("rejects level < 1", () => {
        expect(() => UserSyncSchema.parse({ balance: 0, level: 0 })).toThrow();
    });

    it("rejects non-integer level", () => {
        expect(() => UserSyncSchema.parse({ balance: 0, level: 1.5 })).toThrow();
    });
});

describe("validate helper", () => {
    it("returns parsed data on success", () => {
        const data = validate(MarketBuySchema, { itemId: "x", quantity: 1 });
        expect(data).toEqual({ itemId: "x", quantity: 1 });
    });

    it("throws on invalid data", () => {
        expect(() => validate(MarketBuySchema, { itemId: "", quantity: -1 })).toThrow();
    });
});
