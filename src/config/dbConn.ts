import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

const createConn = () => {
	const createdClient = createClient(
		process.env.SUPABASE_URL as string,
		process.env.SUPABASE_KEY as string
	);
	supabaseClient = createdClient;
};

export { createConn, supabaseClient };
