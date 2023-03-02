import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
	origin: function (origin, callback) {
		callback(null, true); // Still figuring this out...
	},
};

export default corsOptions;
