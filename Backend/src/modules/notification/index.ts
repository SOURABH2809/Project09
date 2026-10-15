import { startEmailConsumer } from "./queues/consumers/email.consumer.js";
import { startInAppNotificationConsumer } from "./queues/inAppNotification.consumer.js";
export * from "./routes/index.js";

export const initNotificationModule = async () => {
  try {
    // Start Consumer
    await startEmailConsumer();
    console.log("[Consumer]: Email Consumer started");

    await startInAppNotificationConsumer();
    console.log("[Consumer]: In-App Notification Consumer started");
  } catch (err) {
    console.error("[Error]: Failed to start Notification Module", err);
    throw err;
  }
};
