import "@parent-tobias/chordpro-renderer";

const username = "monolpay";
const repo = "Zpevnik";

const url = new URL(window.location.href);
const zpevnik = url.searchParams.get("zpevnik");
const pisen = url.searchParams.get("pisen");

const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/zpevniky/${zpevnik}/${pisen}`;

let songTitle = "";

var answer = fetch(apiUrl, {
  headers: {
    Accept: "application/vnd.github+json",
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    const bytes = Uint8Array.from(atob(data.content), (char) =>
      char.charCodeAt(0),
    );
    const fileText = new TextDecoder().decode(bytes);

    const renderer = document.createElement("chordpro-renderer");
    renderer.content = fileText;
    renderer.instrument = "guitar";
    renderer.showChords = true;
    renderer.chordPosition = "right";
    document.body.appendChild(renderer);

    fileText.replaceAll(" ", "");
    let titlePosition = fileText.search("{title:") + 7;
    let char = fileText[titlePosition];

    let i = 1;
    while (char != "}") {
      songTitle += char;
      char = fileText[titlePosition + i];
      i++;
    }

    const title = document.getElementsByTagName("title")[0];
    title.innerHTML = songTitle + "RR Zpěvník";
  })
  .catch((error) => console.error(error));
