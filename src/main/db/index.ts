import path from "path"
import { app } from "electron"
import fs from "fs"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import * as schema from "./schema"

let db: ReturnType<typeof drizzle>

export function initDatabase() {
  const dbPath = path.join(
    app.getPath("userData"),
    "database.sqlite",
  )

  const isFirstTime = !fs.existsSync(dbPath)

  if (isFirstTime) {
    fs.writeFileSync(dbPath, "")
  }

  const sqlite = new Database(dbPath)

  db = drizzle(sqlite, { schema })

  if (isFirstTime) {
    const migrationsPath = path.resolve(
      __dirname,
      "../../db/drizzle",
    )

    migrate(db, { migrationsFolder: migrationsPath })
  }

  return db
}

export function getDB() {
  if (!db)
    throw new Error("База данных не инициализирована")
  return db
}
