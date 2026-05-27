import app from "./app.ts";
import { disconnectProducer } from "./config/kafka.ts";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = async () => {
  server.close();
  await disconnectProducer();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
