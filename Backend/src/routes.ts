import {
  authRoutes,
  groupRoutes,
  permissionRoutes,
  rolesRoutes,
  userRoutes,
  impersonateRoutes,
} from "./modules/auth/index.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./shared/swagger/swagger.js";
import express from "express";
import { inAppNotificationRoutes } from "./modules/notification/index.js";
import { validateAuthentication } from "./shared/middlewares/validateAuthentication.js";

const router = express.Router();

// - Auth Module Routes
router.use("/auth", authRoutes);
router.use("/auth/impersonate", validateAuthentication, impersonateRoutes);
router.use("/users", validateAuthentication, userRoutes);
router.use("/roles", validateAuthentication, rolesRoutes);
router.use("/groups", validateAuthentication, groupRoutes);
router.use("/permissions", validateAuthentication, permissionRoutes);
// - Customer Module Routes
// Customer related routes
// - Notification Module Routes
router.use(
  "/notifications/in-app",
  validateAuthentication,
  inAppNotificationRoutes,
);

// - Master Data Module Routes
// Swagger Routes
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default router;
