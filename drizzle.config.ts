export default {
  schema: "./src/main/db/schema.ts",
  out: "./src/main/db/drizzle",
  driver: "durable-sqlite",
  dialect: "sqlite",
}
