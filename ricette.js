"use strict";

// Carica le ricette dai file Markdown elencati in ricette/indice.json
// e le trasforma in oggetti usati da app.js.

// Unità riconosciute: [singolare, plurale]
const UNITA = [
  ["kg", "kg"], ["g", "g"], ["mg", "mg"], ["l", "l"], ["dl", "dl"], ["cl", "cl"], ["ml", "ml"],
  ["cucchiaio", "cucchiai"], ["cucchiaino", "cucchiaini"],
  ["tazza", "tazze"], ["bicchiere", "bicchieri"], ["bustina", "bustine"], ["pizzico", "pizzichi"],
  ["fetta", "fette"], ["foglia", "foglie"], ["rametto", "rametti"], ["spicchio", "spicchi"]
];
const FORME_UNITA = UNITA.flat().sort((a, b) => b.length - a.length);

const FRAZIONI = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 };
const NUM = String.raw`(?:\d+(?:[.,]\d+)?(?:\/\d+)?|\d*[¼½¾⅓⅔])`;
const RANGE = String.raw`(${NUM})(?:\s*[-–]\s*(${NUM}))?`;
const UNITA_RE = `(?:${FORME_UNITA.join("|")})`;

const RE_INGREDIENTE = new RegExp(String.raw`^${RANGE}\s*(?:(${UNITA_RE})\b\.?\s+)?(.+)$`, "i");
// Quantità dentro il testo, es. "(oppure 170 g di burro)" o "(circa 60 g)".
// Restano fisse quelle riferite al singolo pezzo, es. "(circa 150 g l'una)".
const RE_QUANTITA_NEL_TESTO = new RegExp(
  String.raw`(^|[\s(])${RANGE}\s*(${UNITA_RE})\b(?!\s*(?:l['’]un[oa]|ciascun[oa]|cadauno|a testa|a pezzo)\b)`,
  "gi"
);

function leggiNumero(s) {
  const fr = s.match(/^(\d*)([¼½¾⅓⅔])$/);
  if (fr) return Number(fr[1] || 0) + FRAZIONI[fr[2]];
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return a / b;
  }
  return Number(s.replace(",", "."));
}

function formattaNumero(q) {
  if (Math.abs(q - 0.25) < 0.01) return "¼";
  if (Math.abs(q - 0.5) < 0.01) return "½";
  if (Math.abs(q - 0.75) < 0.01) return "¾";
  const r = q >= 10 ? Math.round(q) : Math.round(q * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1).replace(".", ",");
}

// Accorda l'unità con la quantità: 1 cucchiaino, 2 cucchiaini
function accordaUnita(u, valore) {
  const coppia = UNITA.find(([s, p]) => s === u.toLowerCase() || p === u.toLowerCase());
  if (!coppia) return u;
  return valore > 1 ? coppia[1] : coppia[0];
}

function formattaQuantita(q, u, f) {
  const valori = (Array.isArray(q) ? q : [q]).map((x) => x * f);
  const testo = valori.map(formattaNumero).join("-");
  return u ? `${testo} ${accordaUnita(u, valori[valori.length - 1])}` : testo;
}

function scalaTesto(testo, f) {
  if (f === 1) return testo;
  return testo.replace(RE_QUANTITA_NEL_TESTO, (_, prima, a, b, u) => {
    const q = b ? [leggiNumero(a), leggiNumero(b)] : leggiNumero(a);
    return prima + formattaQuantita(q, u, f);
  });
}

function parseIngrediente(riga) {
  const m = riga.match(RE_INGREDIENTE);
  if (!m) return { q: null, u: "", n: riga };
  const da = leggiNumero(m[1]);
  return { q: m[2] ? [da, leggiNumero(m[2])] : da, u: m[3] || "", n: m[4] };
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
    if ((m = riga.match(/^##\s+(.+)$/))) {
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

// Elenco puntato o numerato; le righe rientrate diventano sotto-punti
function voci(righe) {
  const out = [];
  for (const riga of righe) {
    const m = riga.match(/^(\s*)(?:[-*]|\d+[.)])\s+(.+)$/);
    if (!m) continue;
    if (m[1].length >= 2 && out.length) out[out.length - 1].sotto.push(m[2].trim());
    else out.push({ testo: m[2].trim(), sotto: [] });
  }
  return out;
}

// Blocchi di testo libero: paragrafi ed elenchi puntati
function blocchi(righe) {
  const out = [];
  for (const riga of righe) {
    const li = riga.match(/^\s*[-*]\s+(.+)$/);
    const ultimo = out[out.length - 1];
    if (li) {
      if (ultimo?.tipo === "lista") ultimo.voci.push(li[1].trim());
      else out.push({ tipo: "lista", voci: [li[1].trim()] });
    } else if (!riga.trim()) {
      out.push({ tipo: "stop" });
    } else if (ultimo?.tipo === "p") {
      ultimo.testo += " " + riga.trim();
    } else {
      out.push({ tipo: "p", testo: riga.trim() });
    }
  }
  return out.filter((b) => b.tipo !== "stop");
}

const righeDi = (s, nome) => (s[nome] || []).flatMap((g) => g.righe);
const gruppiNonVuoti = (gruppi) => (gruppi || []).filter((g) => g.voci.length);

function parseRicetta(id, testo) {
  const { meta, corpo } = parseFrontMatter(testo.replace(/\r\n/g, "\n"));
  const s = dividiSezioni(corpo);

  // "8 persone (stampo da 16 cm)" -> 8 porzioni + dettaglio
  const porz = (meta.porzioni || "").match(/(\d+)\s*(?:persone|porzioni|pezzi)?\s*(.*)$/i);
  const fonti = voci(righeDi(s, "fonti")).map(({ testo: v }) => {
    const m = v.match(/^\[(.+?)\]\((.+?)\)$/);
    return m ? { titolo: m[1], url: m[2] } : { titolo: v, url: v };
  });

  return {
    id,
    titolo: meta.titolo || id,
    categoria: (meta.categoria || "Altro").split(">")[0].trim(),
    tag: (meta.tag || "").replace(/^\[|\]$/g, "").split(",").map((t) => t.trim()).filter(Boolean),
    porzioni: porz ? Number(porz[1]) : 1,
    dettaglioPorzioni: porz ? porz[2].replace(/^\(|\)$/g, "").trim() : "",
    tempo: meta.tempo || "",
    riposo: meta.riposo || "",
    difficolta: meta.difficolta || "",
    ingredienti: gruppiNonVuoti(
      (s["ingredienti"] || []).map((g) => ({ titolo: g.titolo, voci: voci(g.righe).map((v) => parseIngrediente(v.testo)) }))
    ),
    procedimento: gruppiNonVuoti((s["procedimento"] || []).map((g) => ({ titolo: g.titolo, voci: voci(g.righe) }))),
    note: blocchi(righeDi(s, "note")),
    varianti: voci(righeDi(s, "varianti")).map((v) => v.testo),
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
