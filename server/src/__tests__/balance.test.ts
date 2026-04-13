import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    BalanceConvertSchema,
    BalanceHistorySchema,
    validate,
} from "../validators/socketEvents.js";

// ─── Validator Tests ────────────────────────────────────────────────────────

describe("BalanceConvertSchema", () => {
    it("accepts valid integer amount", () => {
        expect(BalanceConvertSchema.parse({ amount: 100 })).toEqual({ amount: 100 });
    });

    it("rejects amount < 1", () => {
        expect(() => BalanceConvertSchema.parse({ amount: 0 })).toThrow();
    });

    it("rejects negative amount", () => {
        expect(() => BalanceConvertSchema.parse({ amount: -5 })).toThrow();
    });

    it("rejects non-integer amount", () => {
        expect(() => BalanceConvertSchema.parse({ amount: 1.5 })).toThrow();
    });

    it("rejects missing amount", () => {
        expect(() => BalanceConvertSchema.parse({})).toThrow();
    });
});

describe("BalanceHistorySchema", () => {
    it("accepts valid input with defaults", () => {
        const result = BalanceHistorySchema.parse({});
        expect(result).toEqual({ limit: 20, offset: 0 });
    });

    it("accepts custom limit and offset", () => {
        const result = BalanceHistorySchema.parse({ limit: 50, offset: 10 });
        expect(result).toEqual({ limit: 50, offset: 10 });
    });

    it("rejects limit > 100", () => {
        expect(() => BalanceHistorySchema.parse({ limit: 101 })).toThrow();
    });

    it("rejects limit < 1", () => {
        expect(() => BalanceHistorySchema.parse({ limit: 0 })).toThrow();
    });

    it("rejects negative offset", () => {
        expect(() => BalanceHistorySchema.parse({ offset: -1 })).toThrow();
    });
});

// ─── BalanceService Unit Tests (mocked DB) ──────────────────────────────────

// Mock Sequelize models before importing the service
const mockBalance = {
    coins: 0,
    bills: 0,
    save: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../db/models/index.js", () => ({
    sequelize: {
        transaction: vi.fn(async (cb: (t: unknown) => Promise<unknown>) => {
            const mockTransaction = { LOCK: { UPDATE: "UPDATE" } };
            return cb(mockTransaction);
        }),
    },
}));

vi.mock("../db/models/Balance.js", () => ({
    Balance: {
        findOrCreate: vi.fn().mockImplementation(async ({ defaults }: { defaults: { coins: number; bills: number } }) => {
            mockBalance.coins = defaults?.coins ?? 0;
            mockBalance.bills = defaults?.bills ?? 0;
            return [mockBalance, true];
        }),
    },
}));

vi.mock("../db/models/Transaction.js", () => ({
    Transaction: {
        create: vi.fn().mockResolvedValue({}),
        findAndCountAll: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
    },
}));

describe("BalanceService", () => {
    let BalanceService: typeof import("../services/BalanceService.js");

    beforeEach(async () => {
        vi.clearAllMocks();
        // Reset balance state
        mockBalance.coins = 0;
        mockBalance.bills = 0;

        // Dynamic import to get fresh module with mocks
        BalanceService = await import("../services/BalanceService.js");
    });

    describe("getBillToCoinFeePercent / setBillToCoinFeePercent", () => {
        it("returns the default fee of 10%", () => {
            expect(BalanceService.getBillToCoinFeePercent()).toBe(10);
        });

        it("updates the fee", () => {
            BalanceService.setBillToCoinFeePercent(25);
            expect(BalanceService.getBillToCoinFeePercent()).toBe(25);
            // Reset
            BalanceService.setBillToCoinFeePercent(10);
        });

        it("rejects fee < 0", () => {
            expect(() => BalanceService.setBillToCoinFeePercent(-1)).toThrow("Fee percent must be between 0 and 100");
        });

        it("rejects fee > 100", () => {
            expect(() => BalanceService.setBillToCoinFeePercent(101)).toThrow("Fee percent must be between 0 and 100");
        });
    });

    describe("addCoins", () => {
        it("rejects non-positive amount", async () => {
            await expect(BalanceService.addCoins("player-1", 0)).rejects.toThrow("Amount must be positive");
            await expect(BalanceService.addCoins("player-1", -10)).rejects.toThrow("Amount must be positive");
        });

        it("adds coins and returns updated balance", async () => {
            const result = await BalanceService.addCoins("player-1", 500);
            expect(result.coins).toBe(500);
            expect(mockBalance.save).toHaveBeenCalled();
        });
    });

    describe("addBills", () => {
        it("rejects non-positive amount", async () => {
            await expect(BalanceService.addBills("player-1", 0)).rejects.toThrow("Amount must be positive");
        });

        it("adds bills and returns updated balance", async () => {
            const result = await BalanceService.addBills("player-1", 200);
            expect(result.bills).toBe(200);
        });
    });

    describe("convertBillToCoin", () => {
        it("rejects non-positive amount", async () => {
            await expect(BalanceService.convertBillToCoin("player-1", 0)).rejects.toThrow("Amount must be positive");
        });

        it("rejects insufficient bills", async () => {
            // mockBalance starts with 0 bills
            await expect(BalanceService.convertBillToCoin("player-1", 100)).rejects.toThrow("Insufficient bills");
        });

        it("converts with correct fee deduction", async () => {
            // Set up balance with bills
            mockBalance.bills = 1000;
            mockBalance.coins = 0;

            const { Balance } = await import("../db/models/Balance.js");
            vi.mocked(Balance.findOrCreate).mockResolvedValueOnce([mockBalance as never, false]);

            BalanceService.setBillToCoinFeePercent(10);
            const result = await BalanceService.convertBillToCoin("player-1", 100);

            expect(result.fee).toBe(10); // 10% of 100
            expect(result.coinsReceived).toBe(90); // 100 - 10
            expect(result.bills).toBe(900); // 1000 - 100

            // Reset
            BalanceService.setBillToCoinFeePercent(10);
        });
    });

    describe("getBalance", () => {
        it("returns coins and bills", async () => {
            const { Balance } = await import("../db/models/Balance.js");
            const existing = { coins: 50, bills: 100, save: vi.fn() };
            vi.mocked(Balance.findOrCreate).mockResolvedValueOnce([existing as never, false]);
            const result = await BalanceService.getBalance("player-1");
            expect(result).toEqual({ coins: 50, bills: 100 });
        });
    });

    describe("getTransactionHistory", () => {
        it("returns empty list when no transactions", async () => {
            const result = await BalanceService.getTransactionHistory("player-1");
            expect(result).toEqual({ transactions: [], total: 0 });
        });
    });
});
