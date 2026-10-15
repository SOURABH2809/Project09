import dotenv from "dotenv";
import app from "./app.js";
import { initNotificationModule } from "./modules/notification/index.js";
import { connectRabbitMQ } from "./shared/config/rabbitmq.conf.js";


dotenv.config();

const PORT = Number(process.env.PORT) || 5001;
const BASE_URL = process.env.BASE_URL || "http://localhost:5001";

// Connections
await connectRabbitMQ();
await initNotificationModule();



app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on Port ${PORT}`);
  console.log(`Server is running on ${BASE_URL}`);
  console.log(`Swagger available at ${BASE_URL}/api/v1/api-docs`);
});
