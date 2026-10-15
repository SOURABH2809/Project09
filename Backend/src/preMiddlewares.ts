import express from "express";
import cookieParser from "cookie-parser";
import { publicAssetsPath } from "./shared/constants/app.constant.js";

const router = express.Router();

// Static public assets
router.use("/public", express.static(publicAssetsPath));

// Cookie parsing
router.use(cookieParser());

export default router;
