import { AppDataSource } from "../src/config/postgres";

async function runMigrations() {
  try {
    console.log("🔌 Initializing database connection...");

    await AppDataSource.initialize();

    console.log("🚀 Running migrations...");

    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log("✅ No new migrations to run");
    } else {
      console.log(`✅ ${migrations.length} migration(s) executed:`);
      migrations.forEach((m) => console.log(`   - ${m.name}`));
    }

    await AppDataSource.destroy();

    console.log("🎉 Migration process completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();