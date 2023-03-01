import { Request, Response } from "express";
import { supabaseClient } from "../config/dbConn";

const handleAdd = async (req: Request, res: Response) => {
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}
	const { username } = req.body;
	const { userToAdd } = req.body;

	if (!username || !userToAdd) {
		return res.status(400).json("Bad request. Missing data.");
	}

	const { data, error } = await supabaseClient
		.from("stars")
		.select()
		.eq("starrer", username)
		.eq("starred", userToAdd);

	if (error) {
		console.log(error);
		return res.status(500).json("Server error.");
	}

	if (data.length > 0) {
		return res
			.status(202)
			.json(
				"Favorite already exists. You may unfavorite this user from the favorites page."
			);
	}

	const { data: data2, error: error2 } = await supabaseClient
		.from("stars")
		.insert([
			{ starrer: username, starred: userToAdd },
			{ starrer: userToAdd, starred: username },
		]);

	if (error2) {
		return res.status(500).json("Server error.");
	}

	return res.status(201).json("Favorite added.");
};

const handleRemove = async (req: Request, res: Response) => {
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}

	const { username } = req.body;
	const { userToRemove } = req.body;

	if (!username || !userToRemove) {
		return res.status(400).json("Bad request. Missing data.");
	}

	const { data, error } = await supabaseClient
		.from("stars")
		.select()
		.eq("starrer", username)
		.eq("starred", userToRemove);

	if (error) {
		return res.status(500).json("Server error.");
	}

	if (data.length === 0) {
		return res.status(202).json("Bad request. No such favorite exists.");
	}

	const { data: data2, error: error2 } = await supabaseClient
		.from("stars")
		.delete()
		.eq("starrer", username)
		.eq("starred", userToRemove)
		.or("starrer", userToRemove)
		.eq("starred", username);

	if (error2) {
		return res.status(500).json("Server error.");
	}

	return res.status(200).json("Favorite removed.");
};

const handleFetch = async (req: Request, res: Response) => {
	if (!supabaseClient) {
		return res.status(500).json("Server error.");
	}

	const { username } = req.body;

	if (!username) {
		return res.status(400).json("Bad request. Missing data.");
	}

	const { data, error } = await supabaseClient
		.from("stars")
		.select("starred")
		.eq("starrer", username);

	if (error) {
		return res.status(500).json("Server error.");
	}

	return res.status(200).json(data);
};

export { handleAdd, handleRemove, handleFetch };
