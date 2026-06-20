import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/queues");

createBullBoard({
  queues: [
  ],
  serverAdapter,
});

export { serverAdapter };