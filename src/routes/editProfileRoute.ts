import { Router } from "express";
import { handleEditProfile } from "../controllers/editProfileController";


const router = Router();

router.put("/", handleEditProfile)

export default router;
