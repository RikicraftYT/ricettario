"use strict";

const app = document.getElementById("app");
const stato = { cerca: "", categoria: "Tutte" };

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function formattaNumero(q) {
  const r = Math.round(q * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(".", ",");
}

// ---------- Elenco ----------
function vistaElenco() {
  const categorie = ["Tutte", ...new Set(RICETTE.map((r) => r.categoria))];

  app.innerHTML = `
    <div class="filtri">
      <input id="cerca" type="search" placeholder="Cerca ricetta, ingrediente o tag…" value="${esc(stato.cerca)}" autocomplete="off">
      <div class="chips">
        ${categorie
          .map((c) => `<button class="chip ${c === stato.categoria ? "attiva" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`)
          .join("")}
      </div>
    </div>
    <div id="griglia" class="griglia"></div>
  `;

  const input = document.getElementById("cerca");
  input.addEventListener("input", () => {
    stato.cerca = input.value;
    disegnaGriglia();
  });
  app.querySelectorAll(".chip").forEach((b) =>
    b.addEventListener("click", () => {
      stato.categoria = b.dataset.cat;
      vistaElenco();
    })
  );
  disegnaGriglia();
}

function disegnaGriglia() {
  const q = stato.cerca.trim().toLowerCase();
  const risultati = RICETTE.filter((r) => {
    if (stato.categoria !== "Tutte" && r.categoria !== stato.categoria) return false;
    if (!q) return true;
    const testo = [r.titolo, r.categoria, ...(r.tag || []), ...r.ingredienti.map((i) => i.n)].join(" ").toLowerCase();
    return testo.includes(q);
  }).sort((a, b) => a.titolo.localeCompare(b.titolo, "it"));

  const griglia = document.getElementById("griglia");
  griglia.innerHTML = risultati.length
    ? risultati
        .map(
          (r) => `
      <a class="card" href="#/ricetta/${encodeURIComponent(r.id)}">
        <span class="card-cat">${esc(r.categoria)}</span>
        <h2>${esc(r.titolo)}</h2>
        <p class="meta">⏱ ${r.tempo} min · 👥 ${r.porzioni} · ${esc(r.difficolta || "")}</p>
        <div class="tags">${(r.tag || []).map((t) => `<span>#${esc(t)}</span>`).join("")}</div>
      </a>`
        )
        .join("")
    : `<p class="vuoto">Nessuna ricetta trovata.</p>`;
}

// ---------- Dettaglio ----------
let wakeLock = null;

function vistaRicetta(id) {
  const r = RICETTE.find((x) => x.id === id);
  if (!r) {
    app.innerHTML = `<p class="vuoto">Ricetta non trovata. <a href="#/">Torna all'elenco</a></p>`;
    return;
  }
  let porzioni = r.porzioni;
  document.title = `${r.titolo} · Ricettario`;

  app.innerHTML = `
    <a href="#/" class="indietro">← Tutte le ricette</a>
    <article class="ricetta">
      <span class="card-cat">${esc(r.categoria)}</span>
      <h1>${esc(r.titolo)}</h1>
      <p class="meta">⏱ ${r.tempo} min · ${esc(r.difficolta || "")}</p>

      <div class="azioni">
        <div class="porzioni">
          <button id="meno" aria-label="Meno porzioni">−</button>
          <span><strong id="nPorz">${porzioni}</strong> porzioni</span>
          <button id="piu" aria-label="Più porzioni">+</button>
        </div>
        ${"wakeLock" in navigator ? `<label class="toggle"><input type="checkbox" id="schermo"> Schermo sempre acceso</label>` : ""}
      </div>

      <div class="colonne">
        <section>
          <h3>Ingredienti</h3>
          <ul id="ingredienti" class="ingredienti"></ul>
        </section>
        <section>
          <h3>Procedimento</h3>
          <ol class="passi">
            ${r.procedimento.map((p) => `<li>${esc(p)}</li>`).join("")}
          </ol>
        </section>
      </div>

      ${r.note ? `<aside class="note"><strong>Note:</strong> ${esc(r.note)}</aside>` : ""}
      ${r.varianti?.length ? `<section class="varianti"><h3>Varianti</h3><ul>${r.varianti.map((v) => `<li>${esc(v)}</li>`).join("")}</ul></section>` : ""}
      ${r.fonti?.length ? `<p class="fonte">Fonti: ${r.fonti.map((x) => `<a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.titolo || x.url)}</a>`).join(" · ")}</p>` : ""}
    </article>
  `;

  const disegnaIngredienti = () => {
    const f = porzioni / r.porzioni;
    document.getElementById("nPorz").textContent = porzioni;
    document.getElementById("ingredienti").innerHTML = r.ingredienti
      .map((i, k) => {
        const qt = i.q == null ? "" : `<b>${Array.isArray(i.q) ? i.q.map((x) => formattaNumero(x * f)).join("-") : formattaNumero(i.q * f)}${i.u ? " " + esc(i.u) : ""}</b> `;
        return `<li><label><input type="checkbox" data-k="${k}"> <span>${qt}${esc(i.n)}</span></label></li>`;
      })
      .join("");
  };
  disegnaIngredienti();

  document.getElementById("meno").onclick = () => { if (porzioni > 1) { porzioni--; disegnaIngredienti(); } };
  document.getElementById("piu").onclick = () => { porzioni++; disegnaIngredienti(); };

  const schermo = document.getElementById("schermo");
  if (schermo) {
    schermo.addEventListener("change", async () => {
      try {
        if (schermo.checked) wakeLock = await navigator.wakeLock.request("screen");
        else { await wakeLock?.release(); wakeLock = null; }
      } catch { schermo.checked = false; }
    });
  }
}

// ---------- Router (hash: funziona su GitHub Pages senza configurazioni) ----------
function router() {
  wakeLock?.release();
  wakeLock = null;
  document.title = "Ricettario";
  const m = location.hash.match(/^#\/ricetta\/(.+)$/);
  if (m) vistaRicetta(decodeURIComponent(m[1]));
  else vistaElenco();
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
router();
