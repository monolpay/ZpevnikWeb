import "@parent-tobias/chordpro-renderer";

const username = "monolpay";
const repo = "Zpevnik";

const url = new URL(window.location.href);
const zpevnik = url.searchParams.get("zpevnik");
const pisen = url.searchParams.get("pisen");

const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/zpevniky/${zpevnik}/${pisen}`;

class Song {
  constructor(content) {
    this.content = content;
    this.title = content.match(/\{title:\s*([^}]+)\}/i)?.[1].trim() ?? ""; //whatever this means

    this.renderer = document.createElement("chordpro-renderer");
    this.renderer.content = content;
    this.renderer.instrument = "guitar";
    this.renderer.showChords = false;
    this.renderer.chordPosition = "right";
    document.body.appendChild(this.renderer);
  }

  static async load(url) {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const bytes = Uint8Array.from(atob(data.content), char =>
      char.charCodeAt(0),
    );
    const content = new TextDecoder().decode(bytes);

    return new Song(content);
  }
}

try {
  const song = await Song.load(apiUrl);
  document.title = `${song.title} - RR Zpěvník`;
} catch (error) {
  console.error(error);
}

const back = document.getElementById("back");
back.href = './list?='+zpevnik