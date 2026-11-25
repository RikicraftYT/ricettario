# 🍝 Ricettario

Le mie ricette preferite, senza pubblicità, pop-up o banner dei cookie.
Sito statico: HTML, CSS e JavaScript, senza dipendenze né build.

## Aggiungere una ricetta

Apri `ricette.js`, copia un blocco `{ ... }` esistente, incollalo in fondo alla lista e modifica i campi.

| Campo | Descrizione |
|---|---|
| `id` | identificativo unico, minuscolo e senza spazi (finisce nell'URL) |
| `titolo`, `categoria`, `tag` | usati per la ricerca e i filtri |
| `porzioni`, `tempo` (minuti), `difficolta` | informazioni generali |
| `ingredienti` | `{ q: 200, u: "g", n: "farina" }`; usa `q: null` per "q.b." |
| `procedimento` | un elemento per ogni passo |
| `note`, `fonte` | facoltativi |

## Provarlo in locale

Basta aprire `index.html` nel browser.

## Pubblicarlo con GitHub Pages

1. Fai il push del repository su GitHub.
2. Vai su **Settings → Pages** e scegli **Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. Dopo un minuto il sito sarà su `https://<tuo-utente>.github.io/ricettario/`.
