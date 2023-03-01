import { Request, Response } from "express";
import { supabaseClient } from "../config/dbConn";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const handleLogin = async (req: Request, res: Response) => {
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json("Email and password are required");
	}

	const { data, error } = await supabaseClient
		.from("users")
		.select("*")
		.eq("email", email);

	if (error) {
		return res.status(500).json(error);
	}

	if (!data || data.length === 0) {
		return res.status(404).json("User not found");
	}

	const user = data[0];

	const passwordMatch = await bcrypt.compare(password, user.password_hash);

	if (!passwordMatch) {
		return res.status(401).json("Incorrect password");
	}

	const accessToken = jwt.sign(
		{ username: user.username },
		process.env.ACCESS_TOKEN_SECRET!,
		{
			expiresIn: "1d",
		}
	);
	const refreshToken = jwt.sign(
		{ username: user.username },
		process.env.REFRESH_TOKEN_SECRET!,
		{
			expiresIn: "30d",
		}
	);
	const { data: loggedInData, error: loginError } = await supabaseClient
		.from("users")
		.update({ refresh_token: refreshToken })
		.eq("email", email)
		.select("*")
		.single();

	if (loginError) {
		return res.status(500).json(error);
	}
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		sameSite: "none",
		secure: true,
	});

	return res.status(200).json({
		message: "Logged in.",
		user: {
			username: loggedInData.username,
			email: email,
			nickname: loggedInData.nickname,
			accessToken: accessToken,
		},
	});
};

const USER_REGEX = /^[A-z0-9-_]{4,20}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{7,15}$/;
const EMAIL_REGEX = /^[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,4}$/;

const handleRegistration = async (req: Request, res: Response) => {
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}
	const { username, email, password, nickname } = req.body;
	if (!username || !email || !password || !nickname) {
		return res.status(400).json("All fields are required");
	}

	if (!USER_REGEX.test(username)) {
		return res
			.status(400)
			.json(
				"Username must be 4-20 characters long and contain only letters, numbers, dashes, and underscores."
			);
	}

	if (!EMAIL_REGEX.test(email)) {
		return res.status(400).json("Invalid email");
	}

	if (!PWD_REGEX.test(password)) {
		return res
			.status(400)
			.json(
				"Password must be 7-15 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
			);
	}

	const { data: emailData, error: emailError } = await supabaseClient
		.from("users")
		.select()
		.eq("email", email);

	if (emailError) {
		return res.status(500).json(emailError);
	}

	if (emailData && emailData.length > 0) {
		return res.status(400).json("Email already in use");
	}

	const { data: usernameData, error: usernameError } = await supabaseClient
		.from("users")
		.select()
		.eq("username", username);

	if (usernameError) {
		return res.status(500).json(usernameError);
	}

	if (usernameData && usernameData.length > 0) {
		return res.status(400).json("Username is already in use");
	}

	const passwordHash = await bcrypt.hash(password, 10);

	const accessToken = jwt.sign(
		{ username: username },
		process.env.ACCESS_TOKEN_SECRET!,
		{
			expiresIn: "1d",
		}
	);
	const refreshToken = jwt.sign(
		{ username: username },
		process.env.REFRESH_TOKEN_SECRET!,
		{
			expiresIn: "30d",
		}
	);

	const { data: registerData, error: registerError } = await supabaseClient
		.from("users")
		.insert({
			username: username,
			email: email,
			password_hash: passwordHash,
			nickname: nickname,
			refresh_token: refreshToken,
		})
		.select("*")
		.single();

	if (registerError) {
		return res.status(500).json(registerError);
	}
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		sameSite: "none",
		secure: true,
	});

	return res.status(201).json({
		message: "Registered.",
		user: {
			username: registerData.username,
			email: email,
			nickname: registerData.nickname,
			accessToken: accessToken,
		},
	});
};

const handleLogout = async (req: Request, res: Response) => {
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}
	const refreshToken: string = req.cookies ? req.cookies.refreshToken : null;
	if (!refreshToken) {
		return res.status(204);
	}
	res.clearCookie("refreshToken", {
		httpOnly: true,
		sameSite: "none",
		secure: true,
	});

	const { data, error } = await supabaseClient
		.from("users")
		.update({ refresh_token: null })
		.eq("refresh_token", refreshToken)
		.select("*")
		.single();

	if (error) {
		return res.status(500).json(error);
	}

	return res.status(200).json("Logged out.");
};

export { handleLogin, handleRegistration, handleLogout };
