import { DataTypes, Model, type Sequelize } from "sequelize";

export interface PlayerAttributes {
    id: string;
    vendorId: string;
    username: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PlayerCreationAttributes {
    vendorId: string;
    username: string;
}

export class Player
    extends Model<PlayerAttributes, PlayerCreationAttributes>
    implements PlayerAttributes
{
    declare id: string;
    declare vendorId: string;
    declare username: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initPlayer(sequelize: Sequelize): typeof Player {
    Player.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            vendorId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "players",
            timestamps: true,
        },
    );
    return Player;
}
