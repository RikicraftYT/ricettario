"use strict";

// Carica le ricette dai file Markdown elencati in ricette/indice.json
// e le trasforma in oggetti usati da app.js.

const UNITA = [
  "kg", "g", "mg", "l", "dl", "cl", "ml",
  "cucchiai", "cucchiaio", "cucchiaini", "cucchiaino",
  "tazze", "tazza", "bicchieri", "bicchiere",
  "bustine", "bustina", "pizzichi", "pizzico",
  "fette", "fetta", "foglie", "foglia", "rametti", "rametto"
];

const NUM = String.raw`\d+(?:[.,]\d+)?(?:\/\d+)?`;
const RE_INGREDIENTE = new RegExp(
  String.raw`^(${NUM})(?:\s*-\s*(${NUM}))?\s*(?:(${UNITA.join("|")})\b\.?\s+)?(.+)$`,
  "i"
);

function leggiNumero(s) {
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return a / b;
  }
  return Number(s.replace(",", "."));
}

function parseIngrediente(riga) {
  const m = riga.match(RE_INGREDIENTE);
  if (!m) return { q: null, u: "", n: riga };
  const da = leggiNumero(m[1]);
  return {
    q: m[2] ? [da, leggiNumero(m[2])] : da,
    u: m[3] || "",
    n: m[4]
  };
}

function parseFrontMatter(testo) {
  const meta = {};
  const m = testo.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { meta, corpo: testo };
  for (const riga of m[1].split("\n")) {
    const i = riga.indexOf(":");
    if (i < 0) continue;
    meta[riga.slice(0, i).trim().toLowerCase()] = riga.slice(i + 1).trim();
  }
  return { meta, corpo: testo.slice(m[0].length) };
}

// Divide il corpo in sezioni "## Titolo", ognuna con eventuali gruppi "### Sottotitolo"
function dividiSezioni(corpo) {
  const sezioni = {};
  let sezione = null;
  let gruppo = null;
  for (const raw of corpo.split("\n")) {
    const riga = raw.trimEnd();
    let m;
    if ((m = riga.match(/^##\s+(.+)$/)) && !riga.startsWith("###")) {
      sezione = sezioni[m[1].trim().toLowerCase()] = [];
      gruppo = { titolo: "", righe: [] };
      sezione.push(gruppo);
    } else if (sezione && (m = riga.match(/^###\s+(.+)$/))) {
      gruppo = { titolo: m[1].trim(), righe: [] };
      sezione.push(gruppo);
    } else if (gruppo) {
      gruppo.righe.push(riga);
    }
  }
  return sezioni;
}

const voci = (righe) =>
  righe.map((r) => r.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/)).filter(Boolean).map((m) => m[1].trim());

const paragrafi = (righe) =>
  righe.join("\n").split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);

const gruppiNonVuoti = (gruppi) => (gruppi || []).filter((g) => g.voci.length);

function parseRicetta(id, testo) {
  const { meta, corpo } = parseFrontMatter(testo.replace(/\r\n/g, "\n"));
  const s = dividiSezioni(corpo);

  const fonti = voci((s["fonti"] || []).flatMap((g) => g.righe)).map((v) => {
    const m = v.match(/^\[(.+?)\]\((.+?)\)$/);
    return m ? { titolo: m[1], url: m[2] } : { titolo: v, url: v };
  });

  return {
    id,
    titolo: meta.titolo || id,
    categoria: meta.categoria || "Altro",
    tag: (meta.tag || "").split(",").map((t) => t.trim()).filter(Boolean),
    porzioni: Number(meta.porzioni) || 1,
    tempo: meta.tempo || "",
    difficolta: meta.difficolta || "",
    ingredienti: gruppiNonVuoti((s["ingredienti"] || []).map((g) => ({ titolo: g.titolo, voci: voci(g.righe).map(parseIngrediente) }))),
    procedimento: gruppiNonVuoti((s["procedimento"] || []).map((g) => ({ titolo: g.titolo, voci: voci(g.righe) }))),
    note: paragrafi((s["note"] || []).flatMap((g) => g.righe)),
    varianti: voci((s["varianti"] || []).flatMap((g) => g.righe)),
    fonti
  };
}

async function caricaRicette() {
  const elenco = await fetch("ricette/indice.json", { cache: "no-cache" }).then((r) => r.json());
  return Promise.all(
    elenco.map(async (file) => {
      const testo = await fetch("ricette/" + file, { cache: "no-cache" }).then((r) => r.text());
      return parseRicetta(file.replace(/\.md$/, ""), testo);
    })
  );
}
