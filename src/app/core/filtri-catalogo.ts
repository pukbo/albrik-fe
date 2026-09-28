import { Prodotto, potenzaLeggibile } from './prodotti-api';

export type Ordinamento = 'consigliati' | 'livello' | 'prezzo-asc' | 'prezzo-desc' | 'efficienza';

export const ORDINAMENTI: { valore: Ordinamento; etichetta: string }[] = [
  { valore: 'consigliati', etichetta: 'Consigliati' },
  { valore: 'livello', etichetta: 'Livello più alto' },
  { valore: 'efficienza', etichetta: 'Più efficienti' },
  { valore: 'prezzo-asc', etichetta: 'Prezzo: dal più basso' },
  { valore: 'prezzo-desc', etichetta: 'Prezzo: dal più alto' },
];

/** Valutazione "smart" da cui un modello conta come smart (Wi-Fi, app). */
export const SOGLIA_SMART = 4;

/** Filtri del catalogo. Stanno anche nell'indirizzo della pagina (query string), così si possono condividere. */
export interface Filtri {
  /** Ricerca libera su marca e modello. */
  q: string;
  marche: string[];
  /** Potenze in kW, come stringhe (es. "24", "3.5"). */
  potenze: string[];
  classi: string[];
  /** Fascia di prezzo massima (1-5); null = qualsiasi. */
  prezzoMax: number | null;
  soloSmart: boolean;
  ordina: Ordinamento;
}

export interface OpzioneFiltro {
  valore: string;
  etichetta: string;
  /** Quanti modelli hanno questo valore. */
  conteggio: number;
}

export const FILTRI_VUOTI: Filtri = {
  q: '',
  marche: [],
  potenze: [],
  classi: [],
  prezzoMax: null,
  soloSmart: false,
  ordina: 'consigliati',
};

/** Parametri della query string (es. da input() del router). */
export interface QueryFiltri {
  q?: string;
  marca?: string;
  potenza?: string;
  classe?: string;
  prezzo?: string;
  smart?: string;
  ordina?: string;
}

const lista = (testo: string | undefined) => (testo ? testo.split(',').map((v) => v.trim()).filter(Boolean) : []);

function normalizza(testo: string): string {
  return testo.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function chiaveMarca(marca: string): string {
  return normalizza(marca).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function filtriDaQuery(query: QueryFiltri): Filtri {
  const prezzo = Number(query.prezzo);
  const ordina = ORDINAMENTI.some((o) => o.valore === query.ordina) ? (query.ordina as Ordinamento) : 'consigliati';
  return {
    q: query.q?.trim() ?? '',
    marche: lista(query.marca),
    potenze: lista(query.potenza),
    classi: lista(query.classe),
    prezzoMax: prezzo >= 1 && prezzo <= 5 ? Math.round(prezzo) : null,
    soloSmart: query.smart === '1',
    ordina,
  };
}

/** Query string dei filtri: solo quelli attivi (i valori null tolgono il parametro dall'indirizzo). */
export function queryDaFiltri(f: Filtri): Record<string, string | null> {
  return {
    q: f.q || null,
    marca: f.marche.length ? f.marche.join(',') : null,
    potenza: f.potenze.length ? f.potenze.join(',') : null,
    classe: f.classi.length ? f.classi.join(',') : null,
    prezzo: f.prezzoMax ? String(f.prezzoMax) : null,
    smart: f.soloSmart ? '1' : null,
    ordina: f.ordina !== 'consigliati' ? f.ordina : null,
  };
}

/** Numero di filtri attivi (l'ordinamento e la ricerca non contano). */
export function contaFiltriAttivi(f: Filtri): number {
  return f.marche.length + f.potenze.length + f.classi.length + (f.prezzoMax ? 1 : 0) + (f.soloSmart ? 1 : 0);
}

export function applicaFiltri(prodotti: Prodotto[], f: Filtri): Prodotto[] {
  const cerca = normalizza(f.q);
  const risultato = prodotti.filter(
    (p) =>
      (!cerca || normalizza(`${p.marca} ${p.modello}`).includes(cerca)) &&
      (!f.marche.length || f.marche.includes(chiaveMarca(p.marca))) &&
      (!f.potenze.length || (p.potenzaKw !== null && f.potenze.includes(String(p.potenzaKw)))) &&
      (!f.classi.length || (p.classeEnergetica !== null && f.classi.includes(p.classeEnergetica))) &&
      (!f.prezzoMax || p.valutazioni.fasciaPrezzo <= f.prezzoMax) &&
      (!f.soloSmart || p.valutazioni.smart >= SOGLIA_SMART),
  );

  const confronto: Record<Ordinamento, ((a: Prodotto, b: Prodotto) => number) | null> = {
    consigliati: null, // ordine deciso dal pannello
    livello: (a, b) => b.valutazioni.livello - a.valutazioni.livello || b.valutazioni.efficienza - a.valutazioni.efficienza,
    efficienza: (a, b) => b.valutazioni.efficienza - a.valutazioni.efficienza || b.valutazioni.livello - a.valutazioni.livello,
    'prezzo-asc': (a, b) => a.valutazioni.fasciaPrezzo - b.valutazioni.fasciaPrezzo,
    'prezzo-desc': (a, b) => b.valutazioni.fasciaPrezzo - a.valutazioni.fasciaPrezzo,
  };
  const ordina = confronto[f.ordina];
  // sort stabile: a parità resta l'ordine del pannello
  return ordina ? [...risultato].sort(ordina) : risultato;
}

/** Ordine delle classi energetiche, dalla migliore. */
const ORDINE_CLASSI = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

function indiceClasse(classe: string): number {
  const i = ORDINE_CLASSI.indexOf(classe.toUpperCase());
  return i === -1 ? ORDINE_CLASSI.length : i;
}

/** Opzioni dei filtri ricavate dai modelli presenti: una marca nuova compare da sola. */
export function opzioniFiltri(prodotti: Prodotto[]): {
  marche: OpzioneFiltro[];
  potenze: OpzioneFiltro[];
  classi: OpzioneFiltro[];
  prezzi: number[];
  conSmart: boolean;
} {
  const conta = <K>(chiave: (p: Prodotto) => K | null) => {
    const mappa = new Map<K, { p: Prodotto; n: number }>();
    for (const p of prodotti) {
      const k = chiave(p);
      if (k === null) continue;
      const voce = mappa.get(k);
      mappa.set(k, { p: voce?.p ?? p, n: (voce?.n ?? 0) + 1 });
    }
    return mappa;
  };

  const marche = [...conta((p) => chiaveMarca(p.marca))]
    .map(([valore, { p, n }]) => ({ valore, etichetta: p.marca, conteggio: n }))
    .sort((a, b) => a.etichetta.localeCompare(b.etichetta, 'it'));

  const potenze = [...conta((p) => p.potenzaKw)]
    .sort(([a], [b]) => a - b)
    .map(([kw, { p, n }]) => ({ valore: String(kw), etichetta: potenzaLeggibile(p) ?? `${kw} kW`, conteggio: n }));

  const classi = [...conta((p) => p.classeEnergetica)]
    .map(([valore, { n }]) => ({ valore, etichetta: valore, conteggio: n }))
    .sort((a, b) => indiceClasse(a.valore) - indiceClasse(b.valore));

  const prezzi = [...new Set(prodotti.map((p) => p.valutazioni.fasciaPrezzo))].sort((a, b) => a - b);

  return { marche, potenze, classi, prezzi, conSmart: prodotti.some((p) => p.valutazioni.smart >= SOGLIA_SMART) };
}
