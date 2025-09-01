import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL!) {
  throw new Error("Database url not set in .env.local ");
}
//this is migraption file
async function runMigration() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("All migration done successfully!");
  } catch (err) {
    console.log("Something went wrong while migration", err);
    process.exit(1);
  }
}

runMigration();
