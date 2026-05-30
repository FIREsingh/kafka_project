import { getConsumer, type GetConsumerOptions } from "../../config/kafka.ts";
import {
  USER_EVENTS_TOPIC,
  type UserEventName,
  type UserEventPayload,
} from "./user.event.ts";

type UserEventMessage = UserEventPayload & {
  event: UserEventName;
};

export type UserConsumerOptions = {
  consumer?: GetConsumerOptions;
  fromBeginning?: boolean;
  partitionsConsumedConcurrently?: number;
};

export const startUserEventsConsumer = async (
  options: UserConsumerOptions = {},
): Promise<void> => {
  const {
    consumer: consumerOptions = {
      groupId:
        process.env.USER_EVENTS_CONSUMER_GROUP_ID ?? "user-events-consumer",
    },
    fromBeginning = process.env.KAFKA_CONSUMER_FROM_BEGINNING === "true",
    partitionsConsumedConcurrently = Number(
      process.env.KAFKA_PARTITIONS_CONCURRENT ?? "1",
    ),
  } = options;

  const consumer = await getConsumer(consumerOptions);

  await consumer.subscribe({ topic: USER_EVENTS_TOPIC, fromBeginning });

  await consumer.run({
    autoCommit: false,
    partitionsConsumedConcurrently,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      try {
        const parsed = JSON.parse(message.value.toString()) as UserEventMessage;
        console.log(`Consumed`, JSON.stringify(parsed), "partition", partition);

        const nextOffset = (BigInt(message.offset) + 1n).toString();
        await consumer.commitOffsets([
          { topic, partition, offset: nextOffset },
        ]);
      } catch (error) {
        console.error("[kafka:consume] Failed to process message", error);
      }
    },
  });
};
