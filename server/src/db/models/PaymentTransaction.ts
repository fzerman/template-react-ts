import { DataTypes, Model, type Sequelize } from "sequelize";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface PaymentTransactionAttributes {
    id: string;
    playerId: string;
    productId: string;
    providerRef: string | null;
    amount: number;
    currency: string;
    status: PaymentStatus;
    providerData: Record<string, unknown> | null;
    completedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PaymentTransactionCreationAttributes {
    playerId: string;
    productId: string;
    providerRef?: string | null;
    amount: number;
    currency?: string;
    status?: PaymentStatus;
    providerData?: Record<string, unknown> | null;
    completedAt?: Date | null;
}

export class PaymentTransaction
    extends Model<PaymentTransactionAttributes, PaymentTransactionCreationAttributes>
    implements PaymentTransactionAttributes
{
    declare id: string;
    declare playerId: string;
    declare productId: string;
    declare providerRef: string | null;
    declare amount: number;
    declare currency: string;
    declare status: PaymentStatus;
    declare providerData: Record<string, unknown> | null;
    declare completedAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initPaymentTransaction(sequelize: Sequelize): typeof PaymentTransaction {
    PaymentTransaction.init(
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
            productId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: "products", key: "id" },
            },
            providerRef: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                comment: "Payment provider transaction/reference ID",
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: "Amount in smallest currency unit",
            },
            currency: {
                type: DataTypes.STRING(3),
                allowNull: false,
                defaultValue: "USD",
            },
            status: {
                type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
                allowNull: false,
                defaultValue: "pending",
            },
            providerData: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: "Raw callback payload from payment provider",
            },
            completedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            tableName: "payment_transactions",
            timestamps: true,
            indexes: [
                { fields: ["playerId"] },
                { fields: ["status"] },
            ],
        },
    );
    return PaymentTransaction;
}
