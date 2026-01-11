import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
// logger: true 추가하면 쿼리 실행 시 콘솔에 로그가 찍힘
const db = drizzle(client, { logger: true });

export default db;
