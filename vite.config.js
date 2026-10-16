import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL(".", import.meta.url))+"/app/html/";

export default defineConfig({
  base: "/ZpevnikWeb/",
  build: {
    outDir: "docs",
    rollupOptions: {
      input: {
        index: resolve(path, "index.html"),
        list: resolve(path, "list.html"),
        song: resolve(path, "song.html"),
      },
    },
  },
});