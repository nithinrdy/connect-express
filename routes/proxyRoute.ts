import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	console.log(req.body);
	console.log(req.headers);
	res.send({ express: "Hello From Express" });
});

export default router;
