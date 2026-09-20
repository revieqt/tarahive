import "reflect-metadata";
import { DataSource } from "typeorm";

// import { Log } from "../modules/v1/audit/audit.entity";
// import { User } from "../modules/v2/user/user.entity";
// import { Auth } from "../modules/v2/auth/auth.entity";
// import { Itinerary } from "../modules/v1/itinerary/itinerary.entity";
// import { ItineraryCollaborator } from "../modules/v1/itinerary/itinerary-collaborator.entity";

import { Log } from "../modules/v2/audit/audit.entity";
import { User } from "../modules/v2/user/user.entity";
import { Auth } from "../modules/v2/auth/auth.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "postgres",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "tarahive_postgres",
  synchronize: true, // ❗ DO NOT use synchronize in production
  logging: false,
  extra: { max: 10 },
  
  // entities: [User, Log, Itinerary, ItineraryCollaborator],
  entities: [User, Auth, Log ],
  
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

export const userRepo = AppDataSource.getRepository(User);