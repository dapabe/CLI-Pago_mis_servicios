import { exec } from "child_process";

exec(
	`npx supabase gen types --lang=typescript --project-id ${process.env.SUPA_PROJECT_ID} --schema pago_mis_servicios > ./src/common/types/supabase.ts`,
	(err, stdout) => {
		if (err) console.log(err.message);
		else console.log(stdout);
	},
);
