"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../src/config/postgres");
async function runMigrations() {
    try {
        console.log("🔌 Initializing database connection...");
        await postgres_1.AppDataSource.initialize();
        console.log("🚀 Running migrations...");
        const migrations = await postgres_1.AppDataSource.runMigrations();
        if (migrations.length === 0) {
            console.log("✅ No new migrations to run");
        }
        else {
            console.log(`✅ ${migrations.length} migration(s) executed:`);
            migrations.forEach((m) => console.log(`   - ${m.name}`));
        }
        await postgres_1.AppDataSource.destroy();
        console.log("🎉 Migration process completed");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}
runMigrations();
