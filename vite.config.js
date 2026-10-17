import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url))
const path = root+"/app/html/";

export default defineConfig({
  base: "/ZpevnikWeb/",
  build: {
    outDir: "docs",
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        list: resolve(path, "list.html"),
        song: resolve(path, "song.html"),
      },
    },
  },
});