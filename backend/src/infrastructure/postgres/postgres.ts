import "reflect-metadata";
import { DataSource } from "typeorm";

// import { Log } from "../modules/v1/audit/audit.entity";
// import { User } from "../modules/v2/user/user.entity";
// import { Auth } from "../modules/v2/auth/auth.entity";
// import { Itinerary } from "../modules/v1/itinerary/itinerary.entity";
// import { ItineraryCollaborator } from "../modules/v1/itinerary/itinerary-collaborator.entity";

import { Log } from "../../modules/v2/audit/audit.entity";
import { User } from "../../modules/v2/user/user.entity";
import { Auth } from "../../modules/v2/auth/auth.entity";
import { Itinerary } from "../../modules/v2/itinerary/itinerary.entity";
import { ItineraryCollaborator } from "../../modules/v2/itinerary/itinerary-collaborator.entity";
import { AiConversation } from "../../modules/v2/ai/ai-conversations.entity";
import { AiMessage } from "../../modules/v2/ai/ai-messages.entity";
import { Room } from "../../modules/v2/room/room.entity";
import { RoomMember } from "../../modules/v2/room/room-member.entity";
import { Wallet } from "../../modules/v2/expenses/wallet.entity";
import { Expense } from "../../modules/v2/expenses/expenses.entity";
import { SharedExpense } from "../../modules/v2/expenses/shared-expense.entity";
import { RefreshToken } from "../../modules/v2/auth/refresh-token.entity";

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
  entities: [
    User,
    Auth,
    Log,
    Itinerary,
    ItineraryCollaborator,
    AiConversation,
    AiMessage,
    Room,
    RoomMember,
    Wallet,
    Expense,
    SharedExpense,
    RefreshToken,
  ],
  
});

export const connectPostgres = async () => {
  const maxAttempts = 20;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log("✅ Connected to PostgreSQL");
        return;
      }

      return;
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error("❌ PostgreSQL connection error:", err);
        throw err;
      }

      console.warn(`PostgreSQL not ready yet (attempt ${attempt}/${maxAttempts}). Retrying in 2s...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

export const userRepo = AppDataSource.getRepository(User);