import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path";
import { createServer } from 'http';
import { ipMiddleware } from './middleware/ipMiddleware';
import { connectPostgres } from './config/postgres';
import { connectMongoDB } from './config/mongodb';
import { serverAdapter } from "./config/bullBoard";
import v1Router from './modules/v1/v1.routes';
// import { initializeV1Workers } from './modules/v1/v1.workers';
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(ipMiddleware);
app.use('/public', express.static(path.join(__dirname, "../public")));
app.use('/uploads', express.static(path.join(__dirname, "../uploads")));
app.use("/admin/queues", serverAdapter.getRouter());
app.use('/v1', v1Router);
app.set("trust proxy", 1);

async function bootstrap() {
  try {
    await connectMongoDB();
    await connectPostgres();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

bootstrap();

app.get('/health', (_req, res) => {
  res.send('Tarahive Backend is Running');
});

(async () => {
  // await initializeV1Workers();
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO listening on port ${PORT}`);
  });
})();

