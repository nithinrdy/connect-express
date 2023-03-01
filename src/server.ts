import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import corsOptions from "./config/cors";
import cookieParser from "cookie-parser";
import allowCORS from "./middleware/allowCORS";
import { config } from "dotenv";
import { createConn } from "./config/dbConn";
import jwtAuth from "./middleware/jwtAuth";
import path from "path";
import authRouter from "./routes/authRoutes";
import refreshRouter from "./routes/refreshRoute";
import editProfileRouter from "./routes/editProfileRoute";
import favoriteRouter from "./routes/favoriteRoutes";

config();
createConn();

const port = process.env.PORT || 8000;

// Setting up socket.io and express servers
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

// All of socket.io's events
io.on("connection", (socket) => {
	const {
		id,
		handshake: {
			query: { username },
		},
	} = socket;
	console.log("User " + username + " connected with socketID " + id);
	socket.join(username as string);

	socket.on("sendOffer", (data) => {
		const { callee, caller, sdp, type } = data;
		io.sockets.in(callee).emit("incomingOffer", { callee, caller, sdp, type });
	});

	socket.on("sendCandidate", (data) => {
		const userToSendTo = data.to;
		const candidate = data.candidate;
		io.sockets.in(userToSendTo).emit("incomingCandidate", candidate);
	});

	socket.on("sendAnswer", (data) => {
		const caller = data.to;
		const sdp = data.sdp;
		const type = data.type;
		io.sockets.in(caller).emit("incomingAnswer", { sdp, type });
	});

	socket.on("endOtherEnd", (data) => {
		io.sockets.in(data.otherEnd).emit("endCall");
	});

	socket.on("startCall", (data) => {
		console.log(data.caller + " is calling " + data.otherEnd);
		if (!io.sockets.adapter.rooms.get(data.otherEnd)) {
			io.sockets.in(data.caller).emit("notOnline", {
				message: "User " + data.caller + " is not online",
			});
			return;
		}
		io.sockets.in(data.otherEnd).emit("incomingCall", { caller: data.caller });
	});

	socket.on("rejectCall", (data) => {
		io.sockets.in(data.caller).emit("callRejected");
	});

	socket.on("acceptCall", (data) => {
		console.log(data.caller + " is accepting call");
		io.sockets.in(data.caller).emit("callAccepted");
	});

	socket.on("disconnect", () => {
		console.log("User " + username + " disconnected with socketID " + id);
		socket.leave(username as string);
	});
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(allowCORS);
app.use(express.static(path.join(__dirname, "build")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/refresh", refreshRouter);

app.use(jwtAuth);

app.use("/api/editProfile", editProfileRouter);
app.use("/api/favorite", favoriteRouter);

app.get("/*", function (req, res) {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

server.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
