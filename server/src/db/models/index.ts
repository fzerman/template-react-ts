import { Sequelize } from "sequelize";
import { initPlayer, Player } from "./Player.js";
import { initBalance, Balance } from "./Balance.js";
import { initTransaction, Transaction } from "./Transaction.js";
import { initProduct, Product } from "./Product.js";
import { initPaymentTransaction, PaymentTransaction } from "./PaymentTransaction.js";
import { initTaskTemplate, TaskTemplate } from "./TaskTemplate.js";
import { initPlayerTask, PlayerTask } from "./PlayerTask.js";

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
initBalance(sequelize);
initTransaction(sequelize);
initProduct(sequelize);
initPaymentTransaction(sequelize);
initTaskTemplate(sequelize);
initPlayerTask(sequelize);

// Associations
Player.hasOne(Balance, { foreignKey: "playerId", as: "balance" });
Balance.belongsTo(Player, { foreignKey: "playerId" });

Player.hasMany(Transaction, { foreignKey: "playerId", as: "transactions" });
Transaction.belongsTo(Player, { foreignKey: "playerId" });

Player.hasMany(PaymentTransaction, { foreignKey: "playerId", as: "payments" });
PaymentTransaction.belongsTo(Player, { foreignKey: "playerId" });

Product.hasMany(PaymentTransaction, { foreignKey: "productId", as: "payments" });
PaymentTransaction.belongsTo(Product, { foreignKey: "productId" });

Player.hasMany(PlayerTask, { foreignKey: "playerId", as: "tasks" });
PlayerTask.belongsTo(Player, { foreignKey: "playerId" });

TaskTemplate.hasMany(PlayerTask, { foreignKey: "templateId", as: "playerTasks" });
PlayerTask.belongsTo(TaskTemplate, { foreignKey: "templateId", as: "template" });

export { sequelize, Player, Balance, Transaction, Product, PaymentTransaction, TaskTemplate, PlayerTask };

