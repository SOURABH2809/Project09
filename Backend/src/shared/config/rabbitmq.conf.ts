import amqplib, { Channel, ChannelModel } from "amqplib";

let connection: ChannelModel;
let channel: Channel;

const RABBIT_URL = process.env.RABBITMQ_URL;

if(!RABBIT_URL) {
  throw new Error("RABBIT_URL configuration not found.");
}

export const connectRabbitMQ = async () => {
  try {
    connection = await amqplib.connect(RABBIT_URL);
    channel = await connection.createChannel();

    console.log("[RabbitMQ] Connected and channel created");

    return { connection, channel };
  } catch (err) {
    console.error("[RabbitMQ] Connection error:", err);
    throw err;
  }
};

export const getRabbitChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized. Call connectRabbitMQ first.");
  }
  return channel;
};
