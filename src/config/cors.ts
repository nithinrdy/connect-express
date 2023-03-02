import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
	origin: function (origin, callback) {
		callback(null, true); // k just gotta change this in prod
	},
};

export default corsOptions;
