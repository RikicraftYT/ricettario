"use strict";

const app = document.getElementById("app");
const stato = { cerca: "", categoria: "Tutte" };
let RICETTE = [];

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


// Grassetto, corsivo e link dentro il testo delle ricette
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener" target="_blank">$1</a>');
}

function meta(r, conPorzioni) {
  const parti = [];
  if (r.tempo) parti.push("⏱ " + esc(/^\d+$/.test(r.tempo) ? r.tempo + " min" : r.tempo));
  if (!conPorzioni && r.riposo) parti.push("💤 riposo " + esc(r.riposo));
  if (conPorzioni) parti.push("👥 " + r.porzioni);
  if (r.difficolta) parti.push(esc(r.difficolta));
  return parti.join(" · ");
}

function passi(gruppi) {
  let n = 1;
  return gruppi.map((g) => {
    const html = `${g.titolo ? `<h4>${esc(g.titolo)}</h4>` : ""}<ol class="passi" start="${n}" style="counter-reset: passo ${n - 1}">${g.voci.map((p) => `<li>${inline(p.testo)}${p.sotto.length ? `<ul>${p.sotto.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>` : ""}</li>`).join("")}</ol>`;
    n += g.voci.length;
    return html;
  }).join("");
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
    const testo = [r.titolo, r.categoria, ...(r.tag || []), ...r.ingredienti.flatMap((g) => g.voci.map((i) => i.n))].join(" ").toLowerCase();
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
        <p class="meta">${meta(r, true)}</p>
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
      <p class="meta">${meta(r, false)}</p>

      <div class="azioni">
        <div class="porzioni">
          <button id="meno" aria-label="Meno porzioni">−</button>
          <span><strong id="nPorz">${porzioni}</strong> porzioni</span>
          <button id="piu" aria-label="Più porzioni">+</button>
        </div>
        ${r.dettaglioPorzioni ? `<span class="dettaglio">${inline(r.dettaglioPorzioni)}</span>` : ""}
        ${"wakeLock" in navigator ? `<label class="toggle"><input type="checkbox" id="schermo"> Schermo sempre acceso</label>` : ""}
      </div>

      <div class="colonne">
        <section>
          <h3>Ingredienti</h3>
          <div id="ingredienti"></div>
        </section>
        <section>
          <h3>Procedimento</h3>
          <p id="avviso" class="avviso" hidden>Le quantità nel procedimento si riferiscono a ${r.porzioni} porzioni.</p>
          ${passi(r.procedimento)}
        </section>
      </div>

      ${r.note.length ? `<aside class="note"><strong>Note</strong>${r.note.map((b) => b.tipo === "lista" ? `<ul>${b.voci.map((v) => `<li>${inline(v)}</li>`).join("")}</ul>` : `<p>${inline(b.testo)}</p>`).join("")}</aside>` : ""}
      ${r.varianti?.length ? `<section class="varianti"><h3>Varianti</h3><ul>${r.varianti.map((v) => `<li>${inline(v)}</li>`).join("")}</ul></section>` : ""}
      ${r.fonti?.length ? `<p class="fonte">Fonti: ${r.fonti.map((x) => `<a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.titolo || x.url)}</a>`).join(" · ")}</p>` : ""}
    </article>
  `;

  const disegnaIngredienti = () => {
    const f = porzioni / r.porzioni;
    document.getElementById("nPorz").textContent = porzioni;
    document.getElementById("avviso").hidden = porzioni === r.porzioni;
    const spuntati = new Set([...document.querySelectorAll("#ingredienti input:checked")].map((c) => c.dataset.k));
    document.getElementById("ingredienti").innerHTML = r.ingredienti
      .map((g, gi) => `
        ${g.titolo ? `<h4>${esc(g.titolo)}</h4>` : ""}
        <ul class="ingredienti">
          ${g.voci.map((i, k) => {
            const qt = i.q == null ? "" : `<b>${esc(formattaQuantita(i.q, i.u, f))}</b> `;
            const id = gi + "-" + k;
            return `<li><label><input type="checkbox" data-k="${id}" ${spuntati.has(id) ? "checked" : ""}> <span>${qt}${inline(scalaTesto(i.n, f))}</span></label></li>`;
          }).join("")}
        </ul>`)
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

caricaRicette()
  .then((r) => { RICETTE = r; router(); })
  .catch(() => {
    app.innerHTML = `<p class="vuoto">Impossibile caricare le ricette.</p>`;
  });
