"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const postgres_1 = require("../src/config/postgres");
const clearDatabase = async () => {
    try {
        console.log("⚠️ Initializing database connection...");
        await postgres_1.AppDataSource.initialize();
        const queryRunner = postgres_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        console.log("🧹 Clearing database...");
        // Get all table names
        const tables = await queryRunner.getTables();
        // Disable foreign key checks (important for Postgres)
        await queryRunner.query(`SET session_replication_role = 'replica';`);
        for (const table of tables) {
            const tableName = `"${table.name}"`;
            console.log(`Deleting data from ${tableName}`);
            await queryRunner.query(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
        }
        // Re-enable foreign key checks
        await queryRunner.query(`SET session_replication_role = 'origin';`);
        await queryRunner.release();
        console.log("✅ Database cleared successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error clearing database:", error);
        process.exit(1);
    }
};
clearDatabase();
