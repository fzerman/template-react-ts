import { DataTypes, Model, type Sequelize } from "sequelize";

export interface TaskRewards {
    coins?: number;
    bills?: number;
    repetition?: number;
}

export interface TaskRequirements {
    minLevel?: number;
    minCoins?: number;
    minBills?: number;
    minRepetition?: number;
}

export interface TaskTemplateAttributes {
    id: string;
    name: string;
    description: string;
    rewards: TaskRewards;
    requirements: TaskRequirements;
    cooldownMinutes: number;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface TaskTemplateCreationAttributes {
    name: string;
    description: string;
    rewards: TaskRewards;
    requirements?: TaskRequirements;
    cooldownMinutes?: number;
    active?: boolean;
}

export class TaskTemplate
    extends Model<TaskTemplateAttributes, TaskTemplateCreationAttributes>
    implements TaskTemplateAttributes
{
    declare id: string;
    declare name: string;
    declare description: string;
    declare rewards: TaskRewards;
    declare requirements: TaskRequirements;
    declare cooldownMinutes: number;
    declare active: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initTaskTemplate(sequelize: Sequelize): typeof TaskTemplate {
    TaskTemplate.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: "",
            },
            rewards: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
            },
            requirements: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: {},
            },
            cooldownMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            tableName: "task_templates",
            timestamps: true,
        },
    );
    return TaskTemplate;
}
