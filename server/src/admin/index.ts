import type { Express } from "express";
import { sequelize, Player } from "../db/models/index.js";
import { env } from "../config/env.js";
import { initComponentLoader, registerComponents } from "./components.js";

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
        ],
        rootPath: "/admin",
        componentLoader,
        branding: {
            companyName: "Mafia Game Admin",
            withMadeWithLove: false,
        },
    });

    await admin.initialize();

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
        { resave: false, saveUninitialized: false },
    );
    app.use(admin.options.rootPath, adminRouter);

    console.log(`[admin] AdminJS running at ${admin.options.rootPath}`);
}
