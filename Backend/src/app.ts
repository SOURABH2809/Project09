import express from "express";
import preMiddlewares from "./preMiddlewares.js";
import apiV1Routes from "./routes.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";
import { endpointNotFound } from "./shared/middlewares/endpointNotFound.js";
import securityMiddlewares from "./securityMiddlewares.js";

const app = express();

// Remove server banner
app.disable("x-powered-by");

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Security Middlewares
app.use(securityMiddlewares);

// Pre-Route Middleware
app.use(preMiddlewares);

// Route
app.use("/api/v1", apiV1Routes);

// Post-Route Middleware
app.use(errorHandler);

// Default deny for unknown API routes
app.use(endpointNotFound);

export default app;
