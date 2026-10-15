import { getRabbitChannel } from "../../config/rabbitmq.conf.js";
import { IN_APP_NOTIFICATIONS_QUEUE } from "../../constants/app.constant.js";
import { InAppNotificationPayload } from "../../types/in-app-notification.js";

export const publishInAppNotification = async (payload: InAppNotificationPayload) => {
  const channel = getRabbitChannel();

  // Ensure queue exists
  await channel.assertQueue(IN_APP_NOTIFICATIONS_QUEUE, { durable: true });

  const message = Buffer.from(JSON.stringify(payload));

  const isPublished = channel.sendToQueue(IN_APP_NOTIFICATIONS_QUEUE, message, {
    persistent: true,
  });

  if (!isPublished) {
    throw new Error("Failed to publish in-app notification message");
  }

  console.log(
    "[Producer] In-app notification queued:",
    payload.userIds,
    "message:",
    payload.message,
  );
};
