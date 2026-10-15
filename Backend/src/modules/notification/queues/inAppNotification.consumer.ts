import { ConsumeMessage } from "amqplib";
import { IN_APP_NOTIFICATIONS_QUEUE } from "../../../shared/constants/app.constant.js";
import { getRabbitChannel } from "../config/rabbitmq.js";
import prisma from "../config/prisma.client.js";

export const startInAppNotificationConsumer = async () => {
  const channel = await getRabbitChannel();
  await channel.assertQueue(IN_APP_NOTIFICATIONS_QUEUE, { durable: true });

  console.log("[InAppNotificationConsumer]: Listening on in-app-notifications queue...");

  channel.consume(
    IN_APP_NOTIFICATIONS_QUEUE,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      // Prepare notification data for each user and save to DB
      const notificationData = JSON.parse(msg.content.toString());
      const notifications = notificationData.userIds
        .filter((userId: string) => !!userId)
        .map((userId: string) => ({
          userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || "info",
          link: notificationData.link || null,
          read: notificationData.isRead || false,
          createdAt: new Date(),
        }));

      if (notifications.length < 1) {
        console.warn("[InAppNotificationConsumer]: No notification to save");
        channel.ack(msg);
        return;
      }

      try {
        await prisma.inAppNotification.createMany({
          data: notifications,
        });

        console.log(
          "[InAppNotificationConsumer]: Notifications saved to DB for users:",
          notificationData.userIds,
        );
        channel.ack(msg); // Acknowledge message after successful processing
      } catch (error) {
        console.error("[InAppNotificationConsumer]: Error saving notifications to DB:", error);
        channel.nack(msg, false, true); // Reject message and requeue for retry
      }
    },
    { noAck: false },
  );
};
