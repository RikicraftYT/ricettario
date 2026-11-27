// ============================================================
//  LE TUE RICETTE
//  Per aggiungerne una: copia un blocco { ... }, incollalo in fondo
//  alla lista e modifica i campi. "id" deve essere unico e senza spazi.
//
//  Ingredienti: { q: quantità, u: "unità", n: "nome" }
//    q può essere un numero (3), un intervallo ([2, 3]) o null (q.b.).
//    Le quantità numeriche vengono ricalcolate quando cambi le porzioni.
//  Facoltativi: note, varianti (lista), fonti (lista di { titolo, url }).
// ============================================================

const RICETTE = [
  {
    id: "pollo-patate-forno",
    titolo: "Cosce di pollo disossate al forno con patate",
    categoria: "Secondi",
    tag: ["pollo", "forno", "patate"],
    porzioni: 2,
    tempo: 55, // minuti
    difficolta: "Facile",
    ingredienti: [
      { q: 2, u: "", n: "cosce di pollo disossate (circa 150 g l'una)" },
      { q: 3, u: "", n: "patate medie" },
      { q: [2, 3], u: "", n: "spicchi d'aglio con la buccia, schiacciati" },
      { q: null, u: "", n: "rosmarino, origano secco, alloro" },
      { q: null, u: "", n: "olio extravergine d'oliva" },
      { q: null, u: "", n: "sale e pepe" },
      { q: null, u: "", n: "vino bianco (facoltativo)" }
    ],
    procedimento: [
      "Accendi il forno a 200° ventilato.",
      "Sbuccia le patate e tagliale a pezzi di media grandezza. Condiscile in una pirofila con olio, sale, pepe, aglio, rosmarino, origano e alloro. Inforna le patate da sole per circa 20 minuti.",
      "Nel frattempo condisci le cosce con olio, sale, pepe e un po' di rosmarino.",
      "Aggiungi le cosce nella teglia con la pelle rivolta verso l'alto.",
      "Versa un goccio di vino bianco e 2-3 cucchiai d'acqua: aiutano a mantenere le cosce succose.",
      "Cuoci per altri 25-30 minuti, bagnando ogni tanto il pollo con il sughetto che si forma in teglia.",
      "Il pollo è pronto quando la pelle è dorata e la carne non ha parti rosate. Le patate devono essere morbide: se serve, lasciale qualche minuto in più. Servi ben caldo."
    ],
    note: "Si cuoce in due tempi perché senza osso il pollo cuoce molto prima delle patate (circa 25 minuti). Partendo dalle patate, la carne non si asciuga.",
    varianti: [
      "A fine cottura aggiungi pomodorini, cipolla e olive nere per una versione mediterranea.",
      "Usa paprika dolce o affumicata al posto dell'origano."
    ],
    fonti: [
      { titolo: "Le torte di Gessica – Cosce di pollo disossate al forno con patate", url: "https://blog.giallozafferano.it/letortedigessica/cosce-di-pollo-disossate-al-forno-con-patate/" },
      { titolo: "Allacciate il grembiule – Cosce di pollo al forno", url: "https://blog.giallozafferano.it/allacciateilgrembiule/cosce-di-pollo-al-forno/" },
      { titolo: "Tavolartegusto – Cosce di pollo al forno", url: "https://www.tavolartegusto.it/?p=47499" }
    ]
  }
];
