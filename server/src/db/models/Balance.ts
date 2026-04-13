import { DataTypes, Model, type Sequelize } from "sequelize";

export interface BalanceAttributes {
    id: string;
    playerId: string;
    coins: number;
    bills: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BalanceCreationAttributes {
    playerId: string;
    coins?: number;
    bills?: number;
}

export class Balance
    extends Model<BalanceAttributes, BalanceCreationAttributes>
    implements BalanceAttributes
{
    declare id: string;
    declare playerId: string;
    declare coins: number;
    declare bills: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initBalance(sequelize: Sequelize): typeof Balance {
    Balance.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            playerId: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: true,
                references: { model: "players", key: "id" },
            },
            coins: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            bills: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            tableName: "balances",
            timestamps: true,
        },
    );
    return Balance;
}
