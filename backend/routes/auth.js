import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import {
  register,
  login,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";

const router = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." },
});

router.post(["/register", "/login"], limiter);
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", requireAuth, logout);

export default router;
