import { Router } from "express";
import { login, logout, refreshToken } from "../controllers/users/creat/auth";
import { signup, sendOTP, verifyOTP } from "../controllers/users/creat/signup";

const router = Router();

// Authentification
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Inscription
router.post("/signup", signup);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

export default router;
