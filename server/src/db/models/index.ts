import { Sequelize } from "sequelize";
import { initPlayer, Player } from "./Player.js";

const sequelize = new Sequelize(
    process.env.DB_NAME || "mafia_game",
    process.env.DB_USER || "wmdeveloper",
    process.env.DB_PASSWORD || "",
    {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: false,
    },
);

initPlayer(sequelize);

export { sequelize, Player };

