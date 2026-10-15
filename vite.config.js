import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/ZpevnikWeb/",
  build: {
    outDir: "docs",
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        list: resolve(root, "list.html"),
        song: resolve(root, "song.html"),
      },
    },
  },
});