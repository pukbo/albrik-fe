import {
  FILTRI_VUOTI,
  applicaFiltri,
  contaFiltriAttivi,
  filtriDaQuery,
  opzioniFiltri,
  queryDaFiltri,
} from './filtri-catalogo';
import { Prodotto } from './prodotti-api';

function prodotto(slug: string, marca: string, v: Partial<Prodotto['valutazioni']>, extra: Partial<Prodotto> = {}): Prodotto {
  return {
    categoria: 'CALDAIA',
    slug,
    percorso: `/caldaie/${slug}`,
    marca,
    modello: slug,
    nome: `${marca} ${slug}`,
    sommario: '',
    descrizione: '',
    potenzaKw: 24,
    classeEnergetica: 'A',
    valutazioni: { efficienza: 3, smart: 3, silenziosita: 3, fasciaPrezzo: 3, livello: 3, ...v },
    metaTitle: '',
    metaDescription: '',
    immagine: null,
    ultimaModifica: null,
    ...extra,
  };
}

const catalogo = [
  prodotto('eco', 'Termika', { fasciaPrezzo: 2, livello: 3, smart: 2 }),
  prodotto('smart', 'Termika', { fasciaPrezzo: 4, livello: 5, smart: 5, efficienza: 5 }, { potenzaKw: 28, classeEnergetica: 'A+' }),
  prodotto('base', 'Calora', { fasciaPrezzo: 1, livello: 2, smart: 1 }),
  prodotto('silent', 'Calòra', { fasciaPrezzo: 5, livello: 4, smart: 3 }, { potenzaKw: 35, classeEnergetica: 'A+' }),
];

describe('filtri del catalogo', () => {
  it('filtra per marca (senza badare ad accenti e maiuscole), prezzo e smart', () => {
    expect(applicaFiltri(catalogo, { ...FILTRI_VUOTI, marche: ['calora'] }).map((p) => p.slug)).toEqual(['base', 'silent']);
    expect(applicaFiltri(catalogo, { ...FILTRI_VUOTI, prezzoMax: 2 }).map((p) => p.slug)).toEqual(['eco', 'base']);
    expect(applicaFiltri(catalogo, { ...FILTRI_VUOTI, soloSmart: true }).map((p) => p.slug)).toEqual(['smart']);
  });

  it('cerca su marca e modello e combina i filtri', () => {
    expect(applicaFiltri(catalogo, { ...FILTRI_VUOTI, q: 'termika sm' }).map((p) => p.slug)).toEqual(['smart']);
    const f = { ...FILTRI_VUOTI, classi: ['A+'], potenze: ['35'] };
    expect(applicaFiltri(catalogo, f).map((p) => p.slug)).toEqual(['silent']);
  });

  it("ordina senza perdere l'ordine del pannello a parità", () => {
    expect(applicaFiltri(catalogo, { ...FILTRI_VUOTI, ordina: 'prezzo-asc' }).map((p) => p.slug)).toEqual([
      'base',
      'eco',
      'smart',
      'silent',
    ]);
    expect(applicaFiltri(catalogo, { ...FILTRI_VUOTI, ordina: 'livello' })[0].slug).toBe('smart');
    expect(applicaFiltri(catalogo, FILTRI_VUOTI).map((p) => p.slug)).toEqual(['eco', 'smart', 'base', 'silent']);
  });

  it('va e torna dalla query string, ignorando valori non validi', () => {
    const f = { ...FILTRI_VUOTI, marche: ['termika'], prezzoMax: 3, soloSmart: true, ordina: 'livello' as const };
    expect(queryDaFiltri(f)).toMatchObject({ marca: 'termika', prezzo: '3', smart: '1', ordina: 'livello', q: null });
    expect(filtriDaQuery({ marca: 'termika', prezzo: '3', smart: '1', ordina: 'livello' })).toEqual(f);
    expect(filtriDaQuery({ prezzo: '9', ordina: 'a-caso' })).toEqual(FILTRI_VUOTI);
    expect(contaFiltriAttivi(f)).toBe(3);
  });

  it('ricava le opzioni dai modelli, con i conteggi', () => {
    const o = opzioniFiltri(catalogo);
    expect(o.marche).toEqual([
      { valore: 'calora', etichetta: 'Calora', conteggio: 2 },
      { valore: 'termika', etichetta: 'Termika', conteggio: 2 },
    ]);
    expect(o.potenze.map((p) => p.etichetta)).toEqual(['24 kW', '28 kW', '35 kW']);
    expect(o.classi.map((c) => c.valore)).toEqual(['A+', 'A']);
    expect(o.prezzi).toEqual([1, 2, 4, 5]);
    expect(o.conSmart).toBe(true);
  });
});
