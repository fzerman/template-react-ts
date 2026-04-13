import { DataTypes, Model, type Sequelize } from "sequelize";

export type TransactionType =
    | "coin_purchase"    // bought coins with real money
    | "bill_earn"        // earned bills in-game
    | "bill_to_coin"     // converted bills to coins (with fee)
    | "coin_spend"       // spent coins
    | "bill_spend";      // spent bills

export interface TransactionAttributes {
    id: string;
    playerId: string;
    type: TransactionType;
    currency: "coin" | "bill";
    amount: number;
    fee: number;
    balanceBefore: number;
    balanceAfter: number;
    meta: Record<string, unknown> | null;
    createdAt?: Date;
}

export interface TransactionCreationAttributes {
    playerId: string;
    type: TransactionType;
    currency: "coin" | "bill";
    amount: number;
    fee?: number;
    balanceBefore: number;
    balanceAfter: number;
    meta?: Record<string, unknown> | null;
}

export class Transaction
    extends Model<TransactionAttributes, TransactionCreationAttributes>
    implements TransactionAttributes
{
    declare id: string;
    declare playerId: string;
    declare type: TransactionType;
    declare currency: "coin" | "bill";
    declare amount: number;
    declare fee: number;
    declare balanceBefore: number;
    declare balanceAfter: number;
    declare meta: Record<string, unknown> | null;
    declare readonly createdAt: Date;
}

export function initTransaction(sequelize: Sequelize): typeof Transaction {
    Transaction.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            playerId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: "players", key: "id" },
            },
            type: {
                type: DataTypes.ENUM(
                    "coin_purchase",
                    "bill_earn",
                    "bill_to_coin",
                    "coin_spend",
                    "bill_spend",
                ),
                allowNull: false,
            },
            currency: {
                type: DataTypes.ENUM("coin", "bill"),
                allowNull: false,
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            fee: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            balanceBefore: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            balanceAfter: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            meta: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            tableName: "transactions",
            timestamps: true,
            updatedAt: false,
            indexes: [{ fields: ["playerId"] }],
        },
    );
    return Transaction;
}
