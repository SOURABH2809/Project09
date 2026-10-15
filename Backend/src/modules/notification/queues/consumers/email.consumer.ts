import { ConsumeMessage } from "amqplib";
import { getRabbitChannel } from "../../config/rabbitmq.js";
import { sendEmail } from "../../services/email.service.js";
import { QUEUE } from "../../../../shared/constants/app.constant.js";

export const startEmailConsumer = async () => {
  const channel = getRabbitChannel();

  // Ensure queue exists
  await channel.assertQueue(QUEUE, { durable: true });

  console.log("[Consumer]: Listening on email_queue...");

  channel.consume(
    QUEUE,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());

        console.log("[Consumer]: Processing email:", data);

        if (Array.isArray(data.to)) {
          for (const recipient of data.to) {
            await sendEmail({
              to: recipient,
              subject: data.subject,
              data: data.data,
              templateType: data.templateType,
            });
          }
        } else {
          await sendEmail({
            to: data.to,
            subject: data.subject,
            data: data.data,
            templateType: data.templateType,
          });
        }

        channel.ack(msg);
        console.log("[Consumer]: Email sent successfully");
      } catch (err) {
        console.error("[Consumer]: Error processing email:", err);

        // Requeue or send to DLQ later
        channel.nack(msg, false, false);
      }
    },
    { noAck: false },
  );
};
