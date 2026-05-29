import { getProducer } from "../../config/kafka.ts";
import type { UserPublic } from "./user.type.ts";

export const USER_EVENTS = {
  CREATED: "user.created",
  UPDATED: "user.updated",
  DELETED: "user.deleted",
} as const;

export type UserEventName = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];

export type UserEventPayload = {
  user: UserPublic;
  timestamp: string;
};

export const USER_EVENTS_TOPIC = "user-events";

export const publishUserEvent = async (
  event: UserEventName,
  payload: UserEventPayload,
): Promise<void> => {
  const producer = await getProducer();

  await producer.send({
    topic: USER_EVENTS_TOPIC,
    messages: [
      {
        key: payload.user.id,
        value: JSON.stringify({ event, ...payload }),
      },
    ],
  });
};
