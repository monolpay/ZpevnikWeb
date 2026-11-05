import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "public", "data");

const repoOwner = process.env.GITHUB_REPO_OWNER || "monolpay";
const repoName = process.env.GITHUB_REPO_NAME || "Zpevnik";
const dataPath = process.env.GITHUB_DATA_PATH || "zpevniky";
const branch = process.env.GITHUB_REF_NAME || process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

async function requestJson(url) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ZpevnikWeb-build",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText} - ${body.slice(0, 250)}`);
  }

  return response.json();
}

async function fetchDirectoryEntries(dirPath) {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${dirPath}?ref=${encodeURIComponent(branch)}`;
  const data = await requestJson(url);

  if (!Array.isArray(data)) {
    throw new Error(`Expected directory listing for ${dirPath}, got ${typeof data}`);
  }

  return data;
}

async function fetchSongsFromDirectory(dirPath) {
  const entries = await fetchDirectoryEntries(dirPath);
  const songs = [];

  for (const entry of entries) {
    if (entry.type === "dir") {
      if (entry.name === "obsah") continue;
      const nestedSongs = await fetchSongsFromDirectory(entry.path);
      songs.push(...nestedSongs);
      continue;
    }

    if (entry.type === "file") {
      const fileContent = await requestJson(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${entry.path}?ref=${encodeURIComponent(branch)}`,
      );

      const content = Buffer.from(fileContent.content || "", "base64").toString("utf8");
      songs.push({
        name: entry.name,
        path: entry.path,
        content,
      });
    }
  }

  return songs;
}

async function collectSongsFromDisk(bookDir) {
  const entries = await fs.readdir(bookDir, { withFileTypes: true });
  const songs = [];
  const bookName = path.basename(bookDir);

  for (const entry of entries) {
    if (entry.name === "obsah") continue;

    if (entry.isFile()) {
      const filePath = path.join(bookDir, entry.name);
      const content = await fs.readFile(filePath, "utf8");
      songs.push({
        name: entry.name,
        path: path.posix.join(dataPath, bookName, entry.name),
        content,
      });
    }
  }

  return songs;
}

async function buildCatalogFromGit() {
  const tempRepoDir = path.join(rootDir, ".tmp-zpevnik-source");
  const remoteUrl = `https://github.com/${repoOwner}/${repoName}.git`;

  try {
    await fs.rm(tempRepoDir, { recursive: true, force: true });
    await execFileAsync("git", ["clone", "--depth", "1", "--filter=blob:none", "--sparse", remoteUrl, tempRepoDir], { stdio: "inherit" });
    await execFileAsync("git", ["-C", tempRepoDir, "sparse-checkout", "set", dataPath], { stdio: "inherit" });

    const bookRoot = path.join(tempRepoDir, dataPath);
    const bookEntries = await fs.readdir(bookRoot, { withFileTypes: true });
    const zpevniky = [];

    for (const entry of bookEntries) {
      if (!entry.isDirectory()) continue;

      const bookDir = path.join(bookRoot, entry.name);
      const songs = await collectSongsFromDisk(bookDir);

      zpevniky.push({
        name: entry.name,
        path: path.posix.join(dataPath, entry.name),
        songs: songs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      repo: `${repoOwner}/${repoName}`,
      zpevniky: zpevniky.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    };
  } finally {
    await fs.rm(tempRepoDir, { recursive: true, force: true });
  }
}

async function buildCatalogFromApi() {
  const roots = await fetchDirectoryEntries(dataPath);
  const zpevniky = [];

  for (const entry of roots) {
    if (entry.type !== "dir") continue;

    const songs = await fetchSongsFromDirectory(entry.path);
    zpevniky.push({
      name: entry.name,
      path: entry.path,
      songs: songs.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    repo: `${repoOwner}/${repoName}`,
    zpevniky: zpevniky.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
  };
}

async function buildCatalog() {
  if (token) {
    return buildCatalogFromApi();
  }

  return buildCatalogFromGit();
}

const catalog = await buildCatalog();
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "catalog.json"), JSON.stringify(catalog, null, 2));
console.log(`Generated ${catalog.zpevniky.length} zpevnik folders with songs in ${path.join(outDir, "catalog.json")}`);
