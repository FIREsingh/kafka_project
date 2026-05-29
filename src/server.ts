import app from "./app.ts";
import {
  disconnectConsumer,
  disconnectProducer,
} from "./config/kafka.ts";
import { startUserEventsConsumer } from "./modules/user/user.consumer.ts";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Fire-and-forget startup of the user events consumer.
  void startUserEventsConsumer().catch((error) => {
    console.error("[kafka:consumer] Failed to start", error);
  });
});

const shutdown = async () => {
  server.close();
  await Promise.allSettled([disconnectProducer(), disconnectConsumer()]);
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
