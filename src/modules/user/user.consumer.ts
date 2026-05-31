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

const parseUserEvent = (value: Buffer): UserEventMessage | null => {
  try {
    return JSON.parse(value.toString()) as UserEventMessage;
  } catch {
    return null;
  }
};

export const startUserEventsConsumer = async (
  options: UserConsumerOptions = {},
): Promise<void> => {
  const {
    consumer: consumerOptions = {
      groupId:
        process.env.USER_EVENTS_CONSUMER_GROUP_ID ?? "user-events-consumer",
      config: {
        minBytes: Number(process.env.KAFKA_CONSUMER_MIN_BYTES ?? "1"),
        maxBytesPerPartition: Number(
          process.env.KAFKA_CONSUMER_MAX_BYTES ?? "1048576",
        ),
        maxWaitTimeInMs: Number(
          process.env.KAFKA_CONSUMER_MAX_WAIT_MS ?? "5000",
        ),
      },
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
    eachBatchAutoResolve: false,
    eachBatch: async ({
      batch,
      resolveOffset,
      heartbeat,
      isRunning,
      isStale,
    }) => {
      let lastResolvedOffset: string | null = null;

      for (const message of batch.messages) {
        if (!isRunning() || isStale()) break;

        if (!message.value) {
          resolveOffset(message.offset);
          lastResolvedOffset = message.offset;
          continue;
        }

        try {
          const parsed = parseUserEvent(message.value);

          if (!parsed) {
            console.error(
              "[kafka:consume] Invalid message at offset",
              message.offset,
            );
            resolveOffset(message.offset);
            lastResolvedOffset = message.offset;
            continue;
          }

          console.log(
            "Consumed batch",
            JSON.stringify(parsed),
            "partition",
            batch.partition,
            "offset",
            message.offset,
          );

          resolveOffset(message.offset);
          lastResolvedOffset = message.offset;
          await heartbeat();
        } catch (error) {
          console.error("[kafka:consume] Failed to process message", error);
          break;
        }
      }

      if (lastResolvedOffset === null) return;

      const nextOffset = (BigInt(lastResolvedOffset) + 1n).toString();
      await consumer.commitOffsets([
        { topic: batch.topic, partition: batch.partition, offset: nextOffset },
      ]);
    },
  });
};
