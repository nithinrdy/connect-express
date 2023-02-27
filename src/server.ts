import express from "express";
import cors, { CorsOptions } from "cors";
const app = express();
const port = process.env.PORT || 5000;

const corsOptions: CorsOptions = {
	origin: function (origin, callback) {
		callback(null, true); // Allow all origins since server operates behind a reverse proxy
	},
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
