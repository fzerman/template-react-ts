import { DataTypes, Model, type Sequelize } from "sequelize";

export interface ProductAttributes {
    id: string;
    name: string;
    description: string;
    priceAmount: number;
    priceCurrency: string;
    coinAmount: number;
    active: boolean;
    meta: Record<string, unknown> | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProductCreationAttributes {
    name: string;
    description?: string;
    priceAmount: number;
    priceCurrency?: string;
    coinAmount: number;
    active?: boolean;
    meta?: Record<string, unknown> | null;
}

export class Product
    extends Model<ProductAttributes, ProductCreationAttributes>
    implements ProductAttributes
{
    declare id: string;
    declare name: string;
    declare description: string;
    declare priceAmount: number;
    declare priceCurrency: string;
    declare coinAmount: number;
    declare active: boolean;
    declare meta: Record<string, unknown> | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export function initProduct(sequelize: Sequelize): typeof Product {
    Product.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: "",
            },
            priceAmount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: "Price in smallest currency unit (e.g. cents)",
            },
            priceCurrency: {
                type: DataTypes.STRING(3),
                allowNull: false,
                defaultValue: "USD",
            },
            coinAmount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: "Coins awarded on purchase",
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            meta: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
            },
        },
        {
            sequelize,
            tableName: "products",
            timestamps: true,
        },
    );
    return Product;
}
