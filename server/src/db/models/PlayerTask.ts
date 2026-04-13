import { DataTypes, Model, type Sequelize } from "sequelize";

export type PlayerTaskStatus = "pending" | "completed" | "claimed";

export interface PlayerTaskAttributes {
    id: string;
    playerId: string;
    templateId: string;
    status: PlayerTaskStatus;
    progress: Record<string, unknown> | null;
    completedAt: Date | null;
    claimedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PlayerTaskCreationAttributes {
    playerId: string;
    templateId: string;
    status?: PlayerTaskStatus;
    progress?: Record<string, unknown> | null;
}

export class PlayerTask
    extends Model<PlayerTaskAttributes, PlayerTaskCreationAttributes>
    implements PlayerTaskAttributes
{
    declare id: string;
    declare playerId: string;
    declare templateId: string;
    declare status: PlayerTaskStatus;
    declare progress: Record<string, unknown> | null;
    declare completedAt: Date | null;
    declare claimedAt: Date | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initPlayerTask(sequelize: Sequelize): typeof PlayerTask {
    PlayerTask.init(
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
            templateId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: "task_templates", key: "id" },
            },
            status: {
                type: DataTypes.ENUM("pending", "completed", "claimed"),
                allowNull: false,
                defaultValue: "pending",
            },
            progress: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
            },
            completedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
            claimedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            tableName: "player_tasks",
            timestamps: true,
            indexes: [
                { fields: ["playerId"] },
                { fields: ["playerId", "templateId"] },
            ],
        },
    );
    return PlayerTask;
}
