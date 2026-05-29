import { Kafka, type Consumer, type Producer } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "kafka-app",
  brokers,
});

let producer: Producer | null = null;
let consumer: Consumer | null = null;

export const getProducer = async (): Promise<Producer> => {
  if (!producer) {
    producer = kafka.producer();
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

export const getConsumer = async (): Promise<Consumer> => {
  if (!consumer) {
    consumer = kafka.consumer({
      groupId: process.env.KAFKA_CONSUMER_GROUP_ID ?? "kafka-app-consumer",
    });
    await consumer.connect();
  }
  return consumer;
};

export const disconnectConsumer = async (): Promise<void> => {
  if (consumer) {
    await consumer.disconnect();
    consumer = null;
  }
};

export { kafka };
