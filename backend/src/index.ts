import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from "path";
import { createServer } from 'http';
import { ipMiddleware } from './middleware/ipMiddleware';
import { connectPostgres } from './config/postgres';
// import { connectMongoDB } from './config/mongodb';
import { serverAdapter } from "./config/bullBoard";
import { initializeFirebase } from './config/firebase';
import v1Router from './modules/v1/v1.routes';
import { initializeEmailDeliveryWorker } from './workers/delivery/email.worker';
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(ipMiddleware);
app.use('/public', express.static(path.join(__dirname, "../public")));
app.use('/uploads', express.static(path.join(__dirname, "../uploads")));
app.use("/queues", serverAdapter.getRouter());
app.use('/v1', v1Router);
app.set("trust proxy", 1);

async function bootstrap() {
  try {
    // await connectMongoDB();
    await connectPostgres();
    initializeFirebase();
    app.listen(PORT, () => {
      console.log(`Bootstrap Completed!`);
    });
  } catch (error) {
    console.error("Bootstrap failed:", error);
    process.exit(1);
  }
}

bootstrap();

app.get('/health', (_req, res) => {
  res.send('Tarahive Backend is Running');
});

(async () => {
  await initializeEmailDeliveryWorker();
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO listening on port ${PORT}`);
  });
})();

