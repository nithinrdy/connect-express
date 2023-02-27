import { CorsOptions } from "cors";
import { Request, Response, NextFunction } from "express";

const corsOptions: CorsOptions = {
	origin: function (origin, callback) {
		callback(null, true); // Allow all origins since server operates behind a reverse proxy
	},
};

function setCORSHeaders(req: Request, res: Response, next: NextFunction) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
}

export { corsOptions, setCORSHeaders };
