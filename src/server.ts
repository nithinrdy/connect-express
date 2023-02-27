import express from "express";
import cors from "cors";
import { corsOptions, setCORSHeaders } from "../config/corsSettings";
import ProxyRouter from "../routes/proxyRoute";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(setCORSHeaders);

app.use("/express-proxy-api", ProxyRouter)

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});
