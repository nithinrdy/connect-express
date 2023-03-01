import { Request, Response, NextFunction } from "express";

const allowCORS = async (req: Request, res: Response, next: NextFunction) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, X-Requested-With"
	);
	next();
};

export default allowCORS;
