import { getRabbitChannel } from "../../config/rabbitmq.conf.js";
import { QUEUE } from "../../constants/app.constant.js";
import { EmailPayload } from "../../types/email.js";

export const publishEmail = async (payload: EmailPayload) => {
  const channel = getRabbitChannel();

  // Ensure queue exists
  await channel.assertQueue(QUEUE, { durable: true });

  const message = Buffer.from(JSON.stringify(payload));

  const isPublished = channel.sendToQueue(QUEUE, message, {
    persistent: true,
  });

  if (!isPublished) {
    throw new Error("Failed to publish email message");
  }

  console.log("[Producer] Email queued:", payload.to);
};
