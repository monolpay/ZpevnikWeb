import { loadCatalog } from "./data.js";

const listElement = document.getElementById("file-list");

try {
  const catalog = await loadCatalog();
  listElement.replaceChildren();

  for (const zpevnik of catalog.zpevniky) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    const url = new URL("./app/html/list.html", window.location.href);
    url.searchParams.set("zpevnik", zpevnik.name);
    link.href = url;
    link.textContent = zpevnik.name;
    item.append(link);
    listElement.append(item);
  }
} catch (error) {
  console.error("Nie je možné načítať zoznam zpěvníků:", error);
  listElement.textContent = "Nelze načíst seznam zpěvníků.";
}
