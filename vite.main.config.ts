// vite.main.config.ts
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    // rollupOptions: {
    //   external: [
    //     "@libsql/darwin-arm64",
    //     "@libsql/client",
    //     "node-cron",
    //   ],
    // },
    rollupOptions: {
      external: ["better-sqlite3"],
    },
  },
})
