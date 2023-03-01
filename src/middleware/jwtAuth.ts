import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface DecodedJwt {
	username: string;
	iat: number;
	exp: number;
}

const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) return res.sendStatus(401);
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
		if (err) return res.sendStatus(403);
		req.body.username = (decoded as DecodedJwt).username;
		next();
	});
};

export default jwtAuth;
