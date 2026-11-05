import { loadCatalog } from "./data.js";

const params = new URLSearchParams(window.location.search);
const zpevnik = params.get("zpevnik");
const listElement = document.getElementById("file-list");

try {
  const catalog = await loadCatalog();
  const book = catalog.zpevniky.find((entry) => entry.name === zpevnik);

  if (!book) {
    throw new Error(`Zpěvník "${zpevnik ?? ""}" nebyl nalezen.`);
  }

  listElement.replaceChildren();
  for (const song of book.songs) {
    if (song.name === "obsah") continue;

    const item = document.createElement("li");
    const link = document.createElement("a");
    const url = new URL("./song.html", window.location.href);
    url.searchParams.set("zpevnik", book.name);
    url.searchParams.set("pisen", song.name);
    link.href = url;
    link.textContent = song.name;
    item.append(link);
    listElement.append(item);
  }
} catch (error) {
  console.error("Unable to load songs:", error);
  listElement.textContent = "Nelze načíst písně.";
}