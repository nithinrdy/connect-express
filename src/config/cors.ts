import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
	origin: function (origin, callback) {
		callback(null, true); // Allow all origins since server operates behind a reverse proxy
	},
};

export default corsOptions;
