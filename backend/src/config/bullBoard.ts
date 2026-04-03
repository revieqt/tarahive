import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { sosQueue } from "../modules/safety/sos.queue";
import { logsExportQueue } from "../modules/shared/account/logs-export.queue";

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(sosQueue),
    new BullMQAdapter(logsExportQueue),
  ],
  serverAdapter,
});

export { serverAdapter };