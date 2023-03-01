import { Router } from "express";
import {
	handleLogin,
	handleRegistration,
	handleLogout,
} from "../controllers/authController";

const router = Router();

router.post("/login", handleLogin);
router.post("/register", handleRegistration);
router.get("/logout", handleLogout);

export default router;
