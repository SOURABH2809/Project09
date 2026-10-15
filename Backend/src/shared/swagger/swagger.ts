import {
  authSwagger,
  permissionSwagger,
  roleSwagger,
  userGroupSwagger,
  userSwagger,
} from "../../modules/auth/swagger/index.js";
import { inAppNotificationSwagger } from "../../modules/notification/swagger/index.js";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "VoiPed API",
    version: "1.7.0",
    description: "API documentation",
  },
  servers: [
    {
      url: process.env.BASE_URL || "http://localhost:5001",
      description: "Voiped API",
    },
  ],

  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  security: [
    {
      BearerAuth: [],
    },
  ],

  paths: {
    // Auth Module Swagger Paths
    ...authSwagger,
    ...roleSwagger,
    ...userSwagger,
    ...permissionSwagger,
    ...userGroupSwagger,

    // Notification Module Swagger Paths
    ...inAppNotificationSwagger,

  },
};
