import { getConsumer } from "../../config/kafka.ts";
import {
  USER_EVENTS_TOPIC,
  type UserEventName,
  type UserEventPayload,
} from "./user.event.ts";

type UserEventMessage = UserEventPayload & {
  event: UserEventName;
};

export const startUserEventsConsumer = async (): Promise<void> => {
  const consumer = await getConsumer();

  await consumer.subscribe({ topic: USER_EVENTS_TOPIC, fromBeginning: false });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      try {
        const parsed = JSON.parse(message.value.toString()) as UserEventMessage;
        console.log(`[kafka:consume] ${parsed.event}`, JSON.stringify(parsed));

        const nextOffset = (BigInt(message.offset) + 1n).toString();
        await consumer.commitOffsets([
          { topic, partition, offset: nextOffset },
        ]);
        console.log("nextOffset", nextOffset);
        console.log("partition", partition);
        console.log("topic", topic);
      } catch (error) {
        console.error("[kafka:consume] Failed to process message", error);
      }
    },
  });
};
