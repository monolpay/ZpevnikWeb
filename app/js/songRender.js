import "@parent-tobias/chordpro-renderer";
import { loadCatalog } from "./data.js";

const url = new URL(window.location.href);
const zpevnik = url.searchParams.get("zpevnik");
const pisen = url.searchParams.get("pisen");

class Song {
  constructor(content) {
    this.content = content;
    this.title = content.match(/\{title:\s*([^}]+)\}/i)?.[1].trim() ?? ""; //whatever this means

    this.renderer = document.createElement("chordpro-renderer");
    this.renderer.content = content;
    this.renderer.instrument = "guitar";
    this.renderer.showChords = false;
    this.renderer.chordPosition = "right";
    
    let songDiv = document.getElementById("song");
    songDiv.appendChild(this.renderer);

    let printDiv = document.getElementById("songPrint");
    this.printRenderer = document.createElement("chordpro-renderer");
    this.printRenderer.content = content;
    this.printRenderer.instrument = this.renderer.instrument;
    this.printRenderer.showChords = this.renderer.showChords;
    printDiv.appendChild(this.printRenderer)

    this.renderer.addEventListener('instrument-changed', (e) =>{
      this.printRenderer.instrument = this.renderer.instrument
    })

   const printStyle = document.createElement("style");
   printStyle.textContent = `
     @media print {
       .chord-sheet-header {
         display: none !important;
       }
     }
   `;
   this.printRenderer.shadowRoot.appendChild(printStyle);

  }

}

try {
  const catalog = await loadCatalog();
  const book = catalog.zpevniky.find((entry) => entry.name === zpevnik);
  const songData = book?.songs.find((entry) => entry.name === pisen);

  if (!songData) {
    throw new Error(`Píseň "${pisen ?? ""}" nebyla nalezena.`);
  }

  const song = new Song(songData.content);
  document.title = `${song.title} - RR Zpěvník`;
} catch (error) {
  console.error(error);
  document.getElementById("song").textContent = "Nelze načíst píseň.";
}

const back = document.getElementById("back");
if (back) {
  const backUrl = new URL("./list.html", window.location.href);
  if (zpevnik) backUrl.searchParams.set("zpevnik", zpevnik);
  back.href = backUrl;
}
