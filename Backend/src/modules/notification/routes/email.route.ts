import { Router } from "express";
import { testEmail } from "../controllers/email.controller.js";

const router = Router();

router.post("/test-email", testEmail);

export default router;
