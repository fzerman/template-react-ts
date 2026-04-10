import path from "node:path";

const componentsDir = path.join(__dirname, "components");

// Initialized lazily via initComponentLoader() since adminjs is ESM-only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let componentLoader: any = null;

/** Initialize the AdminJS ComponentLoader. Must be called before registerComponents(). */
export async function initComponentLoader(): Promise<any> {
    const { ComponentLoader } = await import("adminjs");
    componentLoader = new ComponentLoader();
    return componentLoader;
}

/** Resolve a component file path relative to the components/ directory. */
function componentPath(fileName: string): string {
    return path.join(componentsDir, fileName);
}

/**
 * Registry of custom AdminJS components.
 *
 * To add a new component:
 *   1. Create a `.tsx` file in `server/src/admin/components/`
 *      (it must export a default React component)
 *   2. Add a `componentLoader.add("Name", componentPath("FileName"))` call
 *      inside `registerComponents()` below
 *   3. Reference `Components.Name` in resource options or AdminJS pages
 *
 * To override a built-in AdminJS component (e.g. Dashboard, Login, Sidebar):
 *   Use `componentLoader.override("BuiltInName", componentPath("FileName"))`
 *
 * Overridable built-in components include:
 *   Dashboard, Login, Sidebar, SidebarBranding, SidebarFooter, TopBar,
 *   LoggedIn, NoRecords, Version, and all Default*Property components.
 */

/** Map of registered component names → their AdminJS identifiers. */
export const Components: Record<string, string> = {};

/**
 * Register all custom components with the ComponentLoader.
 * Called once during admin setup, before AdminJS.initialize().
 *
 * Example usage:
 *   Components.Dashboard = componentLoader.override("Dashboard", componentPath("Dashboard"));
 *   Components.PlayerStatus = componentLoader.add("PlayerStatus", componentPath("PlayerStatus"));
 */
export function registerComponents(): void {
    if (!componentLoader) {
        throw new Error("Call initComponentLoader() before registerComponents()");
    }
    // Add component registrations here.
}
