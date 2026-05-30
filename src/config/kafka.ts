import {
  Kafka,
  type Consumer,
  type ConsumerConfig,
  type Producer,
} from "kafkajs";

const defaultBrokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");
const defaultClientId = process.env.KAFKA_CLIENT_ID ?? "kafka-app";
const defaultGroupId =
  process.env.KAFKA_CONSUMER_GROUP_ID ?? "kafka-app-consumer";

const kafkaClients = new Map<string, Kafka>();
const consumers = new Map<string, Consumer>();

let producer: Producer | null = null;

const getKafka = (brokers: string[], clientId: string): Kafka => {
  const key = `${clientId}:${brokers.join(",")}`;
  let client = kafkaClients.get(key);

  if (!client) {
    client = new Kafka({ clientId, brokers });
    kafkaClients.set(key, client);
  }

  return client;
};

export type GetConsumerOptions = {
  brokers?: string[];
  clientId?: string;
  groupId?: string;
  config?: Omit<ConsumerConfig, "groupId">;
};

export const getConsumer = async (
  options: GetConsumerOptions = {},
): Promise<Consumer> => {
  const brokers = options.brokers ?? defaultBrokers;
  const clientId = options.clientId ?? defaultClientId;
  const groupId = options.groupId ?? defaultGroupId;
  const cacheKey = `${clientId}:${groupId}:${brokers.join(",")}`;

  let consumer = consumers.get(cacheKey);

  if (!consumer) {
    const kafka = getKafka(brokers, clientId);
    consumer = kafka.consumer({ groupId, ...options.config });
    await consumer.connect();
    consumers.set(cacheKey, consumer);
  }

  return consumer;
};

export const getProducer = async (): Promise<Producer> => {
  if (!producer) {
    producer = getKafka(defaultBrokers, defaultClientId).producer();
    await producer.connect();
  }
  return producer;
};

export const disconnectProducer = async (): Promise<void> => {
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
};

export const disconnectConsumer = async (): Promise<void> => {
  await Promise.all([...consumers.values()].map((consumer) => consumer.disconnect()));
  consumers.clear();
};
