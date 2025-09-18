import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in Environment");
}
const sql = neon(process.env.DATABASE_URL!);

//this is purely handled by drizzle
export const db = drizzle(sql, { schema });

//when sometimes you just want to raw query from sql
export { sql };
