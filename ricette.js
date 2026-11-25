// ============================================================
//  LE TUE RICETTE
//  Per aggiungerne una: copia un blocco { ... }, incollalo in fondo
//  alla lista e modifica i campi. "id" deve essere unico e senza spazi.
//
//  Ingredienti: { q: quantità (numero o null), u: "unità", n: "nome" }
//  Le quantità numeriche vengono ricalcolate quando cambi le porzioni.
// ============================================================

const RICETTE = [
  {
    id: "carbonara",
    titolo: "Spaghetti alla carbonara",
    categoria: "Primi",
    tag: ["pasta", "veloce", "romana"],
    porzioni: 4,
    tempo: 25, // minuti
    difficolta: "Facile",
    ingredienti: [
      { q: 320, u: "g", n: "spaghetti" },
      { q: 150, u: "g", n: "guanciale" },
      { q: 4, u: "", n: "tuorli" },
      { q: 50, u: "g", n: "pecorino romano grattugiato" },
      { q: null, u: "", n: "pepe nero q.b." }
    ],
    procedimento: [
      "Taglia il guanciale a listarelle e rosolalo in padella senza olio finché diventa croccante.",
      "In una ciotola sbatti i tuorli con il pecorino e abbondante pepe.",
      "Cuoci gli spaghetti in acqua salata e scolali al dente, tenendo da parte un po' di acqua di cottura.",
      "Fuori dal fuoco unisci pasta e guanciale, poi aggiungi la crema di uova mescolando velocemente. Usa l'acqua di cottura per renderla cremosa.",
      "Servi subito con altro pecorino e pepe."
    ],
    note: "Mai la panna. Il segreto è mantecare fuori dal fuoco per non fare la frittata.",
    fonte: ""
  },
  {
    id: "tiramisu",
    titolo: "Tiramisù",
    categoria: "Dolci",
    tag: ["senza cottura", "classico"],
    porzioni: 6,
    tempo: 30,
    difficolta: "Facile",
    ingredienti: [
      { q: 500, u: "g", n: "mascarpone" },
      { q: 4, u: "", n: "uova" },
      { q: 100, u: "g", n: "zucchero" },
      { q: 300, u: "g", n: "savoiardi" },
      { q: 300, u: "ml", n: "caffè" },
      { q: null, u: "", n: "cacao amaro q.b." }
    ],
    procedimento: [
      "Prepara il caffè e lascialo raffreddare.",
      "Monta i tuorli con lo zucchero finché sono chiari e spumosi, poi incorpora il mascarpone.",
      "Monta gli albumi a neve ben ferma e uniscili delicatamente alla crema.",
      "Inzuppa velocemente i savoiardi nel caffè e fai uno strato sul fondo della pirofila, poi copri con la crema. Ripeti.",
      "Spolvera di cacao e lascia in frigo almeno 4 ore."
    ],
    note: "Meglio se preparato il giorno prima.",
    fonte: ""
  },
  {
    id: "pancake",
    titolo: "Pancake americani",
    categoria: "Colazione",
    tag: ["veloce", "dolce"],
    porzioni: 2,
    tempo: 20,
    difficolta: "Facile",
    ingredienti: [
      { q: 150, u: "g", n: "farina 00" },
      { q: 200, u: "ml", n: "latte" },
      { q: 1, u: "", n: "uovo" },
      { q: 20, u: "g", n: "zucchero" },
      { q: 25, u: "g", n: "burro fuso" },
      { q: 6, u: "g", n: "lievito per dolci" },
      { q: 1, u: "pizzico", n: "sale" }
    ],
    procedimento: [
      "Mescola farina, lievito, zucchero e sale in una ciotola.",
      "A parte sbatti uovo, latte e burro fuso.",
      "Unisci i liquidi ai secchi mescolando poco: qualche grumo va bene.",
      "Cuoci un mestolo alla volta in una padella antiaderente calda, girando quando compaiono le bollicine."
    ],
    note: "",
    fonte: ""
  }
];
