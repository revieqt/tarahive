import "reflect-metadata";
import { DataSource } from "typeorm";
import { Log } from "../modules/v1/audit/audit.entity";
import { User } from "../modules/v1/user/user.entity";
import { Itinerary } from "../modules/v1/itinerary/itinerary.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "postgres",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "tarahive_postgres",

  // ❗ DO NOT use synchronize in production
  synchronize: true,

  logging: false,

  entities: [User, Log, Itinerary],

  // ✅ Enable connection pooling properly
  extra: {
    max: 10, // max connections in pool
  },
});

export const connectPostgres = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Connected to PostgreSQL");
    }
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err);
    process.exit(1);
  }
};