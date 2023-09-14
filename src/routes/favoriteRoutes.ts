import { Router } from "express";
import {
	handleAdd,
	handleRemove,
	handleFetch,
} from "../controllers/favoriteController";

const router = Router();

router.get("/fetch", handleFetch);
router.post("/add", handleAdd);
router.delete("/remove", handleRemove);

export default router;
