const catalogUrl = new URL("data/catalog.json", `${window.location.origin}${import.meta.env.BASE_URL}`);

export async function loadCatalog() {
  const response = await fetch(catalogUrl);

  if (!response.ok) {
    throw new Error(`Failed to load catalog: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
