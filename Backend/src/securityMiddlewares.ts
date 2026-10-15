import express from "express";
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import { headerCountLimit } from "./shared/middlewares/headerCountLimit.js";
import { headerSizeLimit } from "./shared/middlewares/headerSizeLimit.js";
import { hardBlockHTML } from "./shared/middlewares/hardblockHtml.js";

const router = express.Router();

// Security headers
router.use(helmet({ contentSecurityPolicy: false }));

// CORS
router.use(
  cors({
    origin: [
      "https://staging-erp.voiped.eu",
      "http://staging-erp.voiped.eu",
      "https://localhost:4200",
      "http://localhost",
      "http://localhost:4200",
      "http://localhost:3000",
      "http://localhost:5001",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

router.use(
  express.json({
    limit: "10kb", // Large payload protection
  }),
);

// HTTP Parameter Pollution Protection
router.use(hpp());

// Limit URL length
router.use(express.urlencoded({ limit: "1mb", extended: true }));

// Header Count Limit
router.use(headerCountLimit);

// Header Size Limit
router.use(headerSizeLimit);

// Hard Block HTMl in payload
router.use(hardBlockHTML);

export default router;
