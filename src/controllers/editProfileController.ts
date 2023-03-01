import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { supabaseClient } from "../config/dbConn";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{7,15}$/;
const EMAIL_REGEX = /^[A-z0-9._%+-]+@[A-z0-9.-]+\.[A-z]{2,4}$/;

const handleEditProfile = async (req: Request, res: Response) => {
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}
	const { username, token } = req.body;
	const { editProperty, editValue } = req.body;

	if (!editProperty || !editValue) {
		return res.status(400).json("Both fields are required");
	}

	const responseUserObject = {
		username: username,
		email: "",
		nickname: "",
		accessToken: token,
	};

	switch (editProperty) {
		case "email":
			if (!EMAIL_REGEX.test(editValue)) {
				return res.status(400).json("Invalid email");
			}
			const { data: emailData, error: emailError } = await supabaseClient
				.from("users")
				.update({ email: editValue })
				.eq("username", username)
				.select();
			if (emailError) {
				res.status(500).json(emailError);
			}
			responseUserObject.email = emailData![0].email;
			responseUserObject.nickname = emailData![0].nickname;
			break;

		case "password":
			if (!PWD_REGEX.test(editValue)) {
				return res
					.status(400)
					.json(
						"Password must be 7-15 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
					);
			}
			const passwordHash = await bcrypt.hash(editValue, 10);
			const { data: passwordData, error: passwordError } = await supabaseClient
				.from("users")
				.update({ password_hash: passwordHash })
				.eq("username", username)
				.select();
			if (passwordError) {
				res.status(500).json(passwordError);
			}
			responseUserObject.email = passwordData![0].email;
			responseUserObject.nickname = passwordData![0].nickname;
			break;

		case "nickname":
			const { data: nicknameData, error: nicknameError } = await supabaseClient
				.from("users")
				.update({ nickname: editValue })
				.eq("username", username)
				.select();
			if (nicknameError) {
				res.status(500).json(nicknameError);
			}
			responseUserObject.email = nicknameData![0].email;
			responseUserObject.nickname = nicknameData![0].nickname;
			break;

		default:
			return res.status(400).json("Invalid edit property");
	}

	res.status(200).json({
		message: "Profile successfully edited",
		user: responseUserObject,
	});
};

export default handleEditProfile;
