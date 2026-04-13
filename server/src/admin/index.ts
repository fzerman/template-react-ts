import type { Express } from "express";
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";
import { sequelize, Player, Balance, Transaction, Product, PaymentTransaction, TaskTemplate, PlayerTask } from "../db/models/index.js";
import { env } from "../config/env.js";
import { initComponentLoader, registerComponents } from "./components.js";

const SequelizeStore = connectSessionSequelize(session.Store);

export async function setupAdmin(app: Express): Promise<void> {
    const AdminJS = (await import("adminjs")).default;
    const AdminJSExpress = await import("@adminjs/express");
    const AdminJSSequelize = (await import("@adminjs/sequelize")).default;

    AdminJS.registerAdapter(AdminJSSequelize);

    const componentLoader = await initComponentLoader();
    registerComponents();

    const admin = new AdminJS({
        databases: [sequelize],
        resources: [
            {
                resource: Player,
                options: {
                    navigation: { name: "Game", icon: "User" },
                    listProperties: ["id", "vendorId", "username", "createdAt"],
                    editProperties: ["vendorId", "username"],
                    showProperties: ["id", "vendorId", "username", "createdAt", "updatedAt"],
                },
            },
            {
                resource: Balance,
                options: {
                    navigation: { name: "Economy", icon: "DollarSign" },
                    listProperties: ["id", "playerId", "coins", "bills", "updatedAt"],
                    editProperties: ["coins", "bills"],
                    showProperties: ["id", "playerId", "coins", "bills", "createdAt", "updatedAt"],
                },
            },
            {
                resource: Transaction,
                options: {
                    navigation: { name: "Economy", icon: "DollarSign" },
                    listProperties: ["id", "playerId", "type", "currency", "amount", "fee", "createdAt"],
                    showProperties: ["id", "playerId", "type", "currency", "amount", "fee", "balanceBefore", "balanceAfter", "meta", "createdAt"],
                    actions: { edit: { isAccessible: false }, delete: { isAccessible: false }, new: { isAccessible: false } },
                },
            },
            {
                resource: Product,
                options: {
                    navigation: { name: "Shop", icon: "ShoppingCart" },
                    listProperties: ["id", "name", "priceAmount", "priceCurrency", "coinAmount", "active", "updatedAt"],
                    editProperties: ["name", "description", "priceAmount", "priceCurrency", "coinAmount", "active", "meta"],
                    showProperties: ["id", "name", "description", "priceAmount", "priceCurrency", "coinAmount", "active", "meta", "createdAt", "updatedAt"],
                },
            },
            {
                resource: PaymentTransaction,
                options: {
                    navigation: { name: "Shop", icon: "ShoppingCart" },
                    listProperties: ["id", "playerId", "productId", "amount", "currency", "status", "createdAt"],
                    showProperties: ["id", "playerId", "productId", "providerRef", "amount", "currency", "status", "providerData", "completedAt", "createdAt", "updatedAt"],
                    actions: { edit: { isAccessible: false }, delete: { isAccessible: false }, new: { isAccessible: false } },
                },
            },
            {
                resource: TaskTemplate,
                options: {
                    navigation: { name: "Tasks", icon: "Activity" },
                    listProperties: ["id", "name", "rewards", "requirements", "cooldownMinutes", "active", "updatedAt"],
                    editProperties: ["name", "description", "rewards", "requirements", "cooldownMinutes", "active"],
                    showProperties: ["id", "name", "description", "rewards", "requirements", "cooldownMinutes", "active", "createdAt", "updatedAt"],
                },
            },
            {
                resource: PlayerTask,
                options: {
                    navigation: { name: "Tasks", icon: "Activity" },
                    listProperties: ["id", "playerId", "templateId", "status", "createdAt", "completedAt", "claimedAt"],
                    showProperties: ["id", "playerId", "templateId", "status", "progress", "createdAt", "completedAt", "claimedAt", "updatedAt"],
                    actions: { edit: { isAccessible: false }, new: { isAccessible: false } },
                },
            },
        ],
        rootPath: "/admin",
        componentLoader,
        branding: {
            companyName: "Mafia Game Admin",
            withMadeWithLove: false,
        },
    });

    await admin.initialize();

    const sessionStore = new SequelizeStore({ db: sequelize });
    await sessionStore.sync();

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate: async (email, password) => {
                if (email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD) {
                    return { email };
                }
                return null;
            },
            cookiePassword: env.ADMIN_COOKIE_SECRET,
        },
        null,
        {
            store: sessionStore,
            resave: false,
            saveUninitialized: false,
            secret: env.ADMIN_COOKIE_SECRET,
            cookie: {
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                httpOnly: true,
                secure: env.NODE_ENV === "production",
            },
        },
    );
    app.use(admin.options.rootPath, adminRouter);

    console.log(`[admin] AdminJS running at ${admin.options.rootPath}`);
}
