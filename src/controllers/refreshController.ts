import { Request, Response } from "express";
import { supabaseClient } from "../config/dbConn";
import jwt from "jsonwebtoken";

interface DecodedJwt {
	username: string;
	iat: number;
	exp: number;
}

const handleRefresh = async (req: Request, res: Response) => {
  console.log("refreshing token")
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}
	const refreshToken: string = req.cookies ? req.cookies.refreshToken : null;
	if (!refreshToken) {
		return res.status(401).json("No refresh token received.");
	}

	const { data, error } = await supabaseClient
		.from("users")
		.select()
		.eq("refresh_token", refreshToken);

	if (error) {
		return res.status(500).json(error);
	}

	if (data.length === 0) {
		return res.status(401).json("No matching user found");
	}

	const user = data[0];

	jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET!,
		(err, decoded) => {
			if (err || (decoded as DecodedJwt).username != user.username) {
				return res.status(403).json("Invalid refresh token.");
			}
		}
	);

	const accessToken = jwt.sign(
		{ username: user.username },
		process.env.ACCESS_TOKEN_SECRET!,
		{
			expiresIn: "1d",
		}
	);

	return res.status(200).json({
		message: "Token refreshed",
		user: {
			username: user.username,
			email: user.email,
			nickname: user.nickname,
			accessToken: accessToken,
		},
	});
};

export default handleRefresh;
