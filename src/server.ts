import { Server } from "socket.io";

const port = process.env.PORT || 5000;

const io = new Server();

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
		io.sockets.in(data.caller).emit("callAccepted");
	});

	socket.on("disconnect", () => {
		console.log("User " + username + " disconnected with socketID " + id);
		socket.leave(username as string);
	});
});

io.listen(port as number, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});
