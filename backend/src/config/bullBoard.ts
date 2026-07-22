import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { emailDeliveryQueue } from "../workers/delivery/email.queue";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailDeliveryQueue),
  ],
  serverAdapter,
});

export { serverAdapter };